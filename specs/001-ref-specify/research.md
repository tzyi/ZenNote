# research.md

## 1. 本地資料儲存方案選擇（AsyncStorage vs WatermelonDB）
- **Decision**：選擇哪一種本地資料儲存方案作為主力（或混用時機）。
- **Rationale**：需兼顧效能（萬筆資料、複雜查詢）、資料一致性、易用性與維護性。
- **Alternatives considered**：
  - **AsyncStorage**：簡單、原生支援、適合小量資料，查詢能力有限。
  - **WatermelonDB**：高效能、支援複雜查詢與大數據量，但集成複雜度較高。
  - **MMKV/SQLite**：其他高效能本地儲存方案，需評估與 React Native 的整合性。

## 2. 狀態管理策略（Context API + useReducer vs Zustand）
- **Decision**：全域狀態管理採用 Context/useReducer 還是引入 Zustand，或混合使用。
- **Rationale**：需考量狀態複雜度、效能、可測試性與團隊熟悉度。
- **Alternatives considered**：
  - **Context API + useReducer**：原生、簡單，適合中小型狀態。
  - **Zustand**：輕量、彈性高，適合複雜/跨模組狀態。
  - **Redux**：生態成熟但較重，已被排除。

## 3. 本地資料加密與 GDPR 隱私合規
- **Decision**：選擇何種加密技術與實作模式，確保所有用戶資料本地加密且符合法規。
- **Rationale**：需兼顧安全性、效能與開發維護成本。
- **Alternatives considered**：
  - **react-native-encrypted-storage**：易用、支援加密。
  - **WatermelonDB + 加密插件**：高效能但需額外整合。
  - **自行實作加密層**：彈性高但維護風險大。

## 4. 批次匯入/匯出（Markdown/ZIP/圖片）設計模式
- **Decision**：如何設計批次匯入/匯出流程，確保資料正確性、去重與圖片處理。
- **Rationale**：需支援多格式、圖片與筆記關聯、用戶體驗流暢。
- **Alternatives considered**：
  - **原生 JS 處理 + react-native-fs**：彈性高，需自行處理格式與錯誤。
  - **第三方套件（如 rn-fetch-blob）**：簡化檔案操作，但維護狀況需評估。
  - **後端 API 處理**：本案僅本地，暫不考慮。

## 5. 回收桶管理與資料刪除策略
- **Decision**：回收桶筆記超過 14 天的自動/手動刪除時機與資料結構設計。
- **Rationale**：需防止誤刪、符合法規、用戶可控。
- **Alternatives considered**：
  - **僅用戶主動操作時才刪除**：安全但需明確提示。
  - **定時自動清理**：用戶體驗佳但有誤刪風險。
  - **混合模式**：需設計複雜提示與還原機制。

## 6. 圖片與媒體檔案延遲載入與排序
- **Decision**：如何實作圖片延遲載入與拖曳排序，兼顧效能與體驗。
- **Rationale**：需支援多圖、低記憶體佔用、即時排序。
- **Alternatives considered**：
  - **FlatList + lazy loading**：原生支援虛擬化，效能佳。
  - **第三方圖片組件（如 FastImage）**：支援快取與高效載入。
  - **自訂 hook 處理排序與載入**：彈性高但需自行維護。

## 7. 離線優先架構與資料同步策略
- **Decision**：如何確保所有操作在無網路下皆可用，並設計未來可擴展的同步機制。
- **Rationale**：需保證資料一致性、用戶體驗與未來擴展性。
- **Alternatives considered**：
  - **完全本地運作**：簡單、穩定，無同步問題。
  - **預留同步接口**：為未來雲端同步做準備。
  - **PouchDB/類似方案**：支援本地-雲端同步，但目前不納入。

## 8. 測試覆蓋率與 TDD 流程落地
- **Decision**：如何落實 90% 覆蓋率與 TDD，並自動化檢查。
- **Rationale**：需兼顧開發效率、品質與 CI/CD 流程。
- **Alternatives considered**：
  - **Jest + coverage 檢查**：主流方案，易於集成。
  - **SonarQube 等靜態分析**：可視化覆蓋率，但需額外建置。
  - **手動審查**：不易維護，僅作輔助。
