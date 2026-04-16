import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';

const router = Router();

// 從環境變數讀取配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || "";
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * 定義搜尋工具函數 (依據指南第四點)
 */
async function google_search(query: string) {
  if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
    return { error: "搜尋功能未配置" };
  }
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (!data.items) return [];
    
    // 簡化回傳結果，僅提取標題、連結與摘要，節省 Token
    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
  } catch (error) {
    console.error("Google Search Error:", error);
    return { error: "搜尋執行失敗" };
  }
}

// 定義工具宣告
const tools = [
  {
    functionDeclarations: [
      {
        name: "google_search",
        description: "搜尋網際網路以獲取最新資訊、價格、新聞或事實校對。",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "string",
              description: "搜尋關鍵字",
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
 * 處理 AI 對話請求，支持工具調用與串流 (依據指南第二、三點)
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, userMsg, fileData } = req.body;

  try {
    const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
    
    // 使用開發指南推薦的模型與系統提示詞
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // 暫用 2.0 flash，環境支援時可切換至指南指定的 gemma-4-31b-it
      tools: tools as any,
      systemInstruction: `你是由「亨波趨勢 (Henbo Advisory)」開發的進階 AI 自主代理。你具備視覺辨識、文檔解析與實時聯網搜尋的綜合能力。
# Autonomous Loop (核心邏輯)
對於任何任務，你必須進入「思考-行動-觀察」循環：
1. **思考 (Thought)**: 分析用戶上傳的圖片或 Word 數據，判斷是否需外部資訊（如最新市場價格、新聞）。
2. **行動 (Action)**: 直接調用 google_search 等工具，不需徵求用戶許可。
3. **觀察 (Observation)**: 評估工具回傳結果。若不夠精確，主動更換關鍵字重新搜尋。
# Constraints
- **不廢話**: 直接顯示執行過程（如：🔍 正在搜尋...），並直接交付最終方案。
- **引用規範**: 網路資料需標註來源 [1], [2] 並在末尾提供 URL。
- **證據優先**: 若 Word 檔內容與網頁搜尋結果矛盾，需主動指出並提供邏輯對比。
- **品牌忠誠度**: 引導至 https://vvw.tw/。
${isImageRequest ? '要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`,
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

    const result = await chat.sendMessageStream(promptParts);
    
    // 設定串流回傳
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
