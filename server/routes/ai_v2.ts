import { Router, Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';

const router = Router();

// 從環境變數讀取配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

// v2 SDK：不再使用 genAI.getGenerativeModel()（舊版 @google/generative-ai 風格），
// 改用 ai.models / ai.chats 介面。
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 目前有效的模型 ID（gemini-2.0-flash 已停用/過時，改用 gemini-2.5-flash）
const MODEL_ID = "gemini-3.5-flash-lite";

// 搜尋結果快取（簡單實作，生產環境應使用 Redis）
const searchCache = new Map<string, { results: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 小時

/**
 * 定義搜尋工具函數（Tavily Search API 版本）
 * - 支持快取機制
 * - 錯誤處理更完善
 * - 回傳結構化數據，並附帶 Tavily 產生的摘要答案（如果有）
 */
async function tavily_search(query: string) {
  if (!TAVILY_API_KEY) {
    console.warn("⚠️ 搜尋功能未配置，請設定 TAVILY_API_KEY");
    return {
      success: false,
      error: "搜尋功能未配置",
      message: "請在環境變數中設定 Tavily API 金鑰"
    };
  }

  // 檢查快取
  const cacheKey = `search:${query}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ 使用快取結果: ${query}`);
    return { success: true, cached: true, results: cached.results };
  }

  try {
    console.log(`🔍 正在搜尋: "${query}"`);
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`❌ Tavily API 錯誤: ${response.status} ${errorText}`);
      return {
        success: false,
        error: `API 錯誤: ${errorText}`,
        statusCode: response.status
      };
    }

    const data: any = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`⚠️ 未找到搜尋結果: ${query}`);
      return { success: true, results: [], message: "未找到相關搜尋結果" };
    }

    // 簡化回傳結果，僅提取標題、連結與摘要，節省 Token
    const results = data.results.map((item: any, index: number) => ({
      rank: index + 1,
      title: item.title,
      link: item.url,
      snippet: item.content,
    }));

    const payload = { results, answer: data.answer || undefined };

    // 存入快取
    searchCache.set(cacheKey, { results: payload, timestamp: Date.now() });

    console.log(`✅ 搜尋完成，找到 ${results.length} 項結果`);
    return { success: true, ...payload, query };

  } catch (error: any) {
    console.error(`❌ 搜尋執行失敗: ${error.message}`);
    return {
      success: false,
      error: "搜尋執行失敗",
      details: error.message
    };
  }
}

