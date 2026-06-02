import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const dbPool = new Pool({
  connectionString,
  ssl: connectionString?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});
