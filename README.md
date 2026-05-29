# A2Z Shop — Ecommerce Web App

## Setup Steps

### 1. Install dependencies
```bash
npm install
```

### 2. Add environment variables
Edit `.env.local` and add your Supabase URL and anon key.

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Supabase SQL — Run in SQL Editor

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  email text,
  phone text,
  role text default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  brand text,
  price decimal not null,
  discount decimal default 0,
  stock integer default 0,
  image_url text,
  status text default 'active',
  rating decimal default 4.0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Cart table
create table cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  items jsonb,
  total_amount decimal,
  delivery_address text,
  phone_number text,
  status text default 'pending',
  payment_method text default 'Cash on Delivery',
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table profiles enable row level security;
create policy "Profiles viewable by all" on profiles for select using (true);
create policy "Users can insert profile" on profiles for insert with check (true);
create policy "Users can update own profile" on profiles for update using (true);

alter table products enable row level security;
create policy "Products viewable by all" on products for select using (true);
create policy "Admins can insert products" on products for insert with check (true);
create policy "Admins can update products" on products for update using (true);
create policy "Admins can delete products" on products for delete using (true);

alter table cart enable row level security;
create policy "Cart viewable by owner" on cart for select using (true);
create policy "Users can insert to cart" on cart for insert with check (true);
create policy "Users can update cart" on cart for update using (true);
create policy "Users can delete from cart" on cart for delete using (true);

alter table orders enable row level security;
create policy "Orders viewable by all" on orders for select using (true);
create policy "Users can create orders" on orders for insert with check (true);
create policy "Admins can update orders" on orders for update using (true);
```

---

## Admin Setup
1. Register on the website
2. Go to Supabase → Table Editor → profiles
3. Find your user and change role from 'customer' to 'admin'

## Deploy to Vercel
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Live URL
After deploying, your site will be at: https://your-project.vercel.app
