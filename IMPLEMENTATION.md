# 員工打卡系統 - 實作說明

## 專案概述

本專案是一個簡易的員工線上打卡系統，專為百人以下的物流公司設計。系統提供美觀、直覺的行動端介面，核心價值為「紀錄事實、行政減輕、低維護成本」。

## 技術架構

- **前端框架**: Next.js 16 (App Router)
- **樣式**: Tailwind CSS
- **圖示**: lucide-react
- **後端服務**: Supabase
  - 認證 (Auth with Google OAuth)
  - 資料庫 (PostgreSQL)
  - Row Level Security (RLS)

## 功能實作

### 1. 認證系統

**檔案位置**:
- `lib/supabase/client.ts` - 客戶端 Supabase 實例
- `lib/supabase/server.ts` - 伺服器端 Supabase 實例
- `middleware.ts` - 路由保護中介軟體
- `app/auth/callback/route.ts` - OAuth 回調處理
- `app/unauthorized/page.tsx` - 未授權頁面

**功能說明**:
- 僅支援 Google OAuth 登入
- 登入後檢查 Email 是否在 `profiles` 表中
- 若不在白名單，強制導向未授權頁面
- Middleware 保護所有頁面（除了 `/auth/` 和 `/unauthorized`）

### 2. 員工打卡介面

**檔案位置**:
- `app/page.tsx` - 首頁（打卡頁面）
- `components/CheckInButton.tsx` - 打卡按鈕元件
- `components/AttendanceList.tsx` - 打卡記錄列表
- `components/AnnouncementBanner.tsx` - 公告橫幅

**功能說明**:
- **動態打卡按鈕**: 
  - 根據當日最後一筆記錄顯示「上班打卡」或「下班打卡」
  - 大型圓形按鈕設計（直徑 256px），適合行動裝置操作
  - 點擊時自動獲取 GPS 座標
  - 包含微互動動畫（hover、loading、success）
  
- **本週打卡記錄**:
  - 顯示本週（從週一開始）的所有打卡記錄
  - 包含時間、類型（上班/下班）、GPS 座標
  - 使用顏色區分上班（藍色）和下班（琥珀色）

- **公告顯示**:
  - 頁面頂部顯示最新的一筆系統公告
  - 僅管理員可新增/刪除公告

### 3. 管理後台

**檔案位置**:
- `app/admin/layout.tsx` - 管理後台佈局
- `app/admin/page.tsx` - 員工管理頁面
- `app/admin/leaves/page.tsx` - 請假審核頁面
- `app/admin/announcements/page.tsx` - 公告管理頁面
- `components/admin/EmployeeManagement.tsx` - 員工管理元件
- `components/admin/LeaveRequestManagement.tsx` - 請假管理元件
- `components/admin/AnnouncementManagement.tsx` - 公告管理元件

**功能說明**:

#### 員工管理（僅管理員）
- 查看所有員工白名單
- 新增員工：輸入 Email、姓名、角色
- 刪除員工
- 顯示員工角色標籤（管理員/主管/員工）

#### 請假審核（管理員與主管）
- 查看所有請假申請
- 篩選器：待審核/已核准/已拒絕/全部
- 顯示請假日期範圍、原因
- 一鍵核准或拒絕請假

#### 公告管理（僅管理員）
- 新增系統公告
- 刪除公告
- 顯示發布時間

### 4. 資料庫結構

**檔案位置**: `supabase/migrations/20240101000000_initial_schema.sql`

#### 資料表

1. **profiles** - 員工白名單與權限
   - `id` (UUID, PK): 關聯到 auth.users
   - `email` (TEXT, UNIQUE): 員工 Email
   - `full_name` (TEXT): 員工姓名
   - `role` (TEXT): 角色（admin/supervisor/employee）
   - `created_at` (TIMESTAMP): 建立時間

2. **attendance** - 打卡流水帳
   - `id` (BIGINT, PK): 自動編號
   - `user_id` (UUID, FK): 關聯到 profiles
   - `check_time` (TIMESTAMP): 打卡時間
   - `type` (TEXT): 類型（in/out）
   - `lat_lng` (TEXT): GPS 座標（格式："25.03, 121.56"）
   - `note` (TEXT): 備註

