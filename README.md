# MobilEmployeeDailyCheckin
簡易員線上工打卡


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

