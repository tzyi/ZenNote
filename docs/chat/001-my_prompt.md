# 001-my_prompt

# constitution
- 覺得perplextity回答較好
```
你是一位Github Copilot與Spec Kit專家
我專案的技術想要使用React Native打造Android APP
我想打造像是Flomo(https://flomoapp.com/)那樣的卡片筆記APP
重點關注程式碼品質、測試標準、使用者體驗一致性和效能要求
並明確這些原則應如何指導技術決策和實現選擇。
當我下speckit.constitution
後面提示詞要怎麼打比較適合?
```

- ref_constitution.md
```
# constitution

本專案為 React Native Android 卡片筆記應用,靈感來自 Flomo,著重於極簡、快速輸入與知識管理。請建立涵蓋以下面向的專案憲章:

**技術棧原則:**
- 使用 React Native 作為跨平台框架,優先針對 Android 優化
- 採用 TypeScript 確保型別安全,所有組件與函式必須有明確型別定義
- 使用 React Navigation 處理路由與導航
- 狀態管理採用 Context API 搭配 useReducer,針對複雜狀態考慮 Zustand
- 本地資料持久化使用 AsyncStorage 或 WatermelonDB(若需要複雜查詢)

**程式碼品質標準:**
- 所有元件必須遵循單一職責原則,保持函式簡潔(不超過 50 行)
- 必須使用 ESLint 與 Prettier 維持程式碼一致性
- 採用函式組件與 Hooks,禁止使用 Class 組件
- 關鍵商業邏輯與工具函式的程式碼覆蓋率須達 80% 以上
- 每個 Pull Request 必須通過 TypeScript 編譯檢查與 Lint 檢查

**測試標準:**
- 使用 Jest 與 React Native Testing Library 進行單元測試
- 所有自定義 Hooks 必須有對應測試案例
- UI 組件需測試渲染正確性與使用者互動行為
- 資料處理邏輯(標籤解析、搜尋、過濾)需有完整測試
- 整合測試覆蓋核心使用者流程:新增筆記、標籤管理、搜尋功能
- 測試驅動開發 (TDD)：核心邏輯與 Utility Functions 的單元測試覆蓋率須達 90%。

**使用者體驗一致性:**
- 遵循 Material Design 3 設計語言,確保 Android 原生感
- 快速輸入為第一優先:筆記輸入畫面載入時間不得超過 300ms
- 支援離線優先架構,所有操作必須在無網路環境下正常運作
- 標籤系統採用 # 符號觸發,支援多層級標籤(如 #工作/專案/會議)
- 提供每日回顧功能,隨機展示過往筆記
- 介面需支援深色模式與淺色模式自動切換

**效能要求:**
- 首屏載入時間不得超過 1 秒
- 筆記列表滾動必須維持 60 FPS,使用 FlatList 虛擬化渲染
- 搜尋功能響應時間需在 200ms 以內(1000 筆資料內)
- 應用記憶體使用量不得超過 150MB
- 使用 React.memo 與 useMemo 優化不必要的重新渲染
- 圖片與媒體檔案需實作延遲載入

**技術決策指導原則:**
- 優先選擇輕量級函式庫,避免過度依賴大型套件
- 新增功能前必須評估對 APP 體積與效能的影響
- 所有第三方套件必須活躍維護且支援 React Native 最新版本
- 資料結構設計需考慮未來擴展性,但避免過度設計
- 錯誤處理必須優雅,提供使用者友善的錯誤訊息
- 所有使用者資料必須加密儲存,遵循 GDPR 隱私原則

請依據這些原則更新憲章,並確保後續所有 spec、plan 與實作都嚴格遵循這些指導方針。

```

- 執行
```
/speckit.constitution 請參考 docs\spec-kit\ref_constitution.md
```



# specify

- 跟AI討論，產生ref_specify.md
```
你是一位UI UX專家，已經Github copilot與spec kit專家
我想要使用react Native打造一個Android APP
我想打造像是Flomo(https://flomoapp.com/)那樣的卡片筆記APP
可以參考照片的UI


我想用使用/spec.specify指令
幫我透過照片解析產品的功能
幫我分成主畫面、文字編輯器、搜尋頁面、左邊側邊欄，4個部分來描述
描述的越清楚越好

提示詞請用繁體中文
```

- 釐清
```
你是一位PM
參考docs\ui\main.jpg
思考主畫面有什麼功能需要釐清的嗎?
請用問答的方式詢問我，並且給我選項選擇
最後幫我修改ref_specify.md
讓產品功能的描述更完整
```

- 執行
```
/speckit.specify 請參考 ref_specify.md
```

# Clarify

```
clarify
```

- 檢查User Story是否詳盡
```
根據 ref_specify.md
幫我檢查specs\001-ref-specify\spec.md的User Story
是否列的詳盡?若不詳盡，請補上User Story
```

