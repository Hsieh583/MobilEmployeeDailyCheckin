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
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default now()
);

-- 系統公告
create table announcements (
  id int primary key generated always as identity,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;
alter table announcements enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert profiles"
  on profiles for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Attendance policies
create policy "Users can view their own attendance"
  on attendance for select
  using (auth.uid() = user_id);

create policy "Admins and supervisors can view all attendance"
  on attendance for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

create policy "Users can insert their own attendance"
  on attendance for insert
  with check (auth.uid() = user_id);

-- Leave requests policies
create policy "Users can view their own leave requests"
  on leave_requests for select
  using (auth.uid() = user_id);

create policy "Admins and supervisors can view all leave requests"
  on leave_requests for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

create policy "Users can insert their own leave requests"
  on leave_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins and supervisors can update leave requests"
  on leave_requests for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

-- Announcements policies
create policy "Everyone can view announcements"
  on announcements for select
  using (true);

create policy "Admins can insert announcements"
  on announcements for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update announcements"
  on announcements for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete announcements"
  on announcements for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
