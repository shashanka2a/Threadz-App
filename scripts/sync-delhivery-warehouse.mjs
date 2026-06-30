#!/usr/bin/env node
/**
 * Sync Threadz pickup warehouse with Delhivery (create or update).
 * Usage: npm run delhivery:sync-warehouse
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
    // optional
  }
}

async function main() {
  loadEnvLocal();
  const { registerWarehouse, getWarehouseConfigFromEnv } = await import(
    "../src/lib/delhivery.ts"
  );

  const config = getWarehouseConfigFromEnv();
  console.log("Syncing warehouse:", config.name, `(${config.pin})`);

  const result = await registerWarehouse(config);
  if (!result.success) {
    console.error("Failed:", result.error);
    process.exit(1);
  }

  console.log(`${result.action}: ${result.message}`);
}

main();
