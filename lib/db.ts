import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Please define the DATABASE_URL environment variable");
}

export const sql = neon(url);
