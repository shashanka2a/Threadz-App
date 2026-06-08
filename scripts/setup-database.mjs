import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional when vars are exported in shell
  }
}

async function runFile(client, filename) {
  const path = join(root, "supabase", filename);
  const sql = readFileSync(path, "utf8");
  console.log(`→ Applying ${filename}...`);
  await client.query(sql);
  console.log(`✓ ${filename}`);
}

async function main() {
  loadEnvLocal();

  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error(
      [
        "Missing SUPABASE_DB_URL.",
        "",
        "Add your Supabase Postgres connection string to .env.local:",
        "  SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres",
        "",
        "Find it in Supabase Dashboard → Project Settings → Database → Connection string (URI).",
      ].join("\n"),
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.\n");

    await runFile(client, "schema.sql");
    await runFile(client, "seed.sql");

    const { rows } = await client.query(`
      select
        (select count(*)::int from public.categories) as categories,
        (select count(*)::int from public.products) as products
    `);

    console.log(`\nDone. categories=${rows[0].categories}, products=${rows[0].products}`);
  } catch (error) {
    console.error("\nSetup failed:", error.message ?? error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
