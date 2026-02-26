---
description: "ZenNote 卡片筆記 APP 任務清單"
---

# Tasks: ZenNote 卡片筆記 APP

> **注意：所有 UI 任務必須嚴格參照 docs/ui/*.jpg，UI 完成後才可進行功能實作。功能任務需依 spec.md 與 ref_specify.md。**

**Input**: 設計文件來自 /specs/001-ref-specify/
**Prerequisites**: plan.md（必須）、spec.md（用於 user stories）、research.md、data-model.md、contracts/

---

## Phase 1: Setup

- [X] T001 建立 src/ 與 screens/ 目錄結構
- [X] T002 安裝 React Native、TypeScript、Zustand、AsyncStorage、NativeWind、Reanimated 等依賴（package.json）
- [X] T003 設定 ESLint、Prettier、Jest、React Native Testing Library（根目錄）
- [X] T004 設定 tsconfig.json 型別安全規則
- [X] T005 設定 Android 專案啟動與模擬器環境

---

## Phase 2: Foundational

- [X] T006 建立 screens/MainScreen.tsx（主畫面 UI）
- [X] T007 建立 screens/EditorScreen.tsx（文字編輯器 UI）
- [X] T008 建立 screens/SearchScreen.tsx（搜尋頁面 UI）
- [X] T009 建立 screens/SidebarScreen.tsx（左側側邊欄 UI）
- [X] T010 建立 screens/SettingsScreen.tsx（設定頁面 UI）
- [X] T011 [P] 建立 assets/ui/ 並導入 main.jpg、editor.jpg、search.jpg、left_side.jpg、settings.jpg
- [X] T012 [P] 設計 UI 元件庫（src/components/）並建立 Card、TagBadge、FAB、Sidebar、SearchBar、SettingsPanel 等元件
- [X] T013 [P] 設計主題切換（深色/淺色）機制（src/theme/）
- [X] T014 [P] 設計 Navigation 結構（src/navigation/）

---

## Phase 3: User Story 1 - 主畫面卡片瀏覽與操作

- [X] T015 [US1] 實作 FlashList 時間流卡片列表（src/screens/MainScreen.tsx）
- [X] T016 [US1] 實作卡片內容預覽、標籤徽章、更多操作（src/components/Card.tsx）
- [X] T017 [US1] 實作「展開」按鈕與內容顯示（src/components/Card.tsx）
- [X] T018 [US1] 實作標籤徽章收斂顯示（src/components/TagBadge.tsx）
- [X] T019 [US1] 實作回收桶剩餘天數顯示（src/components/Card.tsx）
- [X] T020 [US1] 實作卡片長按氣泡選單（刪除、分享、置頂）（src/components/CardMenu.tsx）
- [X] T021 [US1] 實作 Reanimated 淡入動畫（src/components/Card.tsx）
- [X] T022 [US1] 實作批次匯出（Markdown）（src/screens/MainScreen.tsx）
- [X] T023 [US1] 實作回收桶頁面與批次刪除/還原（src/screens/RecycleBinScreen.tsx）
- [X] T024 [US1] 實作頂部導航與時間區間篩選（src/components/MainHeader.tsx）
- [X] T025 [US1] 實作懸浮新增按鈕（FAB）（src/components/FAB.tsx）

---

## Phase 4: User Story 2 - 筆記編輯器互動

- [X] T026 [US2] 實作標籤插入與自動補全（src/components/TagInput.tsx）
- [X] T027 [US2] 實作圖片上傳與拖曳排序（src/components/ImageUploader.tsx）
- [X] T028 [US2] 實作草稿自動儲存（src/screens/EditorScreen.tsx）
- [X] T029 [US2] 實作工具列與進階功能選單（src/components/EditorToolbar.tsx）
- [X] T030 [US2] 實作 KeyboardAvoidingView 與硬體鍵盤支援（src/screens/EditorScreen.tsx）
- [X] T031 [US2] 實作「已儲存」提示（src/components/SaveIndicator.tsx）

---

## Phase 5: User Story 3 - 搜尋與多維度篩選

- [X] T032 [US3] 實作搜尋框與 debounce（src/components/SearchBar.tsx）
- [X] T033 [US3] 實作 Chips 屬性篩選（src/components/FilterChips.tsx）
- [X] T034 [US3] 實作 AND/OR 多關鍵字搜尋（src/screens/SearchScreen.tsx）
- [X] T035 [US3] 實作標籤多選與模糊搜尋（src/components/TagSelector.tsx）
- [X] T036 [US3] 實作日期 picker 篩選（src/components/DatePicker.tsx）
- [X] T037 [US3] 實作搜尋結果列表與動畫過渡（src/screens/SearchScreen.tsx）

---

## Phase 6: User Story 4 - 左邊側邊欄互動與標籤管理

- [X] T038 [US4] 實作統計熱力圖（src/components/Heatmap.tsx）
- [X] T039 [US4] 實作標籤管理（新增、編輯、刪除、拖曳排序）（src/screens/SidebarScreen.tsx）
- [X] T040 [US4] 實作標籤聚合視圖（src/screens/TagAggregateScreen.tsx）
- [X] T041 [US4] 實作功能導航（全部筆記、每日回顧）（src/components/SidebarNav.tsx）
- [X] T042 [US4] 實作設定按鈕與頁面跳轉（src/components/SidebarNav.tsx）
- [X] T043 [US4] 實作側邊欄開啟/關閉動畫與手勢（src/screens/SidebarScreen.tsx）

---

## Phase 7: User Story 5 - 設定頁面與資料管理

- [X] T044 [US5] 實作主題切換（src/screens/SettingsScreen.tsx）
- [X] T045 [US5] 實作資料匯出（批次 .zip）（src/components/ExportPanel.tsx）
- [X] T046 [US5] 實作資料匯入（.zip/Markdown）（src/components/ImportPanel.tsx）
- [X] T047 [US5] 實作回收桶管理（批次還原/刪除、全部清空）（src/components/RecycleBinManager.tsx）
- [X] T048 [US5] 實作本地備份/還原（src/components/BackupPanel.tsx）
- [X] T049 [US5] 實作一鍵重設（src/components/ResetPanel.tsx）
- [X] T050 [US5] 實作版本資訊顯示（src/components/AboutPanel.tsx）

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T051 [P] UI 與設計稿比對一致性驗證（tests/ui/）
- [X] T052 [P] 效能測試（主畫面滾動、搜尋、編輯器）（tests/performance/）
- [X] T053 [P] 單元測試覆蓋率驗證（tests/unit/）
- [X] T054 [P] 型別安全驗證（tests/types/）
- [X] T055 [P] 資料加密與 GDPR 驗證（tests/security/）

---

## Dependencies

- Phase 1 → Phase 2（UI 完成後才可進行功能實作）
- Phase 2 → Phase 3-7（每個 user story 可獨立測試與實作）
- Phase 8 可與 Phase 3-7 平行進行

---

## Parallel Execution Examples

- T011, T012, T013, T014 可平行執行（UI 元件、主題、導航）
- Phase 3-7 各 user story 內標註 [P] 任務可平行
- Phase 8 所有 [P] 任務可平行

---

## Implementation Strategy

- MVP：僅完成 Phase 1-2（UI 五頁面完全一致），主畫面卡片列表（Phase 3）
- Incremental：依 user story 優先順序逐步實作功能

---

# 格式驗證

- 所有任務皆符合 checklist 格式（checkbox, ID, [P], [US], file path）
- 每個 user story 皆有獨立測試標準
- 任務皆可獨立執行與驗證
