const { Pool } = require("pg");
require("dotenv").config({ override: true });

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = db;