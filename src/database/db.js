const fs = require("fs/promises");

const { Pool } = require("pg");

const config = require("../config");

const pool = new Pool({
  connectionString: config.databaseUrl,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initializeDatabase() {
  const sql = await fs.readFile(config.migrationsPath, "utf8");
  await pool.query(sql);
}

module.exports = {
  pool,
  query,
  initializeDatabase,
};
