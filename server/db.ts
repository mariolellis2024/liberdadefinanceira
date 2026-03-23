import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ============ TYPES ============

export interface PriceVariation {
  id: number;
  name: string;
  link: string;
  price_original: string;
  price_avista: string;
  price_parcelas: string;
  page_mode: 'open' | 'hidden';
  active: boolean;
  created_at: string;
}

export interface VariationStats {
  variation_id: number;
  variation_name: string;
  views: number;
  clicks: number;
  ctr: number;
}

// ============ INIT ============

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Price variations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_variations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        link TEXT NOT NULL DEFAULT '',
        price_original VARCHAR(20) NOT NULL DEFAULT 'R$ 394',
        price_avista VARCHAR(20) NOT NULL DEFAULT 'R$ 197',
        price_parcelas VARCHAR(30) NOT NULL DEFAULT '12x de R$ 19,70',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Variation stats table — tracks views and clicks per variation
    await client.query(`
      CREATE TABLE IF NOT EXISTS variation_events (
        id SERIAL PRIMARY KEY,
        variation_id INTEGER NOT NULL REFERENCES price_variations(id) ON DELETE CASCADE,
        event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('view', 'click')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed initial password if not exists
    const result = await client.query(
      `SELECT key FROM settings WHERE key = 'admin_password'`
    );
    if (result.rows.length === 0) {
      const hash = await bcrypt.hash('Free2026@', 12);
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('admin_password', $1)`,
        [hash]
      );
      console.log('✓ Initial admin password seeded');
    }

    // Ensure ga_tracking_id row exists
    const gaResult = await client.query(
      `SELECT key FROM settings WHERE key = 'ga_tracking_id'`
    );
    if (gaResult.rows.length === 0) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('ga_tracking_id', '')`
      );
    }

    // Add page_mode column if missing (migration)
    await client.query(`
      ALTER TABLE price_variations ADD COLUMN IF NOT EXISTS page_mode VARCHAR(10) NOT NULL DEFAULT 'open'
    `);

    console.log('✓ Database initialized');
  } finally {
    client.release();
  }
}

// ============ SETTINGS ============

export async function getPasswordHash(): Promise<string> {
  const result = await pool.query(
    `SELECT value FROM settings WHERE key = 'admin_password'`
  );
  return result.rows[0]?.value || '';
}

export async function updatePassword(newHash: string): Promise<void> {
  await pool.query(
    `UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'admin_password'`,
    [newHash]
  );
}

export async function getSetting(key: string): Promise<string> {
  const result = await pool.query(
    `SELECT value FROM settings WHERE key = $1`,
    [key]
  );
  return result.rows[0]?.value || '';
}

export async function updateSetting(
  key: string,
  value: string
): Promise<void> {
  const result = await pool.query(
    `SELECT key FROM settings WHERE key = $1`,
    [key]
  );
  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)`,
      [key, value]
    );
  } else {
    await pool.query(
      `UPDATE settings SET value = $2, updated_at = NOW() WHERE key = $1`,
      [key, value]
    );
  }
}

// ============ PRICE VARIATIONS ============

export async function getVariations(): Promise<PriceVariation[]> {
  const result = await pool.query(
    `SELECT * FROM price_variations ORDER BY created_at ASC`
  );
  return result.rows;
}

export async function getActiveVariations(): Promise<PriceVariation[]> {
  const result = await pool.query(
    `SELECT * FROM price_variations WHERE active = true ORDER BY created_at ASC`
  );
  return result.rows;
}

export async function getVariationById(
  id: number
): Promise<PriceVariation | null> {
  const result = await pool.query(
    `SELECT * FROM price_variations WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createVariation(data: {
  name: string;
  link: string;
  price_original: string;
  price_avista: string;
  price_parcelas: string;
  page_mode?: 'open' | 'hidden';
}): Promise<PriceVariation> {
  const result = await pool.query(
    `INSERT INTO price_variations (name, link, price_original, price_avista, price_parcelas, page_mode)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.name, data.link, data.price_original, data.price_avista, data.price_parcelas, data.page_mode || 'open']
  );
  return result.rows[0];
}

export async function updateVariation(
  id: number,
  data: {
    name: string;
    link: string;
    price_original: string;
    price_avista: string;
    price_parcelas: string;
    page_mode: 'open' | 'hidden';
    active: boolean;
  }
): Promise<PriceVariation | null> {
  const result = await pool.query(
    `UPDATE price_variations
     SET name = $2, link = $3, price_original = $4, price_avista = $5, price_parcelas = $6, page_mode = $7, active = $8
     WHERE id = $1 RETURNING *`,
    [id, data.name, data.link, data.price_original, data.price_avista, data.price_parcelas, data.page_mode || 'open', data.active]
  );
  return result.rows[0] || null;
}

export async function deleteVariation(id: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM price_variations WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============ VARIATION EVENTS (Analytics) ============

export async function recordEvent(
  variationId: number,
  eventType: 'view' | 'click'
): Promise<void> {
  await pool.query(
    `INSERT INTO variation_events (variation_id, event_type) VALUES ($1, $2)`,
    [variationId, eventType]
  );
}

export async function getVariationStats(): Promise<VariationStats[]> {
  const result = await pool.query(`
    SELECT
      pv.id AS variation_id,
      pv.name AS variation_name,
      COALESCE(SUM(CASE WHEN ve.event_type = 'view' THEN 1 ELSE 0 END), 0)::integer AS views,
      COALESCE(SUM(CASE WHEN ve.event_type = 'click' THEN 1 ELSE 0 END), 0)::integer AS clicks,
      CASE
        WHEN COALESCE(SUM(CASE WHEN ve.event_type = 'view' THEN 1 ELSE 0 END), 0) = 0 THEN 0
        ELSE ROUND(
          COALESCE(SUM(CASE WHEN ve.event_type = 'click' THEN 1 ELSE 0 END), 0)::numeric /
          COALESCE(SUM(CASE WHEN ve.event_type = 'view' THEN 1 ELSE 0 END), 1)::numeric * 100,
          2
        )
      END AS ctr
    FROM price_variations pv
    LEFT JOIN variation_events ve ON ve.variation_id = pv.id
    GROUP BY pv.id, pv.name
    ORDER BY pv.created_at ASC
  `);
  return result.rows;
}

export default pool;
