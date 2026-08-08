-- Mevamahal e-commerce schema

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) UNIQUE NOT NULL,
  password_hash VARCHAR(255),           -- null if signed up via Google
  google_id     VARCHAR(120) UNIQUE,
  avatar_url    TEXT,
  phone         VARCHAR(20),
  role          VARCHAR(20) NOT NULL DEFAULT 'customer', -- customer | admin
  address_line  TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(12),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL,
  slug  VARCHAR(100) UNIQUE NOT NULL,
  image_url TEXT
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(180) NOT NULL,
  slug          VARCHAR(180) UNIQUE NOT NULL,
  description   TEXT,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price         NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),          -- for showing strike-through discount
  stock         INTEGER NOT NULL DEFAULT 0,
  unit          VARCHAR(30) DEFAULT '250g', -- 250g / 500g / 1kg etc
  image_url     TEXT,
  images        JSONB DEFAULT '[]',
  rating        NUMERIC(2,1) DEFAULT 0,
  rating_count  INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (to_tsvector('english', name || ' ' || coalesce(description,'')));

CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|paid|shipped|delivered|cancelled
  total_amount   NUMERIC(10,2) NOT NULL,
  shipping_name  VARCHAR(120),
  shipping_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_city  VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(12),
  payment_method VARCHAR(30) DEFAULT 'cod',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_service VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(180) NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(180) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- seed a couple of categories
INSERT INTO categories (name, slug) VALUES
  ('Almonds', 'almonds'),
  ('Pistachios', 'pistachios'),
  ('Walnuts', 'walnuts'),
  ('Dates', 'dates'),
  ('Cashews', 'cashews'),
  ('Gift Boxes', 'gift-boxes')
ON CONFLICT DO NOTHING;
