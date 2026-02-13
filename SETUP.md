# 設定指南

## 環境變數設定

1. 複製 `.env.example` 為 `.env.local`
2. 在 [Supabase](https://supabase.com) 建立新專案
3. 在 Supabase 專案中：
   - 前往 Settings > API
   - 複製 `Project URL` 和 `anon public` key
   - 更新 `.env.local` 中的值：
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

## 資料庫設定

1. 在 Supabase Dashboard 中，前往 SQL Editor
2. 執行 `supabase/migrations/20240101000000_initial_schema.sql` 中的 SQL
3. 這將建立：
   - profiles（員工白名單）
   - attendance（打卡記錄）
   - leave_requests（請假申請）
   - announcements（系統公告）

## Google OAuth 設定

1. 在 Supabase Dashboard 中，前往 Authentication > Providers
2. 啟用 Google Provider
3. 在 [Google Cloud Console](https://console.cloud.google.com)：
   - 建立新的 OAuth 2.0 Client ID
   - 設定授權重新導向 URI：`https://your-project-ref.supabase.co/auth/v1/callback`
   - 複製 Client ID 和 Client Secret 到 Supabase
4. 在 Supabase 中設定 Redirect URLs：
   - 開發環境：`http://localhost:3000/auth/callback`
   - 生產環境：`https://your-domain.com/auth/callback`

## 建立第一個管理員

在 SQL Editor 中執行：

```sql
-- 首先，使用 Google OAuth 登入一次，系統會在 auth.users 中建立使用者
-- 然後執行以下 SQL 將該使用者加入白名單並設為管理員

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth-users',  -- 從 auth.users 表中找到你的 UUID
  'your-email@example.com',
  '管理員名稱',
  'admin'
);
```

## 啟動開發伺服器

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 部署

此應用程式可以部署到任何支援 Next.js 的平台：

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)

記得在部署平台中設定環境變數。
