import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
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

    console.log('✓ Database initialized');
  } finally {
    client.release();
  }
}

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

export default pool;
