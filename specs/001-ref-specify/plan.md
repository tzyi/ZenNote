# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, React Native 0.7x  
**Primary Dependencies**: React Native, React Navigation, Zustand (複雜狀態), AsyncStorage/WatermelonDB（本地資料儲存）、Jest、React Native Testing Library、ESLint、Prettier  
**Storage**: 本地儲存（AsyncStorage，複雜查詢時可選 WatermelonDB）  
**Testing**: Jest、React Native Testing Library（RNTL），TDD 覆蓋率 ≥90%，自定義 Hook/資料處理/主要流程皆需測試  
**Target Platform**: Android（優先）、支援離線運作  
**Project Type**: mobile（單一 app 專案）  
**Performance Goals**: 首屏 500ms 內顯示 10 張卡片、列表滾動 60fps（1 萬筆）、搜尋 100ms 內、記憶體 <150MB  
**Constraints**: 嚴格遵循設計稿、UI 100% 一致、程式碼品質（單一職責、函式<50行、禁止 class component）、資料僅本地儲存、離線可用、資料加密、GDPR  
**Scale/Scope**: 5 大功能模組（主畫面、編輯器、搜尋、側邊欄、設定），支援 1 萬筆筆記、1000+ 標籤、10+ 圖片/筆記


## Constitution Check

*GATE: 必須通過下列門檻，否則不得進入設計/開發階段。每次設計/實作後需重新檢查。*

- 技術棧：必須使用 React Native + TypeScript，所有元件/函式有明確型別。
- 程式碼品質：單一職責、函式<50行、ESLint/Prettier 強制、禁止 Class 組件。
- 測試：Jest+RNTL，TDD 覆蓋率（核心邏輯/工具）≥90%，自定義 Hook/資料處理/主要流程皆有測試。
- 體驗一致性：Material Design 3、Android 原生感、輸入畫面≤300ms、離線可用、深/淺色切換。
- 效能：首屏≤1s、列表60FPS、搜尋≤200ms、記憶體≤150MB。
- 技術決策：輕量函式庫、第三方套件活躍維護、資料加密、GDPR。

*如有例外，必須於 spec/plan/PR 明確說明並經審查同意。*

**本次設計/規劃皆符合憲章要求，無違規項目。**

## Project Structure
ios/ or android/

### Documentation (本功能)

```text
specs/001-ref-specify/
├── plan.md              # 計劃文件 (/speckit.plan 輸出)
├── research.md          # 研究與澄清 (Phase 0)
├── data-model.md        # 資料模型 (Phase 1)
├── quickstart.md        # 快速上手 (Phase 1)
├── contracts/           # API/資料契約 (Phase 1)
└── tasks.md             # 任務分解 (Phase 2)
```

### Source Code (repository root)

```text
App.tsx
index.ts
assets/                 # 靜態資源（圖示、圖片）
docs/                   # 文件與設計稿
├── ui/                 # 設計稿 jpg
├── ref_speckit/        # speckit 參考
src/                    # 主要程式碼
├── modules/            # 五大功能模組（main, editor, search, sidebar, settings）
│   ├── main/
│   ├── editor/
│   ├── search/
│   ├── sidebar/
│   └── settings/
├── components/         # 共用 UI 組件
├── models/             # 資料結構與型別
├── services/           # 資料存取、API、同步
├── hooks/              # 共用 hooks
├── utils/              # 工具方法
├── navigation/         # React Navigation 設定
├── store/              # 狀態管理（Context, Zustand）
└── theme/              # 主題/樣式
tests/                  # 測試
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: 採用「Mobile + API」結構，主程式碼集中於 src/，五大功能模組分於 src/modules/，共用元件、型別、hooks、服務、狀態管理等皆有專屬目錄，測試與文件分離，符合大型 React Native 專案最佳實踐。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
