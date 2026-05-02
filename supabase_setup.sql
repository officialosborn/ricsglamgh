-- ═══════════════════════════════════════════════════════════
-- RIC'S GLAM — DATABASE SETUP (RLS DISABLED VERSION)
-- ═══════════════════════════════════════════════════════════

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT DEFAULT '',
  role        TEXT DEFAULT 'user',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       NUMERIC(10,2) NOT NULL,
  badge       TEXT DEFAULT '',
  icon        TEXT DEFAULT '✨',
  images      TEXT[] DEFAULT '{}',
  inch_min    INTEGER,
  inch_max    INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT '✨',
  images      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT DEFAULT '',
  avatar       TEXT DEFAULT '👩🏾',
  stars        INTEGER DEFAULT 5,
  title        TEXT DEFAULT '',
  review_text  TEXT NOT NULL,
  review_date  TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  cat_key     TEXT NOT NULL,
  label       TEXT NOT NULL,
  emoji       TEXT DEFAULT '✨',
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id),
  user_email  TEXT,
  items       JSONB NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'pending',
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 2. DISABLE RLS (Smooth Operation Mode)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE profiles      DISABLE ROW LEVEL SECURITY;
ALTER TABLE products      DISABLE ROW LEVEL SECURITY;
ALTER TABLE services      DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials   DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories    DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders        DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- 3. Automation Triggers
-- ═══════════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 4. Seed Initial Data (Only if empty)
-- ═══════════════════════════════════════════════════════════

INSERT INTO products (id, name, category, description, price, badge, icon, inch_min, inch_max)
SELECT * FROM (VALUES
  ('1', 'Deep Wave Frontal Wig', 'Frontal', '180% density · HD lace · 100% human hair', 1200.00, 'Best Seller', '🌊', 24, 32),
  ('2', 'Silky Straight Closure', 'Closure', '150% density · 4x4 closure · Natural black', 750.00, 'Popular', '✨', 18, 26)
) AS v WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO site_settings (key, value)
SELECT * FROM (VALUES
  ('heroData', '{"h1":"","sub":"","flyer":null}'),
  ('socialLinks', '{"tiktokUrl":"https://www.tiktok.com/@chinenye414","snapUrl":"https://snapchat.com/t/A6DUP6tb"}')
) AS v WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
