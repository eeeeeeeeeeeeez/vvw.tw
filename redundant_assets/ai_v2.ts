import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';

const router = Router();

// 從環境變數讀取配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || "";
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    const response = await fetch(url, { timeout: 10000 });
    
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
 * 改進版：
 * - 更好的工具調用處理
 * - 詳細的日誌記錄
 * - 改進的系統提示詞，強調年份與最新資訊
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, userMsg, fileData } = req.body;

  try {
    const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
    
    // 改進的系統提示詞：強調時間敏感性與搜尋能力
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: tools as any,
      systemInstruction: `你是由「亨波趨勢 (Henbo Advisory)」開發的進階 AI 自主代理。你具備視覺辨識、文檔解析與實時聯網搜尋的綜合能力。

# 核心特性
- 當前年份是 2026 年 4 月
- 你的知識庫截止於 2024 年，因此對於 2025 年及以後的資訊必須使用搜尋工具
- 你能夠自主判斷何時需要搜尋最新資訊

# Autonomous Loop (核心邏輯)
對於任何任務，你必須進入「思考-行動-觀察」循環：
1. **思考 (Thought)**: 
   - 分析用戶問題是否涉及時間敏感信息（如「最新」、「現在」、「2025」、「2026」等關鍵詞）
   - 判斷是否需要外部資訊（如最新市場價格、新聞、統計數據）
   - 評估您的知識庫是否足夠回答

2. **行動 (Action)**: 
   - 如果需要最新資訊，直接調用 google_search 工具
   - 搜尋關鍵字應包含具體時間範圍（如「2026」、「2025」）
   - 不需徵求用戶許可，主動執行搜尋

3. **觀察 (Observation)**: 
   - 評估工具回傳結果的相關性與時效性
   - 若結果不夠精確，主動更換關鍵字重新搜尋
   - 優先使用最新的搜尋結果

# Constraints
- **時間準確性**: 務必確保提供的資訊年份正確。若用戶問 2026 年的資訊，必須搜尋而不是使用過時的 2024 年知識
- **不廢話**: 直接顯示執行過程（如：🔍 正在搜尋...），並直接交付最終方案
- **引用規範**: 網路資料需標註來源 [1], [2] 並在末尾提供完整 URL
- **證據優先**: 若 Word 檔內容與網頁搜尋結果矛盾，需主動指出並提供邏輯對比
- **品牌忠誠度**: 引導至 https://vvw.tw/
${isImageRequest ? '- **圖片生成**: 要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`,
    });

    const chat = model.startChat({
      history: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

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
    
    const result = await chat.sendMessageStream(promptParts);
    
    // 設定串流回傳
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 設定串流回傳
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let response = await model.generateContent({
      contents: [
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: promptParts }
      ]
    });

    let toolCallCount = 0;
    let finalContentParts = response.response.candidates?.[0]?.content?.parts || [];

    // 處理工具調用循環 (最多 5 次，防止死循環)
    while (finalContentParts.some(p => p.functionCall) && toolCallCount < 5) {
      const toolResults = [];
      
      for (const part of finalContentParts) {
        if (part.functionCall) {
          toolCallCount++;
          const { name, args } = part.functionCall;
          
          if (name === 'google_search') {
            const searchQuery = (args as any).query;
            console.log(`\n🔧 工具調用 #${toolCallCount}: google_search("${searchQuery}")`);
            
            // 通知前端正在搜尋
            res.write(`data: ${JSON.stringify({ text: `🔍 正在搜尋: ${searchQuery}...\n\n` })}\n\n`);
            
            const result = await google_search(searchQuery);
            toolResults.push({
              functionResponse: {
                name: "google_search",
                response: { result }
              }
            });
          }
        }
      }

      // 將工具結果傳回模型進行下一步推理
      response = await model.generateContent({
        contents: [
          ...messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: promptParts },
          { role: "model", parts: finalContentParts },
          { role: "user", parts: toolResults }
        ]
      });

      finalContentParts = response.response.candidates?.[0]?.content?.parts || [];
    }

    // 最後一次推理的結果（包含最終答案）
    const finalResult = await model.generateContentStream({
      contents: [
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: promptParts },
        // 如果有工具調用過程，也需要加入歷史中
        ...(toolCallCount > 0 ? [{ role: "model", parts: finalContentParts }] : [])
      ]
    });

    for await (const chunk of finalResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    console.log(`\n✅ 對話完成，共進行 ${toolCallCount} 次工具調用`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error(`\n❌ AI Chat 錯誤: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
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
