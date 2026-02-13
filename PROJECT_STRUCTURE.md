# 專案結構圖

## 目錄結構

```
MobilEmployeeDailyCheckin/
├── app/                          # Next.js App Router 頁面
│   ├── admin/                    # 管理後台
│   │   ├── announcements/        # 公告管理頁面
│   │   │   └── page.tsx
│   │   ├── leaves/               # 請假審核頁面
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # 管理後台佈局（導航列）
│   │   └── page.tsx              # 員工管理頁面
│   ├── auth/
│   │   └── callback/             # OAuth 回調處理
│   │       └── route.ts
│   ├── unauthorized/             # 未授權訪問頁面
│   │   └── page.tsx
│   ├── layout.tsx                # 全站佈局
│   ├── page.tsx                  # 首頁（員工打卡頁面）
│   └── globals.css               # 全域樣式
│
├── components/                   # React 元件
│   ├── admin/                    # 管理後台元件
│   │   ├── AnnouncementManagement.tsx
│   │   ├── EmployeeManagement.tsx
│   │   └── LeaveRequestManagement.tsx
│   ├── AnnouncementBanner.tsx    # 公告橫幅
│   ├── AttendanceList.tsx        # 打卡記錄列表
│   └── CheckInButton.tsx         # 打卡按鈕
│
├── lib/                          # 工具函式
│   └── supabase/
│       ├── client.ts             # 客戶端 Supabase 實例
│       └── server.ts             # 伺服器端 Supabase 實例
│
├── supabase/                     # 資料庫遷移
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
│
├── middleware.ts                 # 路由保護中介軟體
├── .env.example                  # 環境變數範例
├── .env.local                    # 本地環境變數（不提交）
├── SETUP.md                      # 設定指南
├── IMPLEMENTATION.md             # 實作說明
└── README.md                     # 專案說明
```

## 頁面路由結構

```
/                        → 員工打卡首頁（需登入）
/unauthorized            → 未授權訪問頁面（公開）
/auth/callback           → OAuth 回調（公開）
/admin                   → 員工管理（僅管理員）
/admin/leaves            → 請假審核（管理員與主管）
/admin/announcements     → 公告管理（僅管理員）
```

## 資料庫架構圖

```
┌─────────────────────────────────────────────┐
│                 auth.users                  │ (Supabase Auth)
│  - id (UUID)                                │
│  - email                                    │
└─────────────┬───────────────────────────────┘
              │ references
              ↓
┌─────────────────────────────────────────────┐
│              profiles                       │ (員工白名單)
│  - id (UUID) PK, FK → auth.users           │
│  - email (TEXT) UNIQUE                      │
│  - full_name (TEXT)                         │
│  - role (admin/supervisor/employee)         │
│  - created_at (TIMESTAMP)                   │
└─────────────┬───────────────────────────────┘
              │ references
              │
       ┌──────┴──────┬──────────────┐
       ↓             ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ attendance   │ │leave_requests│ │announcements │
├──────────────┤ ├──────────────┤ ├──────────────┤
│- id (PK)     │ │- id (PK)     │ │- id (PK)     │
│- user_id (FK)│ │- user_id (FK)│ │- content     │
│- check_time  │ │- start_date  │ │- created_at  │
│- type        │ │- end_date    │ └──────────────┘
│- lat_lng     │ │- reason      │
│- note        │ │- status      │
└──────────────┘ │- created_at  │
                 └──────────────┘
```

## 元件互動流程

### 員工打卡流程

```
app/page.tsx (Server Component)
    │
    ├─ 檢查使用者認證
    ├─ 查詢使用者 profile
    ├─ 查詢最新公告
    ├─ 查詢今日打卡記錄
    │
    └─ 渲染頁面
        │
        ├─ AnnouncementBanner (顯示公告)
        │
        ├─ CheckInButton (Client Component)
        │   │
        │   ├─ 點擊按鈕
        │   ├─ 獲取 GPS 座標
        │   ├─ 寫入 attendance 表
        │   └─ 重新載入頁面
        │
        └─ AttendanceList (Client Component)
            │
            └─ 顯示本週打卡記錄
```

### 管理員審核請假流程

```
app/admin/leaves/page.tsx (Server Component)
    │
    ├─ 檢查管理員/主管權限
    ├─ 查詢所有請假申請
    │
    └─ 渲染頁面
        │
        └─ LeaveRequestManagement (Client Component)
            │
            ├─ 顯示請假列表
            ├─ 點擊「核准」或「拒絕」
            └─ 更新 leave_requests.status
```

## 認證與授權流程

```
1. 使用者訪問任何頁面
   ↓
2. middleware.ts 攔截請求
   ↓
3. 檢查是否有 Supabase session
   ├─ 無 session → 導向 /unauthorized
   └─ 有 session → 繼續
       ↓
4. 查詢 profiles 表檢查白名單
   ├─ 不在白名單 → 導向 /unauthorized
   └─ 在白名單 → 允許訪問
       ↓
5. 頁面層級再次檢查角色權限
   └─ 根據 role 顯示對應功能
```

## RLS 政策架構

```
profiles 表：
  - SELECT: 自己 OR 是管理員
  - INSERT: 是管理員
  - UPDATE: 是管理員

attendance 表：
  - SELECT: 自己 OR 是管理員/主管
  - INSERT: 是自己

leave_requests 表：
  - SELECT: 自己 OR 是管理員/主管
  - INSERT: 是自己
  - UPDATE: 是管理員/主管

announcements 表：
  - SELECT: 所有人
  - INSERT/UPDATE/DELETE: 是管理員
```

## 設計系統配色

```
主要顏色：
  - Primary:    Indigo-600   (#4F46E5)
  - Success:    Emerald-500  (#10B981)
  - Warning:    Amber-600    (#D97706)
  - Error:      Red-600      (#DC2626)
  - Info:       Blue-500     (#3B82F6)

功能顏色：
  - 上班打卡:    Indigo-600
  - 下班打卡:    Amber-600
  - 打卡成功:    Emerald-500
  - 管理員:      Purple-100/800
  - 主管:        Blue-100/800
  - 員工:        Gray-100/800
```

## 響應式斷點

```
Tailwind CSS 預設斷點：
  - sm:  640px   (手機橫向)
  - md:  768px   (平板直向)
  - lg:  1024px  (平板橫向/小筆電)
  - xl:  1280px  (桌面)
  - 2xl: 1536px  (大桌面)

本專案主要針對：
  - 預設 (<640px):  手機直向（主要目標）
  - md+ (≥768px):   管理後台（桌面瀏覽）
```
