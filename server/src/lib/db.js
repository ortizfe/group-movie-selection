import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || '../data/processed/movies.sqlite');
export const db = new Database(dbPath);

export function migrate() {
  const schemaPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), './schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(sql);
}
