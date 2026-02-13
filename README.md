# MobilEmployeeDailyCheckin
簡易員工線上打卡系統

## ✅ 實作狀態

本專案已完成實作！所有核心功能均已完成開發和測試。

**快速開始:**
1. 📖 閱讀 [SETUP.md](./SETUP.md) 了解如何設定和部署
2. 🔧 閱讀 [IMPLEMENTATION.md](./IMPLEMENTATION.md) 了解技術實作細節
3. 📊 閱讀 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 了解專案架構

**已實作功能:**
- ✅ Google OAuth 登入與白名單驗證
- ✅ 員工打卡介面（上班/下班）
- ✅ GPS 座標自動記錄
- ✅ 本週打卡記錄查看
- ✅ 系統公告顯示
- ✅ 管理員：員工管理、請假審核、公告管理
- ✅ 主管：請假審核功能
- ✅ Row Level Security (RLS) 資料庫保護
- ✅ 響應式設計（Mobile First）

---

📋 AI 開發規格書：簡易員工線上打卡 (LiteClock-Logistics)
1. 專案概述 (Project Context)
 * 目標：為百人以下物流公司建立美觀、直覺的行動端打卡網站。
 * 核心價值：紀錄事實、行政減輕、低維護成本。
 * 技術棧：Next.js (App Router), Tailwind CSS, lucide-react, Supabase (Auth & Database)。
2. 資料庫 Schema (Supabase SQL)
請 AI 優先執行以下 SQL 建立結構：
-- 員工白名單與權限
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('admin', 'supervisor', 'employee')) default 'employee',
  created_at timestamp with time zone default now()
);

-- 打卡流水帳 (不判斷遲到，僅記錄時間與地點)
create table attendance (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) not null,
  check_time timestamp with time zone default now(),
  type text check (type in ('in', 'out')) not null,
  lat_lng text, -- 存儲 "25.03, 121.56" 格式字串
  note text
);

-- 請假申請 (規則鬆散，僅供對帳)
create table leave_requests (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending'
);

-- 系統公告
create table announcements (
  id int primary key generated always as identity,
  content text not null,
  created_at timestamp with time zone default now()
);

3. 核心功能規格 (Functional Requirements)
A. 認證邏輯 (Auth)
 * 僅限 Google OAuth 登入。
 * 登入後檢查：若登入者的 Email 不在 profiles 表中，強制登出並提示「非授權員工」。
B. 員工介面 (Mobile First)
 * 打卡按鈕：單一動態按鈕。讀取當日最後一筆 attendance，若最後是 in 則顯示「下班打卡」，反之顯示「上班打卡」。
 * GPS 擷取：打卡時自動呼叫 Browser Geolocation API。
 * 記錄檢視：簡單清單顯示本週打卡時間。
C. 主管/管理介面
 * 請假審批：條列式清單，點擊按鈕直接更新 leave_requests 的 status。
 * 員工維護：管理員可手動輸入 Email 新增白名單。
 * 自動公告：管理員更新 announcements 表後，員工首頁上方顯示最新的一筆。
4. UI/UX 視覺規範 (Design System)
 * 風格：現代簡潔（如 Linear 或 Stripe 风格）。
 * 配色：主色 Indigo-600，打卡成功顯示 Emerald-500。
 * 組件庫：優先使用 shadcn/ui 的 Button, Card, Table 組件。
5. 給 AI Agent 的實作指令 (Prompt Sequence)
> Step 1 (初始化):
> "請根據上述 SQL 結構，建立一個 Next.js 專案，並配置 Supabase Auth (Google Login)。請實作一個 Middleware，檢查登入者 Email 是否存在於 profiles 表中。"
> 
> Step 2 (打卡頁面):
> "請使用 Tailwind CSS 建立一個美觀的行動端打卡頁面。包含一個大型圓形按鈕，具備微互動動畫。點擊時獲取經緯度並寫入 attendance 表。"
> 
> Step 3 (管理後台):
> "請為管理員角色建立一個簡單的 Dashboard。包含一個 Table 用於管理 profiles 白名單，以及一個請假審核清單。"
> 
💡 PM 的最後叮嚀
 * 不要做排班表：物流業班次太亂，讓他們回歸 Excel 對帳。
 * 不要做薪資計算：這牽涉到複雜勞基法，我們只提供「原始打卡數據」匯出。
 * 重視手機體驗：物流司機 99% 的時間都在手機上操作，按鈕要夠大。

---

## 🚀 快速開始

### 前置需求
- Node.js 18+ 
- npm 或 yarn
- Supabase 帳號

### 安裝步驟

1. **Clone 專案**
   ```bash
   git clone https://github.com/Hsieh583/MobilEmployeeDailyCheckin.git
   cd MobilEmployeeDailyCheckin
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**
   - 複製 `.env.example` 為 `.env.local`
   - 填入您的 Supabase 專案資訊
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **建立資料庫**
   - 在 Supabase Dashboard 執行 `supabase/migrations/20240101000000_initial_schema.sql`

5. **設定 Google OAuth**
   - 參考 [SETUP.md](./SETUP.md) 完整設定步驟

6. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   開啟 [http://localhost:3000](http://localhost:3000)

### 建立第一個管理員

```sql
-- 先使用 Google 登入一次，然後在 Supabase SQL Editor 執行：
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'your-user-uuid-from-auth-users',  
  'admin@example.com',
  '管理員名稱',
  'admin'
);
```

## 📚 文件

- [SETUP.md](./SETUP.md) - 完整設定指南
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 技術實作說明
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 專案架構圖

## 🛠️ 技術棧

- **前端**: Next.js 16, TypeScript, Tailwind CSS
- **圖示**: lucide-react
- **後端**: Supabase (PostgreSQL + Auth + RLS)
- **部署**: Vercel / Netlify / Railway

## 📱 功能截圖

### 員工打卡頁面
- 大型圓形打卡按鈕（256px）
- 動態顯示「上班打卡」或「下班打卡」
- 自動記錄 GPS 座標
- 顯示本週打卡記錄

### 管理後台
- 員工白名單管理
- 請假申請審核
- 系統公告發布

## 🔒 安全性

- Google OAuth 認證
- Email 白名單機制
- Row Level Security (RLS)
- 角色權限控制 (admin/supervisor/employee)

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

