# quickstart.md

## 專案啟動

1. 安裝依賴：
   ```sh
   npm install
   # 或
   yarn install
   ```
2. 啟動 Android 模擬器或連接實體裝置。
3. 啟動 App：
   ```sh
   npm run android
   # 或
   yarn android
   ```

## 目錄結構
- `App.tsx`：進入點
- `src/`：主程式碼（modules/components/models/services/hooks/store/theme）
- `assets/`：靜態資源
- `docs/`：設計稿與說明
- `specs/001-ref-specify/`：規格、計劃、契約、資料模型

## 測試
- 執行單元測試：
  ```sh
  npm test
  # 或
  yarn test
  ```
- 覆蓋率報告：
  ```sh
  npm run coverage
  # 或
  yarn coverage
  ```

## 主要技術
- React Native 0.7x
- TypeScript 5.x
- React Navigation
- Zustand（狀態管理）
- AsyncStorage/WatermelonDB（本地資料）
- Jest + React Native Testing Library（測試）

## 注意事項
- 嚴格遵循設計稿（docs/ui/*.jpg）
- 僅本地資料，無雲端同步
- 支援離線、資料加密、GDPR
- 程式碼品質與測試覆蓋率需達標
