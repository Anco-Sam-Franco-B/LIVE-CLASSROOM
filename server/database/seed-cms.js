const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedCms() {
  try {
    console.log("Seeding CMS content...");
    const cmsSQL = fs.readFileSync(path.join(__dirname, "seed_cms.sql"), "utf8");
    await pool.query(cmsSQL);
    console.log("CMS content seeded successfully.");
  } catch (error) {
    console.error("CMS seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedCms();
