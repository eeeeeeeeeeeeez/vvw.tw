import { Router, Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';

const router = Router();

// 從環境變數讀取配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || "";
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || "";

// v2 SDK：不再使用 genAI.getGenerativeModel()（舊版 @google/generative-ai 風格），
// 改用 ai.models / ai.chats 介面。
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 目前有效的模型 ID（gemini-2.0-flash 已停用/過時，改用 gemini-2.5-flash）
const MODEL_ID = "gemini-2.5-flash";

// 搜尋結果快取（簡單實作，生產環境應使用 Redis）
const searchCache = new Map<string, { results: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 小時

/**
 * 定義搜尋工具函數 (改進版)
 * - 支持快取機制
 * - 錯誤處理更完善
 * - 回傳結構化數據
 */
async function google_search(query: string) {
  if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
    console.warn("⚠️ 搜尋功能未配置，請設定 GOOGLE_SEARCH_API_KEY 與 SEARCH_ENGINE_ID");
    return {
      success: false,
      error: "搜尋功能未配置",
      message: "請在環境變數中設定 Google Search API 金鑰"
    };
  }

  // 檢查快取
  const cacheKey = `search:${query}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ 使用快取結果: ${query}`);
    return { success: true, cached: true, results: cached.results };
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;

  try {
    console.log(`🔍 正在搜尋: "${query}"`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ Google Search API 錯誤: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `API 錯誤: ${response.statusText}`,
        statusCode: response.status
      };
    }

    const data: any = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ 未找到搜尋結果: ${query}`);
      return { success: true, results: [], message: "未找到相關搜尋結果" };
    }

    // 簡化回傳結果，僅提取標題、連結與摘要，節省 Token
    const results = data.items.map((item: any, index: number) => ({
      rank: index + 1,
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    }));

    // 存入快取
    searchCache.set(cacheKey, { results, timestamp: Date.now() });

    console.log(`✅ 搜尋完成，找到 ${results.length} 項結果`);
    return { success: true, results, query };

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
        name: "google_search",
        description: "搜尋網際網路以獲取最新資訊。適用於查詢：最新市場趨勢、產品價格、新聞事件、技術資訊、統計數據等。當用戶詢問時間敏感的問題時，應主動調用此工具。",
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
  const { messages, userMsg, fileData, thinkingLevel = 'medium' } = req.body;

  try {
    const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);

    // 驗證思考等級參數
    const validThinkingLevels = ['minimal', 'low', 'medium', 'high'];
    const selectedThinkingLevel = validThinkingLevels.includes(thinkingLevel) ? thinkingLevel : 'medium';

    console.log(`🧠 使用思考等級: ${selectedThinkingLevel}`);

    const systemInstruction = `你是「亨波趨勢」的 AI 顧問，服務對象是企業客戶與內部顧問人員，能夠辨識圖片、解析文件，並在需要時查證最新資訊。

# 語氣與風格
- 專業、穩重、精簡，用詞正式但不生硬，不說客套話與贅語
- 先給結論與可執行的建議，需要時才補充推理過程或理由
- 不逐句描述你的搜尋或思考步驟，直接呈現查證後的結果；正在查證時僅需簡短提示（例如「查證中…」），不需列出完整搜尋關鍵字或內部推理
- 遇到不確定、可能過時，或涉及「最新」「現在」等時間敏感的問題（如市場數據、新聞、法規、統計數字），主動使用 google_search 工具查證後再回答，不需詢問使用者是否要搜尋
- 若查證結果彼此矛盾，或與使用者提供的檔案內容不一致，需明確指出差異並說明依據
- 引用網路資料時以 [1]、[2] 標註來源，並在回覆最後列出完整網址
- 僅在情境相關時，可提及亨波趨勢 https://vvw.tw/ 的相關服務，避免生硬置入
${isImageRequest ? '- 使用者要求產出圖片時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`;

    // thinkingConfig：對應 v2 SDK 的 GenerateContentConfig.thinkingConfig
    const thinkingBudgets: Record<string, number> = {
      low: 1024,
      medium: 8192,
      high: 24576,
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

    const baseConfig: any = {
      systemInstruction,
      tools,
      ...(thinkingConfig && { thinkingConfig }),
    };

    // 對話內容（含本輪使用者輸入）
    const contents: any[] = [...history, { role: "user", parts: promptParts }];

    let toolCallCount = 0;
    let finalContentParts: any[] = [];

    // 工具調用循環（最多 5 次，防止死循環）
    while (toolCallCount < 5) {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents,
        config: baseConfig,
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

        if (name === 'google_search') {
          const searchQuery = (args as any).query;
          console.log(`\n🔧 工具調用 #${toolCallCount}: google_search("${searchQuery}")`);

          // 通知前端正在查證，不外露具體搜尋關鍵字與內部推理
          res.write(`data: ${JSON.stringify({ text: `查證中…\n\n` })}\n\n`);

          const result = await google_search(searchQuery);
          toolResultParts.push({
            functionResponse: {
              name: "google_search",
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
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    console.log(`\n✅ 對話完成，共進行 ${toolCallCount} 次工具調用`);
    res.write('data: [DONE]\n\n');
    res.end();

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
      google_search: !!GOOGLE_SEARCH_API_KEY && !!SEARCH_ENGINE_ID ? '✅ 已配置' : '❌ 未配置',
      streaming: '✅ 已啟用',
      tool_calling: '✅ 已啟用'
    }
  };
  res.json(status);
});

export default router;
