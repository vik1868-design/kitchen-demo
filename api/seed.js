// api/seed.js
// Runs at container startup. Inserts demo users (with correct bcrypt hashes)
// and sample orders. Safe to re-run — uses ON CONFLICT DO NOTHING / DO UPDATE.

const bcrypt   = require("bcrypt");
const { Pool } = require("pg");

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Retry until DB is ready
  for (let i = 0; i < 15; i++) {
    try {
      await pool.query("SELECT 1");
      break;
    } catch {
      console.log(`[seed] Waiting for DB (${i + 1}/15)...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const PASSWORD = "demo1234";
  const hash     = await bcrypt.hash(PASSWORD, 10);
  console.log(`[seed] Generated hash for "${PASSWORD}"`);

  const users = [
    { id: "aaaaaaaa-0000-0000-0000-000000000001", email: "admin@kitchen.local",      full_name: "Admin User",          role: "admin",         site_id: null },
    { id: "aaaaaaaa-0000-0000-0000-000000000002", email: "kitchen@kitchen.local",    full_name: "Head Chef",           role: "kitchen_staff", site_id: null },
    { id: "aaaaaaaa-0000-0000-0000-000000000003", email: "smokehouse@kitchen.local", full_name: "Smokehouse Manager",  role: "site_manager",  site_id: "11111111-0000-0000-0000-000000000001" },
    { id: "aaaaaaaa-0000-0000-0000-000000000004", email: "spiceroute@kitchen.local", full_name: "Spice Route Manager", role: "site_manager",  site_id: "11111111-0000-0000-0000-000000000002" },
    { id: "aaaaaaaa-0000-0000-0000-000000000005", email: "burgerbar@kitchen.local",  full_name: "Burger Bar Manager",  role: "site_manager",  site_id: "11111111-0000-0000-0000-000000000003" },
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, site_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [u.id, u.email, hash, u.full_name, u.role, u.site_id]
    );
  }
  console.log(`[seed] Users ready (${users.length})`);

  // Sample orders only if none exist
  const { rows: existing } = await pool.query("SELECT COUNT(*) FROM orders");
  if (parseInt(existing[0].count) === 0) {
    const getProduct = async (name) => {
      const { rows } = await pool.query("SELECT id FROM products WHERE name=$1", [name]);
      return rows[0]?.id;
    };

    const today = new Date().toISOString().split("T")[0];

    const [pulledPork, bbqGlaze, burgerBuns, chicken, batter, onions] = await Promise.all([
      getProduct("Pulled Pork (2kg)"),
      getProduct("BBQ Glaze (2L)"),
      getProduct("Burger Buns \xd724"),
      getProduct("Marinated Chicken Thighs 3kg"),
      getProduct("Chip Shop Batter Mix (5kg)"),
      getProduct("Diced Onions (2kg)"),
    ]);

    const { rows: [o1] } = await pool.query(
      `INSERT INTO orders (site_id, placed_by, delivery_date, status, note)
       VALUES ($1,$2,$3,'preparing','Please label all trays') RETURNING id`,
      ["11111111-0000-0000-0000-000000000001", "aaaaaaaa-0000-0000-0000-000000000003", today]
    );
    for (const [pid, qty] of [[pulledPork,3],[bbqGlaze,2],[burgerBuns,4]]) {
      if (pid) await pool.query("INSERT INTO order_items (order_id,product_id,qty) VALUES ($1,$2,$3)", [o1.id, pid, qty]);
    }

    const { rows: [o2] } = await pool.query(
      `INSERT INTO orders (site_id, placed_by, delivery_date, status)
       VALUES ($1,$2,$3,'confirmed') RETURNING id`,
      ["11111111-0000-0000-0000-000000000003", "aaaaaaaa-0000-0000-0000-000000000005", today]
    );
    for (const [pid, qty] of [[chicken,5],[batter,2],[onions,3]]) {
      if (pid) await pool.query("INSERT INTO order_items (order_id,product_id,qty) VALUES ($1,$2,$3)", [o2.id, pid, qty]);
    }

    console.log("[seed] Sample orders created");
  } else {
    console.log("[seed] Orders already exist, skipping samples");
  }

  await pool.end();
  console.log("[seed] Done");
}

seed().catch(err => {
  console.error("[seed] FAILED:", err.message);
  process.exit(1);
});