3. **leave_requests** - 請假申請
   - `id` (BIGINT, PK): 自動編號
   - `user_id` (UUID, FK): 關聯到 profiles
   - `start_date` (DATE): 開始日期
   - `end_date` (DATE): 結束日期
   - `reason` (TEXT): 請假原因
   - `status` (TEXT): 狀態（pending/approved/rejected）
   - `created_at` (TIMESTAMP): 建立時間

4. **announcements** - 系統公告
   - `id` (INT, PK): 自動編號
   - `content` (TEXT): 公告內容
   - `created_at` (TIMESTAMP): 建立時間

#### Row Level Security (RLS) 政策

所有資料表都啟用 RLS，確保資料安全：

- **profiles**: 
  - 使用者可查看自己的資料
  - 管理員可查看、新增、修改所有資料

- **attendance**:
  - 使用者可查看和新增自己的打卡記錄
  - 管理員和主管可查看所有記錄

- **leave_requests**:
  - 使用者可查看和新增自己的請假申請
  - 管理員和主管可查看所有申請並更新狀態

- **announcements**:
  - 所有人可查看
  - 僅管理員可新增、更新、刪除

## 設計特點

### UI/UX 規範

- **風格**: 現代簡潔（參考 Linear 和 Stripe 風格）
- **配色方案**:
  - 主色：Indigo-600
  - 成功色：Emerald-500
  - 上班：Indigo-600
  - 下班：Amber-600
  - 警告：Yellow-500
  - 錯誤：Red-600
- **響應式設計**: Mobile First，優先考慮手機使用體驗
- **大型按鈕**: 打卡按鈕直徑 256px，方便司機在移動中操作

### 安全性考量

1. **認證保護**: 所有頁面都需要認證（除了 `/unauthorized`）
2. **白名單機制**: 只有在 profiles 表中的 Email 才能訪問系統
3. **Row Level Security**: 資料庫層級的存取控制
4. **角色權限**:
   - 員工：只能打卡和查看自己的記錄
   - 主管：可審核請假
   - 管理員：完整的管理權限

### 效能優化

1. **伺服器端渲染**: 首頁使用 RSC，加快首次載入
2. **客戶端互動**: 打卡按鈕使用客戶端元件，提供即時反饋
3. **分頁設計**: 管理後台資料使用篩選器減少資料量

## 部署說明

請參考 `SETUP.md` 了解完整的設定步驟。

### 關鍵步驟

1. 建立 Supabase 專案
2. 執行資料庫遷移 SQL
3. 設定 Google OAuth
4. 建立第一個管理員帳號
5. 部署到 Vercel 或其他平台

## 未實作功能（依照 PM 指示）

- ❌ 排班表：物流業班次複雜，建議使用 Excel
- ❌ 薪資計算：涉及複雜勞基法，僅提供原始打卡數據
- ✅ 重視手機體驗：按鈕大、介面簡潔

## 擴展建議

未來可考慮新增：

1. 匯出打卡記錄（CSV/Excel）
2. 員工自助請假功能
3. 打卡統計報表
4. 訊息通知（請假審核結果）
5. 多語言支援
6. 深色模式

## 技術債務

目前的實作有以下需要注意的地方：

1. **員工新增**: 目前在 UI 中新增員工會失敗，因為需要先在 Supabase Auth 中建立使用者。建議流程：
   - 使用者先用 Google 登入一次
   - 管理員在資料庫中將該使用者加入白名單

2. **錯誤處理**: 可以加強錯誤訊息的顯示和處理

3. **測試**: 需要新增單元測試和整合測試

4. **日誌記錄**: 可以加入審計日誌功能

## 維護建議

1. 定期備份 Supabase 資料庫
2. 監控 Supabase 使用量（免費方案有限制）
3. 定期更新 Next.js 和其他依賴套件
4. 檢查 RLS 政策是否符合需求
