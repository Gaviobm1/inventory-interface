const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

module.exports = new Pool({
  connectionString: `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PWD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  ssl: {
    rejectUnauthorized: false,
  },
});
