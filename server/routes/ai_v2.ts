import { Router, Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';

const router = Router();

// 搜尋結果快取
const searchCache = new Map<string, { results: any; timestamp: number }>();
const CACHE_TTL = 3600000;

async function google_search(query: string) {
  const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || "";
  const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || "";

  console.log(`[Backend] Executing search for: "${query}"`);
  
  if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
    console.error("[Backend] Search config missing");
    return { success: false, error: "搜尋功能未配置，請設定環境變數" };
  }

  const cacheKey = `search:${query}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { success: true, cached: true, results: cached.results };
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;

  try {
    const response = await fetch(url, { timeout: 10000 });
    const data: any = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error?.message || response.statusText };
    }

    if (!data.items) return { success: true, results: [] };

    const results = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    searchCache.set(cacheKey, { results, timestamp: Date.now() });
    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "google_search",
        description: "搜尋網際網路以獲取最新資訊。當用戶詢問 2024 年以後的資訊或需要查證時，必須使用此工具。",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "string", description: "搜尋關鍵字" },
          },
          required: ["query"],
        },
      },
    ],
  },
];

router.post('/chat', async (req: Request, res: Response) => {
  const { messages, userMsg, fileData } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    return;
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: tools as any,
      systemInstruction: `你是由「亨波趨勢 (Henbo Advisory)」開發的進階 AI 自主代理。
當前日期是 2026 年 5 月 26 日。
重要指令：
1. 你的內置知識僅到 2024 年。對於任何涉及 2025 年、2026 年、或「最新」、「近期」、「今天」、「現在」的詢問，你必須先調用 google_search 工具獲取實時資訊。
2. 在執行搜尋前，請務必先輸出「🔍 正在搜尋：[關鍵字]...」。
3. 搜尋後，請結合搜尋結果與你的專業知識，給出具備時效性且詳細的回答。若搜尋不到結果，請誠實告知並基於已知趨勢提供分析。
${isImageRequest ? '要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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

    const chat = model.startChat({ history });
    let result = await chat.sendMessage(promptParts);
    let response = result.response;
    let parts = response.candidates?.[0]?.content?.parts || [];

    let toolCallCount = 0;
    while (parts.some(p => p.functionCall) && toolCallCount < 5) {
      toolCallCount++;
      const toolResults = [];

      for (const part of parts) {
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          if (name === 'google_search') {
            const query = (args as any).query;
            res.write(`data: ${JSON.stringify({ text: `🔍 正在搜尋：${query}...\n\n` })}\n\n`);
            
            const searchResult = await google_search(query);
            toolResults.push({
              functionResponse: {
                name: "google_search",
                response: searchResult
              }
            });
          }
        }
      }

      result = await chat.sendMessage(toolResults);
      response = result.response;
      parts = response.candidates?.[0]?.content?.parts || [];
    }

    const finalContent = response.text();
    res.write(`data: ${JSON.stringify({ text: finalContent })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error("[Backend] Error:", error);
    res.write(`data: ${JSON.stringify({ text: `❌ 服務異常：${error.message}` })}\n\n`);
    res.end();
  }
});

router.get('/status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    search_api: !!process.env.GOOGLE_SEARCH_API_KEY,
    search_id: !!process.env.SEARCH_ENGINE_ID,
    config_ok: !!(process.env.GEMINI_API_KEY && process.env.GOOGLE_SEARCH_API_KEY && process.env.SEARCH_ENGINE_ID)
  });
});

export default router;
