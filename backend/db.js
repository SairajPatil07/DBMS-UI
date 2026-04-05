// db.js — Oracle Connection Pool
const oracledb = require('oracledb');
require('dotenv').config();

// Use Thin mode (no Oracle Client installation needed)
oracledb.initOracleClient(); // Remove this line if using Thin mode without Instant Client

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user:             process.env.DB_USER,
      password:         process.env.DB_PASSWORD,
      connectString:    process.env.DB_CONNECTION_STRING,
      poolMin:          2,
      poolMax:          10,
      poolIncrement:    1,
    });
    console.log('✅ Oracle DB connection pool created');
  } catch (err) {
    console.error('❌ DB Pool creation failed:', err.message);
    process.exit(1);
  }
}

async function execute(sql, params = [], options = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    options.outFormat = oracledb.OUT_FORMAT_OBJECT; // returns rows as JS objects
    const result = await connection.execute(sql, params, options);
    return result;
  } finally {
    if (connection) await connection.close();
  }
}

async function close() {
  await pool.close(0);
}

module.exports = { initialize, execute, close };