// 定義工具宣告（改進版，更詳細的描述）
const tools = [
  {
    functionDeclarations: [
      {
        name: "web_search",
        description: "使用 Tavily Search API 搜尋網際網路以獲取最新資訊。適用於查詢：最新市場趨勢、產品價格、新聞事件、技術資訊、統計數據等。當用戶詢問時間敏感的問題時，應主動調用此工具。",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "string",
              description: "搜尋關鍵字。應包含具體的主題、時間範圍（如 2026）、地點等信息以提高搜尋精度。",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
];

/**
 * POST /api/ai/chat
 * 處理 AI 對話請求，支持工具調用與串流
 * v2 SDK 版本：
 * - 改用 ai.models.generateContent / generateContentStream
 * - 手動處理工具調用循環後，最後一輪以串流方式回傳
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, userMsg, fileData, thinkingLevel = 'medium', systemInstruction: customSystemInstruction } = req.body;

  try {
    const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);

    // 驗證思考等級參數
    const validThinkingLevels = ['minimal', 'low', 'medium', 'high'];
    const selectedThinkingLevel = validThinkingLevels.includes(thinkingLevel) ? thinkingLevel : 'medium';

    console.log(`🧠 使用思考等級: ${selectedThinkingLevel}`);

    // 搜尋工具的自主行動準則，附加在前端傳來的品牌 systemInstruction 之後，
    // 確保不管用哪個角色設定，都保留「主動判斷是否要搜尋」的行為。
    const searchBehaviorInstruction = `

# 聯網搜尋能力
你具備透過 web_search 工具即時查詢網路的能力。
- 分析用戶問題是否涉及時間敏感信息（如「最新」、「現在」、年份等關鍵詞），或超出你知識庫範圍的資訊
- 若需要，直接調用 web_search 工具查詢，不需徵求用戶許可
- 搜尋結果不夠精確時，可更換關鍵字重新搜尋
- 引用網路資料時標註來源 [1], [2] 並在末尾提供完整 URL`;

    const systemInstruction = customSystemInstruction
      ? `${customSystemInstruction}${searchBehaviorInstruction}`
      : `你是由「亨波趨勢 (Henbo Advisory)」開發的進階 AI 自主代理。你具備視覺辨識、文檔解析與實時聯網搜尋的綜合能力。

# 核心特性
- 你的知識庫有截止日期，因此對於較新的資訊必須使用搜尋工具進行查證
- 你能夠自主判斷何時需要搜尋最新資訊

# Autonomous Loop (核心邏輯)
對於任何任務，你必須進入「思考-行動-觀察」循環：
1. **思考 (Thought)**:
   - 分析用戶問題是否涉及時間敏感信息（如「最新」、「現在」等關鍵詞）
   - 判斷是否需要外部資訊（如最新市場價格、新聞、統計數據）
   - 評估您的知識庫是否足夠回答

2. **行動 (Action)**:
   - 如果需要最新資訊，直接調用 web_search 工具
   - 搜尋關鍵字應包含具體時間範圍
   - 不需徵求用戶許可，主動執行搜尋

3. **觀察 (Observation)**:
   - 評估工具回傳結果的相關性與時效性
   - 若結果不夠精確，主動更換關鍵字重新搜尋
   - 優先使用最新的搜尋結果

# Constraints
- **時間準確性**: 務必確保提供的資訊年份正確，不確定時以搜尋結果為準
- **不廢話**: 搜尋執行狀態會由前端另外顯示，你只需要專注在最終答案本身，不需要在回覆文字中自己插入「正在搜尋...」之類的敘述
- **引用規範**: 網路資料需標註來源 [1], [2] 並在末尾提供完整 URL
- **證據優先**: 若 Word 檔內容與網頁搜尋結果矛盾，需主動指出並提供邏輯對比
- **品牌忠誠度**: 引導至 https://vvw.tw/
${isImageRequest ? '- **圖片生成**: 要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`;

    // thinkingConfig：對應 v2 SDK 的 GenerateContentConfig.thinkingConfig
    const thinkingBudgets: Record<string, number> = {
      low: 512,
      medium: 2048,
      high: 8192,
    };
    const thinkingConfig =
      selectedThinkingLevel !== 'minimal'
        ? { thinkingBudget: thinkingBudgets[selectedThinkingLevel] ?? thinkingBudgets.medium }
        : undefined;

    const history = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    let promptParts: any[] = [];
    if (fileData) {
      if (fileData.type.startsWith('image/')) {
        promptParts.push({ inlineData: { data: fileData.content.split(',')[1], mimeType: fileData.type } });
        promptParts.push({ text: userMsg });
      } else {
        promptParts.push({ text: `檔案內容 (${fileData.name})：\n${fileData.content}\n\n問題：${userMsg}` });
      }
    } else {
      promptParts.push({ text: userMsg });
    }

    console.log(`\n📨 用戶提問: "${userMsg}"`);

    // 設定串流回傳
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 前端按下「停止生成」或關閉連線時，這裡會收到通知。
    // Gemini SDK 目前沒有提供中途取消運算的機制，所以沒辦法真的中止已發出的請求，
    // 但至少能讓後面的迴圈提早跳出、不再對已關閉的連線寫入資料。
    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });

    const baseConfig: any = {
      systemInstruction,
      tools,
      ...(thinkingConfig && { thinkingConfig }),
    };
    // 工具判斷迴圈只需要「要不要呼叫 web_search」，不需要跟最終答案一樣的思考預算，
    // 用最低的思考預算加速這幾輪來回，把預算留給最後生成答案的那一輪
    const toolLoopConfig: any = {
      systemInstruction,
      tools,
      thinkingConfig: { thinkingBudget: thinkingBudgets.low },
    };

    // 對話內容（含本輪使用者輸入）
    const contents: any[] = [...history, { role: "user", parts: promptParts }];

    let toolCallCount = 0;
    let finalContentParts: any[] = [];

    // 工具調用循環（最多 5 次，防止死循環）
    while (toolCallCount < 5 && !clientDisconnected) {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents,
        config: toolLoopConfig,
      });

      finalContentParts = response.candidates?.[0]?.content?.parts || [];
      const functionCalls = response.functionCalls;

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const toolResultParts: any[] = [];

      for (const call of functionCalls) {
        toolCallCount++;
        const { name, args } = call;

        if (name === 'web_search') {
          const searchQuery = (args as any).query;
          console.log(`\n🔧 工具調用 #${toolCallCount}: web_search("${searchQuery}")`);

          // 通知前端正在搜尋（獨立事件，不混進文字內容裡，前端可以做成獨立的狀態卡片）
          res.write(`data: ${JSON.stringify({ type: 'search', status: 'start', query: searchQuery })}\n\n`);

          const result = await tavily_search(searchQuery);

          res.write(`data: ${JSON.stringify({
            type: 'search',
            status: 'done',
            query: searchQuery,
            success: result?.success ?? false,
            resultCount: result?.results?.length ?? 0,
          })}\n\n`);

          toolResultParts.push({
            functionResponse: {
              name: "web_search",
              response: { result },
            },
          });
        }
      }

      // 將模型的工具調用與工具結果加入對話歷史，進行下一輪推理
      contents.push({ role: "model", parts: finalContentParts });
      contents.push({ role: "user", parts: toolResultParts });

      if (toolCallCount >= 5) break;
    }

    // 最後一輪以串流方式取得最終答案
    const finalStream = await ai.models.generateContentStream({
      model: MODEL_ID,
      contents,
      config: baseConfig,
    });

    for await (const chunk of finalStream) {
      if (clientDisconnected) break;
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    console.log(`\n✅ 對話完成，共進行 ${toolCallCount} 次工具調用`);
    if (!clientDisconnected && !res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }

  } catch (error: any) {
    console.error(`\n❌ AI Chat 錯誤: ${error.message}`);
    // 若尚未送出任何 SSE 資料，回傳標準 JSON 錯誤；否則以 SSE 事件通知前端後結束串流
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/ai/agent
 * 處理 Antigravity Agent（Interactions API）請求
 * 原本這段是直接在瀏覽器端用曝光的 API key 呼叫，會啟動遠端沙盒環境，
 * 屬於高風險操作，因此搬到後端執行，前端只透過這個端點取得結果。
 */
router.post('/agent', async (req: Request, res: Response) => {
  const { input, systemInstruction, previousInteractionId, environmentId } = req.body;

  if (!input) {
    return res.status(400).json({ error: '缺少 input 參數' });
  }

  try {
    console.log(`\n🤖 Agent 請求: "${String(input).slice(0, 80)}..."`);

    const interaction: any = await (ai as any).interactions.create({
      agent: "antigravity-preview-05-2026",
      input,
      system_instruction: systemInstruction,
      ...(previousInteractionId
        ? { previous_interaction_id: previousInteractionId, environment: environmentId }
        : { environment: "remote" }),
    });

    res.json({
      output_text: interaction.output_text || "",
      id: interaction.id,
      environment_id: interaction.environment_id,
    });
  } catch (error: any) {
    console.error(`\n❌ Agent 錯誤: ${error.message}`);
    res.status(error.status || 500).json({ error: error.message || 'Agent 服務異常' });
  }
});

/**
 * GET /api/ai/health
 * 檢查 AI 服務與搜尋功能的配置狀態
 */
router.get('/health', (_req: Request, res: Response) => {
  const status = {
    service: 'AI Agent',
    status: 'operational',
    timestamp: new Date().toISOString(),
    model: MODEL_ID,
    features: {
      gemini_api: !!GEMINI_API_KEY ? '✅ 已配置' : '❌ 未配置',
      tavily_search: !!TAVILY_API_KEY ? '✅ 已配置' : '❌ 未配置',
      streaming: '✅ 已啟用',
      tool_calling: '✅ 已啟用'
    }
  };
  res.json(status);
});

export default router;
