# 亨波 AI 代理：聯網搜尋功能展示

## 功能概述
優化後的 AI 顧問已升級為**自主代理**，具備以下核心能力：

### 1. 自主決策與聯網搜尋
**系統提示詞**中的「思考-行動-觀察」循環使 AI 能夠：
- **思考 (Thought)**：分析用戶需求，判斷是否需要外部資訊
- **行動 (Action)**：主動調用 `google_search` 工具進行網路搜尋
- **觀察 (Observation)**：評估結果，必要時重新搜尋

### 2. 後端代理架構
```
前端 (AI.tsx) 
  ↓ POST /api/ai/chat
後端 (server/routes/ai.ts)
  ├─ 驗證請求
  ├─ 初始化 Gemini 模型（含 Function Calling）
  ├─ 調用 google_search 工具（如需要）
  └─ 串流回傳結果
```

### 3. Function Calling 工具
已在後端註冊 `google_search` 工具，允許 AI 自主調用：
```javascript
{
  name: "google_search",
  description: "搜尋網際網路以獲取最新資訊、價格、新聞或事實校對。",
  parameters: {
    type: "OBJECT",
    properties: {
      query: { type: "string", description: "搜尋關鍵字" }
    }
  }
}
```

---

## 使用範例

### 場景 1：查詢最新市場趨勢
**用戶提問**：「2026 年台灣 AI 市場的最新發展趨勢是什麼？」

**AI 代理執行流程**：
1. 🧠 **思考**：用戶詢問最新趨勢，需要即時資訊
2. 🔍 **行動**：調用 `google_search("2026 台灣 AI 市場趨勢")`
3. 📊 **觀察**：收到搜尋結果，提取相關新聞與數據
4. 💬 **回覆**：
   ```
   根據最新搜尋結果，2026 年台灣 AI 市場呈現以下趨勢：
   
   [1] 企業 AI 應用加速：根據 XXX 報告...
   [2] 人才缺口擴大：台灣 AI 工程師需求增長 XX%...
   [3] 政府扶持政策：經濟部推出新一輪補助計畫...
   
   參考來源：
   [1] https://example.com/ai-market-2026
   [2] https://example.com/talent-gap
   [3] https://example.com/govt-support
   ```

### 場景 2：多模態對比驗證
**用戶操作**：上傳一份舊的產品報價單 + 提問「這個價格現在還合理嗎？」

**AI 代理執行流程**：
1. 📄 **解析**：讀取 PDF 中的產品名稱與價格
2. 🔍 **搜尋**：調用 `google_search("產品名 現在價格 2026")`
3. 🔄 **對比**：比較舊報價與現在市價
4. 💬 **回覆**：
   ```
   您上傳的報價單中：
   - 產品 A：舊價 $XXX → 現在市價 $YYY (降低 XX%)
   - 產品 B：舊價 $XXX → 現在市價 $YYY (上升 XX%)
   
   建議：根據最新行情，您可以重新協商...
   ```

---

## 技術實作細節

### 後端 API 端點
```
POST /api/ai/chat
Content-Type: application/json

請求體：
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "ai", "content": "..." }
  ],
  "userMsg": "用戶新訊息",
  "fileData": {
    "name": "document.pdf",
    "type": "application/pdf",
    "content": "base64編碼內容"
  }
}

回應：Server-Sent Events (SSE) 串流
data: {"text": "AI 回覆的第一部分"}
data: {"text": "AI 回覆的第二部分"}
...
data: [DONE]
```

### 安全性保障
- ✅ API Key 存儲於後端環境變數，不暴露於前端
- ✅ Google Search 工具調用受後端控制
- ✅ 前端僅負責 UI 渲染與串流接收
- ✅ 支持後續添加 JWT/Session 驗證

---

## 環境配置

為了完整啟用聯網搜尋功能，需要配置以下環境變數：

```bash
# .env.local
GEMINI_API_KEY=your_actual_gemini_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
SEARCH_ENGINE_ID=your_custom_search_engine_id
```

### 獲取 Google Search 金鑰
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 **Custom Search API**
4. 建立 API 金鑰
5. 建立 **Programmable Search Engine**（取得 CX ID）

---

## 效能與限制

| 項目 | 設定 | 說明 |
| :--- | :--- | :--- |
| **MAX_AGENT_LOOPS** | 5 | 防止無限搜尋迴圈 |
| **API_TIMEOUT** | 60s | 預留網路搜尋時間 |
| **搜尋結果上限** | 10 項 | 節省 Token 消耗 |
| **每日搜尋配額** | 100 次 (免費層) | Google Custom Search 限制 |

---

## 下一步優化方向

1. **快取機制**：對常見查詢結果進行快取，減少 API 調用
2. **搜尋範圍精細化**：根據業務需求限制搜尋域名
3. **結果驗證**：多來源交叉驗證重要資訊
4. **成本優化**：切換至更經濟的搜尋方案（如 Bing Search）

---

**亨波 AI 代理已準備就緒，可開始處理更複雜的商業諮詢任務！** 🚀
