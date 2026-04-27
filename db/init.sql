-- ============================================================
-- CENTRAL KITCHEN — Demo Database
-- Auto-runs when the Postgres container first starts
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('site_manager', 'kitchen_staff', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered');
CREATE TYPE product_category AS ENUM (
  'Proteins', 'Sauces & Bases', 'Bakery & Dough',
  'Veg Prep', 'Dry Supplies', 'Other'
);

-- ── Sites ─────────────────────────────────────────────────────
CREATE TABLE sites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'Restaurant',
  email      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          user_role NOT NULL DEFAULT 'site_manager',
  site_id       UUID REFERENCES sites(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      product_category NOT NULL DEFAULT 'Other',
  unit          TEXT NOT NULL DEFAULT 'unit',
  kitchen_stock INTEGER NOT NULL DEFAULT 0,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE SEQUENCE order_ref_seq START 1;

CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref     TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || LPAD(nextval('order_ref_seq')::TEXT, 4, '0')),
  site_id       UUID NOT NULL REFERENCES sites(id),
  placed_by     UUID NOT NULL REFERENCES users(id),
  delivery_date DATE NOT NULL,
  status        order_status NOT NULL DEFAULT 'pending',
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Order Items ───────────────────────────────────────────────
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Status History ────────────────────────────────────────────
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  order_status,
  new_status  order_status NOT NULL,
  changed_by  UUID REFERENCES users(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_orders_site_id       ON orders(site_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_order_items_order    ON order_items(order_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Sites
INSERT INTO sites (id, name, type, email) VALUES
  ('11111111-0000-0000-0000-000000000001', 'The Smokehouse',       'Restaurant', 'smokehouse@kitchen.local'),
  ('11111111-0000-0000-0000-000000000002', 'Spice Route',          'Takeaway',   'spiceroute@kitchen.local'),
  ('11111111-0000-0000-0000-000000000003', 'Burger Bar',           'Takeaway',   'burgerbar@kitchen.local'),
  ('11111111-0000-0000-0000-000000000004', 'The Garden Brasserie', 'Restaurant', 'brasserie@kitchen.local');

-- Products
INSERT INTO products (name, category, unit, kitchen_stock) VALUES
  ('Pulled Pork (2kg)',            'Proteins',       'tray',   24),
  ('Beef Brisket (2kg)',           'Proteins',       'tray',   18),
  ('Marinated Chicken Thighs 3kg', 'Proteins',       'bag',    30),
  ('Lamb Kofta Mix (1kg)',         'Proteins',       'bag',    12),
  ('Tomato Sauce Base (5L)',       'Sauces & Bases', 'tub',    20),
  ('BBQ Glaze (2L)',               'Sauces & Bases', 'bottle', 15),
  ('Curry Base Medium (5L)',       'Sauces & Bases', 'tub',    10),
  ('Garlic Butter (500g)',         'Sauces & Bases', 'tub',    28),
  ('Burger Buns ×24',              'Bakery & Dough', 'pack',   40),
  ('Flatbread Dough (1kg)',        'Bakery & Dough', 'ball',   35),
  ('Brioche Rolls ×12',            'Bakery & Dough', 'pack',   22),
  ('Diced Onions (2kg)',           'Veg Prep',       'bag',    50),
  ('Roasted Peppers (1kg)',        'Veg Prep',       'tub',    14),
  ('Coleslaw Mix (2kg)',           'Veg Prep',       'tub',    18),
  ('Chip Shop Batter Mix (5kg)',   'Dry Supplies',   'bag',    25),
  ('House Rub Spice Blend 500g',   'Dry Supplies',   'pot',    32);

