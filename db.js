require("dotenv").config();
const { Pool } = require("pg");

// ✅ PostgreSQL connection settings
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ✅ Debugging: Test Connection on Startup
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL Database:", process.env.DB_NAME);
    client.release(); // Release the client immediately
  })
  .catch(error => {
    console.error("❌ ERROR: Database connection failed!", error.message);
    process.exit(1); // Exit process if DB connection fails
  });

// ✅ Handle Unexpected Disconnections
pool.on("error", (err) => {
  console.error("🔥 CRITICAL ERROR: Unexpected PostgreSQL connection error!", err.message);
});

module.exports = pool;
