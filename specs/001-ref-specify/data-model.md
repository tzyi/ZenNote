# data-model.md

## 主要實體

### Note（筆記）
- id: string
- content: string
- tags: string[]
- images: Image[]
- createdAt: number (timestamp)
- updatedAt: number (timestamp)
- deletedAt?: number (timestamp)
- inRecycleBin: boolean
- recycleRemainDays?: number

### Tag（標籤）
- id: string
- name: string
- noteCount: number
- order: number

### Image（圖片）
- id: string
- noteId: string
- uri: string
- order: number

### RecycleBin（回收桶）
- notes: Note[]
- deletedAt: number
- remainDays: number

### Settings（設定）
- theme: 'light' | 'dark' | 'system'
- backupPath: string
- importExportHistory: string[]

## 關聯與規則
- Note 與 Tag 為多對多（筆記可有多標籤，標籤可有多筆記）
- Note 與 Image 為一對多
- 回收桶僅存放 inRecycleBin=true 的 Note
- 超過 14 天未還原的 Note 僅於用戶主動操作時刪除
- Settings 為單例

## 驗證規則
- Tag 名稱唯一，長度 1~20 字
- Note 內容不可為空
- Image uri 必須有效
- 匯入時自動去重（依 id 或內容 hash）

## 狀態轉換
- Note: active → inRecycleBin → deleted（僅用戶操作時）
- Tag: 新增、編輯、刪除、排序
- Image: 新增、刪除、排序
- Settings: 切換主題、備份/還原、匯入/匯出
