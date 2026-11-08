# vvw.tw 前端優化建議報告

本報告針對 `vvw.tw` (亨波趨勢 HENGBO TREND) 的前端專案進行深度分析，涵蓋效能優化、程式碼架構、使用者體驗 (UX) 及安全性四大面向。

---

## 1. 效能優化 (Performance)

### 1.1 路由與資源懶加載 (Code Splitting)
**現狀**：專案目前使用 Vite 進行建置，但 `App.tsx` 中包含了大量的邏輯，且 `AI.tsx` 引用了 `pdfjs-dist`、`mammoth` 等重量級函式庫。
**建議**：
*   **動態匯入 (Dynamic Import)**：對 `AI.tsx` 頁面使用 `React.lazy` 進行懶加載，避免首頁加載時下載不必要的 AI 相關函式庫。
*   **分包策略 (Manual Chunks)**：在 `vite.config.ts` 中配置 `build.rollupOptions.output.manualChunks`，將 `lucide-react`、`motion` 等共用庫拆分為獨立的 vendor bundle。

### 1.2 圖片優化
**現狀**：網站大量使用 `/logo.png` 且無響應式圖片處理。
**建議**：
*   **轉換格式**：將圖片轉換為 WebP 或 AVIF 格式以減少體積。
*   **響應式圖片**：針對不同螢幕尺寸提供不同解析度的圖片，或使用 Vite 的圖片插件進行自動處理。

---

## 2. 程式碼架構與維護性 (Maintainability)

### 2.1 消除重複程式碼 (DRY)
**現狀**：`App.tsx` 中包含了完整的導覽列 (Navbar) 與頁面內容邏輯，而 `src/components/Navbar.tsx` 卻又存在一套基於 `react-router-dom` 的導覽邏輯。
**建議**：
*   **統一導覽列**：刪除 `App.tsx` 內部的 `Navbar` 元件，統一使用 `src/components/Navbar.tsx`。
*   **佈局重構**：利用 `src/layout/MainLayout.tsx` 配合 `Outlet` 實現真正的路由佈局，而非在 `App.tsx` 中使用 `activeTab` 狀態切換視圖。

### 2.2 狀態管理優化
**現狀**：`AI.tsx` 頁面狀態極其複雜（登入、對話、檔案處理、搜尋等全部混在一起）。
**建議**：
*   **自定義 Hooks**：將 AI 對話邏輯、檔案解析邏輯分別抽離至 `useAIChat` 與 `useFileParser` 等 Hooks 中。
*   **Context API**：全域狀態（如登入狀態）應考慮使用 React Context 管理，避免 Prop Drilling。

---

## 3. 使用者體驗 (UX)

### 3.1 表單驗證與回饋
**現狀**：`Contact.tsx` 的表單僅有基礎的 HTML `required` 驗證。
**建議**：
*   **即時驗證**：引入 `react-hook-form` 配合 `zod` 進行更嚴謹的用戶輸入驗證（如 Email 格式、電話號碼長度）。
*   **無障礙性 (A11y)**：確保所有 Input 都有對應的 `id` 與 `label` 關聯，提升螢幕閱讀器相容性。

### 3.2 AI 互動優化
**現狀**：AI 訊息串流 (Streaming) 雖已實現，但 PDF Worker 的加載方式可能阻塞 UI。
**建議**：
*   **骨架屏 (Skeleton Screens)**：在 AI 回覆生成前提供更細緻的加載回饋。
*   **虛擬滾動 (Virtual Scroll)**：當對話歷史過長時，使用虛擬列表技術減少 DOM 節點數量。

---

## 4. 安全性 (Security)

### 4.1 敏感資訊保護
**現狀**：`GEMINI_API_KEY` 與管理員密碼預設值（如 `hengbo2026`）被寫死在 `constants/index.ts` 或 `App.tsx` 中。
**建議**：
*   **後端代理**：**強烈建議**將 AI 調用邏輯移至後端（如 `server/routes/proxy.ts`），前端僅調用自己的 API。目前直接在前端暴露 API Key 會導致額度被盜刷。
*   **環境變數隔離**：確保 `.env` 檔案不進入版本控制，並在 Vercel/生產環境中正確設置。

### 4.2 登入機制升級
**現狀**：AI 頁面採用純前端比對帳密，極易被繞過。
**建議**：
*   **JWT 驗證**：後端驗證成功後回傳 Token，前端存儲於 HttpOnly Cookie 中，而非簡單的 `isLoggedIn` 狀態。

---

## 5. 總結優化清單 (Quick Wins)

| 項目 | 優先級 | 預期收益 |
| :--- | :--- | :--- |
| **移除 App.tsx 重複程式碼** | 高 | 提升開發效率與程式碼一致性 |
| **AI 調用轉移至後端代理** | 高 | **安全性關鍵**，防止 Key 洩漏 |
| **實施路由懶加載** | 中 | 提升首頁加載速度 (LCP) |
| **圖片轉 WebP 格式** | 中 | 減少流量消耗 |
| **引入嚴謹表單驗證** | 低 | 減少無效數據提交 |

以上建議旨在將 `vvw.tw` 從目前的快速原型階段提升至更專業、安全且高效的生產級應用。
