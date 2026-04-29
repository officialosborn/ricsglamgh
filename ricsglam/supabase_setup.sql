-- ═══════════════════════════════════════════════════════════
-- RIC'S GLAM — SUPABASE DATABASE SETUP
-- Project: https://xryizxjtyvehkrapjwww.supabase.co
-- Run this entire file in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES — linked to Supabase Auth users
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT DEFAULT '',
  role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 2. PRODUCTS — wig collection
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  badge       TEXT DEFAULT '',
  icon        TEXT DEFAULT '✨',
  images      TEXT[] DEFAULT '{}',   -- base64 or Storage URLs
  inch_min    INTEGER,
  inch_max    INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 3. SERVICES — glam services offered
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT '✨',
  images      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 4. TESTIMONIALS — customer reviews
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS testimonials (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT DEFAULT '',
  avatar       TEXT DEFAULT '👩🏾',
  stars        INTEGER DEFAULT 5 CHECK (stars BETWEEN 1 AND 5),
  title        TEXT DEFAULT '',
  review_text  TEXT NOT NULL,
  review_date  TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 5. CATEGORIES — product category circles with photos
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  cat_key     TEXT NOT NULL,
  label       TEXT NOT NULL,
  emoji       TEXT DEFAULT '✨',
  image       TEXT,               -- base64 or Storage URL
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 6. SITE_SETTINGS — hero text, flyer, social links
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 7. ORDERS — customer cart checkouts (optional tracking)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email  TEXT,
  items       JSONB NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivered','cancelled')),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — enable on all tables
-- ═══════════════════════════════════════════════════════════
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Products: anyone can read, anon can write (admin saves use anon key)
CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Anon write products"
  ON products FOR ALL USING (true) WITH CHECK (true);

-- Services: anyone can read, anon can write
CREATE POLICY "Public read services"
  ON services FOR SELECT USING (true);

CREATE POLICY "Anon write services"
  ON services FOR ALL USING (true) WITH CHECK (true);

-- Testimonials: anyone can read, anon can write
CREATE POLICY "Public read testimonials"
  ON testimonials FOR SELECT USING (true);

CREATE POLICY "Anon write testimonials"
  ON testimonials FOR ALL USING (true) WITH CHECK (true);

-- Categories: anyone can read, anon can write
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Anon write categories"
  ON categories FOR ALL USING (true) WITH CHECK (true);

-- Site settings: anyone can read, anon can write
CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Anon write settings"
  ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Profiles: users can read/write their own profile only
CREATE POLICY "Users own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Orders: users can read/write their own orders
CREATE POLICY "Users own orders"
  ON orders FOR ALL USING (
    auth.uid() = user_id OR user_email = auth.email()
  );

-- ═══════════════════════════════════════════════════════════
-- TRIGGER — auto-create profile when user signs up
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- TRIGGER — auto-update site_settings updated_at timestamp
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS settings_updated ON site_settings;

CREATE TRIGGER settings_updated
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_timestamp();

-- ═══════════════════════════════════════════════════════════
-- SEED DEFAULT DATA — runs only if tables are empty
-- This inserts the 8 default products, 8 services, 3 reviews,
-- 7 categories and initial site settings
-- ═══════════════════════════════════════════════════════════

-- Default products (only insert if table is empty)
INSERT INTO products (id, name, category, description, price, badge, icon, inch_min, inch_max)
SELECT * FROM (VALUES
  ('1', 'Deep Wave Frontal Wig',   'Frontal', '180% density · HD lace · 100% human hair', 1200.00, 'Best Seller', '🌊', 24, 32),
  ('2', 'Silky Straight Closure',  'Closure', '150% density · 4x4 closure · Natural black', 750.00, 'Popular', '✨', 18, 26),
  ('3', 'Kinky Curly Full Lace',   'Curly',   '200% density · Full lace · Pre-plucked hairline', 1450.00, 'New Arrival', '👩‍🦱', 20, 30),
  ('4', 'Body Wave Bob Wig',        'Bob',     'Short & chic · 13x4 lace front · Ready to wear', 580.00, '', '💁‍♀️', 12, 16),
  ('5', 'Loose Deep Wave',          'Frontal', '130% density · Glueless · Natural hairline', 980.00, 'Hot', '👱‍♀️', 22, 30),
  ('6', 'Highlight Blonde Wig',     'Colored', 'Ombre color · T-part lace · Trendy style', 870.00, 'Trending', '💎', 16, 22),
  ('7', 'Bone Straight Wig',        'Straight','150% density · 13x4 lace front · Natural black', 1100.00, '', '👩‍🦳', 28, 34),
  ('8', 'Water Wave Bob',           'Bob',     'Glueless · 4x4 lace closure · Beginner friendly', 620.00, 'Easy Wear', '🌸', 10, 14)
) AS v(id, name, category, description, price, badge, icon, inch_min, inch_max)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Default services
INSERT INTO services (id, name, description, icon)
SELECT * FROM (VALUES
  ('s1', 'Lash Extension',   'Add dramatic volume and length with premium lash extensions that last up to 6 weeks.', '👁️'),
  ('s2', 'Frontal Wigging',  'Seamless frontal wig installation for a natural, undetectable hairline.', '💁‍♀️'),
  ('s3', 'Closure Wigging',  'Perfect closure wig application — flawless blend, natural part, long-lasting hold.', '✨'),
  ('s4', 'Straightening',    'Silky-smooth, frizz-free straightening using professional heat tools.', '🔥'),
  ('s5', 'Curling',          'Bouncy, beautiful curls defined with heat or wet styling — shaped perfectly every time.', '🌀'),
  ('s6', 'Revamping',        'Breathe new life into old wigs — deep cleanse, re-style, and complete restoration.', '💫'),
  ('s7', 'Installation',     'Secure, comfortable wig installation — glue, sew-in, and clip options available.', '📌'),
  ('s8', 'Reconstruction',   'Expert repair for damaged or thinning wigs — density restored, knots re-bleached.', '🔧')
) AS v(id, name, description, icon)
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Default testimonials
INSERT INTO testimonials (id, name, location, avatar, stars, title, review_text, review_date)
SELECT * FROM (VALUES
  ('t1', 'Abena Mensah',  'East Legon, Accra',      '👩🏾', 5, 'Absolutely love it!',       'My frontal wig was flawlessly installed. Ric''s Glam knows their craft — I''ve never felt more beautiful!', 'Apr 13, 2026'),
  ('t2', 'Serwaah Osei',  'Airport Hills, Accra',   '👩🏽', 5, 'Best hair I''ve tried!',     'The deep wave wig is stunning! Top-notch quality, same-day delivery. Will order again!', 'Apr 08, 2026'),
  ('t3', 'Akosua Darko',  'Tema, Greater Accra',    '👩🏿', 5, 'So easy to order!',          'Ordered through WhatsApp — so easy! Lash extensions are perfection. My go-to beauty spot!', 'Apr 01, 2026')
) AS v(id, name, location, avatar, stars, title, review_text, review_date)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);

