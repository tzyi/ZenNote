
<!--
Sync Impact Report
Version change: [none] → 1.0.0
Modified principles: 全面重寫為專案專屬原則
Added sections: 六大原則明確化、治理規則明文化
Removed sections: 無
Templates requiring updates: plan-template.md ✅, spec-template.md ✅, tasks-template.md ✅
Follow-up TODOs: RATIFICATION_DATE 需補登實際通過日期
-->

# ZenNote 專案憲章


## 核心原則 (Core Principles)

### 1. 技術棧原則
- 採用 React Native 為跨平台主架構，優先針對 Android 優化。
- 全程使用 TypeScript，所有元件/函式必須有明確型別定義。
- 路由與導航統一使用 React Navigation。
- 狀態管理預設 Context API + useReducer，複雜狀態可用 Zustand。
- 本地資料持久化優先 AsyncStorage，需複雜查詢時可用 WatermelonDB。
**說明**：確保技術選型一致、型別安全、易於維護與擴展。

### 2. 程式碼品質標準
- 所有元件必須遵循單一職責原則，函式長度不超過 50 行。
- 強制使用 ESLint、Prettier 維持風格一致。
- 僅允許函式組件與 Hooks，禁止 Class 組件。
- 關鍵商業邏輯/工具函式程式碼覆蓋率須達 80% 以上。
- 每個 Pull Request 必須通過 TypeScript 編譯與 Lint 檢查。
**說明**：確保程式碼可讀、可維護、易於審查與自動化檢查。

### 3. 測試標準
- 單元測試採用 Jest 與 React Native Testing Library。
- 所有自定義 Hooks 必須有對應測試案例。
- UI 組件需測試渲染正確性與互動行為。
- 資料處理邏輯（標籤解析、搜尋、過濾）需完整測試。
- 整合測試覆蓋新增筆記、標籤管理、搜尋等核心流程。
- TDD：核心邏輯與工具函式單元測試覆蓋率須達 90%。
**說明**：確保功能正確、可回歸測試、降低回歸風險。

### 4. 使用者體驗一致性
- 遵循 Material Design 3，確保 Android 原生感。
- 筆記輸入畫面載入時間 ≤ 300ms。
- 支援離線優先，所有操作無網路下可用。
- 標籤系統以 # 觸發，支援多層級標籤（如 #工作/專案/會議）。
- 提供每日回顧，隨機展示過往筆記。
- 介面支援深色/淺色自動切換。
**說明**：確保體驗流暢、直覺、貼近 Android 使用習慣。

### 5. 效能要求
- 首屏載入時間 ≤ 1 秒。
- 筆記列表滾動維持 60 FPS，使用 FlatList 虛擬化。
- 搜尋功能響應 ≤ 200ms（1000 筆資料內）。
- 應用記憶體使用量 ≤ 150MB。
- 使用 React.memo/useMemo 優化渲染。
- 圖片/媒體檔案需延遲載入。
**說明**：確保高效能、低資源消耗，適合行動裝置。

### 6. 技術決策指導原則
- 優先輕量級函式庫，避免過度依賴大型套件。
- 新增功能前須評估對 APP 體積與效能影響。
- 第三方套件須活躍維護且支援 React Native 最新版。
- 資料結構設計需考慮擴展性，避免過度設計。
- 錯誤處理需優雅，提供友善訊息。
- 所有使用者資料必須加密儲存，遵循 GDPR。
**說明**：確保決策有據、可持續發展、重視隱私與安全。


## 補充約束與標準
1. 所有規格（spec）、計畫（plan）、任務（tasks）必須明確對應上述原則。
2. 任何偏離原則之設計/實作，須於 PR/Spec/Plan 中明確說明並經審查同意。
3. 重大架構/技術決策須有書面紀錄與審查流程。


## 開發流程與品質門檻
1. 所有 Pull Request 必須：
	- 通過 TypeScript 編譯、Lint、單元測試門檻（見上）。
	- 附帶測試報告（覆蓋率、效能指標）。
	- 明確對應/引用相關 spec/plan 條文。
2. 重大功能需經設計審查、測試審查雙重把關。
3. 定期（每月）進行憲章遵循性自我檢查。


## 治理規則 (Governance)
1. 本憲章優先於其他開發慣例，所有規格、計畫、實作均須遵循。
2. 憲章修訂需：
	- 由專案負責人/多數開發者提案。
	- 經團隊審查通過，並明確記錄修訂內容與生效日。
	- 修訂後須同步更新所有相關模板與文件。
3. 版本化政策：
	- MAJOR：原則刪除/大幅變更。
	- MINOR：新增原則或重大擴充。
	- PATCH：細節修正、文字澄清。
4. 每次修訂須於檔案最上方產生 Sync Impact Report。
5. 定期審查與自我檢查，確保長期遵循。

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): 首次通過日期待補 | **Last Amended**: 2026-02-14
