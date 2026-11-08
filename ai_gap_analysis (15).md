# 亨波 AI 顧問：現狀與開發指南差異分析

根據新上傳的《自動化代理開發指南》，`vvw.tw` 現有的 AI 實作存在以下主要差異與優化空間：

## 1. 模型與架構 (Model & Architecture)
| 項目 | 現有實作 (Current) | 指南要求 (Guideline) | 建議動作 |
| :--- | :--- | :--- | :--- |
| **核心模型** | `gemini-1.5-flash` | `gemma-4-31b-it` | 升級模型版本，提升推理能力。 |
| **調用位置** | 前端直接調用 (Client-side) | 後端代理調用 (Server-side) | **高優先級**：將邏輯移至後端以保護 API Key。 |
| **自主決策** | 無 (僅簡單對話) | 思考-行動-觀察 (Thought-Action-Observation) | 引入系統提示詞引導 Agent 自主規劃。 |

## 2. 功能特性 (Features)
| 項目 | 現有實作 (Current) | 指南要求 (Guideline) | 建議動作 |
| :--- | :--- | :--- | :--- |
| **聯網搜尋** | 無 | 整合 Google Search API | 實作 Function Calling 工具調用。 |
| **工具調用** | 無 | 自主調用工具 (Function Calling) | 定義並註冊 `google_search` 工具。 |
| **多模態** | 基礎圖片/PDF/Word 解析 | 強化多模態對比與驗證 | 優化解析邏輯，支持跨文件/圖片的數據對比。 |

## 3. 安全性與配置 (Security & Config)
| 項目 | 現有實作 (Current) | 指南要求 (Guideline) | 建議動作 |
| :--- | :--- | :--- | :--- |
| **API Key 保護** | 暴露於前端代碼/環境變數 | 嚴禁外流至前端 | 移除前端 Key，改用後端 Session/Token 驗證。 |
| **控制參數** | 預設 | MAX_AGENT_LOOPS, API_TIMEOUT 等 | 在後端配置精確的運行參數。 |

## 4. 使用者介面 (UI/UX)
| 項目 | 現有實作 (Current) | 指南要求 (Guideline) | 建議動作 |
| :--- | :--- | :--- | :--- |
| **狀態回饋** | 簡單的 Typing 動態 | 顯示執行過程 (如：🔍 正在搜尋...) | 增加中間狀態顯示，提升透明度。 |
| **引用標註** | 無 | 標註來源 [1], [2] 並提供 URL | 優化 Markdown 渲染，支持來源鏈接。 |

---

## 優化路線圖
1.  **後端代理化**：在 `server/routes` 下建立 `ai.ts`，接管所有 AI 請求。
2.  **搜尋整合**：在後端實作 `google_search` 工具，並在模型初始化時宣告。
3.  **模型升級**：切換至 `gemma-4-31b-it` 並套用指南中的系統提示詞。
4.  **前端重構**：移除 `AI.tsx` 中的 API Key，改為呼叫後端 API，並優化 UI 狀態顯示。