-- Default categories
INSERT INTO categories (id, cat_key, label, emoji)
SELECT * FROM (VALUES
  ('cat-all',   'All',      'All Wigs', '✨'),
  ('cat-front', 'Frontal',  'Frontals', '👑'),
  ('cat-clos',  'Closure',  'Closures', '💁‍♀️'),
  ('cat-curly', 'Curly',    'Curly',    '🌊'),
  ('cat-str',   'Straight', 'Straight', '💎'),
  ('cat-bob',   'Bob',      'Bob Wigs', '🌸'),
  ('cat-col',   'Colored',  'Colored',  '🎨')
) AS v(id, cat_key, label, emoji)
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

-- Default site settings
INSERT INTO site_settings (key, value)
SELECT * FROM (VALUES
  ('heroData',    '{"h1":"","sub":"","flyer":null}'),
  ('socialLinks', '{"tiktokUrl":"https://www.tiktok.com/@chinenye414","snapUrl":"https://snapchat.com/t/A6DUP6tb"}')
) AS v(key, value)
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- ═══════════════════════════════════════════════════════════
-- DONE ✅
-- Tables created: profiles, products, services, testimonials,
--                 categories, site_settings, orders
-- RLS enabled and policies set on all tables
-- Auto-profile trigger wired to auth.users
-- Default seed data inserted (only if tables were empty)
-- ═══════════════════════════════════════════════════════════
