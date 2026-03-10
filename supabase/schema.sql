-- Nawaa AI — Run this in Supabase SQL Editor
-- Companies table
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  name_ar text,
  industry text,
  description text,
  website text,
  logo_url text,
  brand_colors text[] default '{}',
  target_audience text,
  tone text,
  platforms text[] default '{}',
  competitors text,
  unique_value text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Content plans table
create table if not exists content_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  title text,
  week_start date,
  platforms text[],
  prompt text,
  plan_data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Generated images table
create table if not exists generated_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  plan_id uuid references content_plans(id),
  day_label text,
  prompt_used text,
  image_urls text[],
  created_at timestamp with time zone default now()
);

-- Optional: user profile for preferred locale (i18n)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_locale text default 'ar',
  updated_at timestamp with time zone default now()
);

-- RLS
alter table companies enable row level security;
alter table content_plans enable row level security;
alter table generated_images enable row level security;
alter table profiles enable row level security;

drop policy if exists "Users own their companies" on companies;
create policy "Users own their companies" on companies for all using (auth.uid() = user_id);

drop policy if exists "Users own their plans" on content_plans;
create policy "Users own their plans" on content_plans for all using (auth.uid() = user_id);

drop policy if exists "Users own their images" on generated_images;
create policy "Users own their images" on generated_images for all using (auth.uid() = user_id);

drop policy if exists "Users own profile" on profiles;
create policy "Users own profile" on profiles for all using (auth.uid() = id);

-- Competitor analyses table
create table if not exists competitor_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  competitors jsonb not null,
  analysis_data jsonb not null,
  output_language text default 'en',
  created_at timestamp with time zone default now()
);

alter table competitor_analyses enable row level security;

drop policy if exists "Users own their competitor analyses" on competitor_analyses;
create policy "Users own their competitor analyses" on competitor_analyses for all using (auth.uid() = user_id);

-- Indexes for frequent queries
create index if not exists idx_companies_user_id on companies(user_id);
create index if not exists idx_content_plans_user_id on content_plans(user_id);
create index if not exists idx_content_plans_company_id on content_plans(company_id);
create index if not exists idx_generated_images_user_id on generated_images(user_id);
create index if not exists idx_generated_images_company_id on generated_images(company_id);
create index if not exists idx_generated_images_plan_id on generated_images(plan_id);
create index if not exists idx_competitor_analyses_user_id on competitor_analyses(user_id);
create index if not exists idx_competitor_analyses_company_id on competitor_analyses(company_id);

-- Storage: create bucket "logos" in Dashboard → Storage, then add policy:
-- Allow authenticated users to upload to folder matching their user_id
-- (e.g. path: {user_id}/filename.png)
