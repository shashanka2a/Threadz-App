import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Blob } from "node:buffer";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets");

const FILENAME_TO_COLOR = {
  "charcoal.jpg": "Charcoal Melange",
  "grey.jpg": "Grey Melange",
  "cream.jpg": "Cream",
  "LTGreen.jpg": "LT Green",
  "plum.jpg": "Plum",
  "PTBlue.jpg": "P.T Blue",
  "Burgandry.jpg": "Burgundy",
  "dustyRose.jpg": "Dusty Rose",
  "brown.jpg": "Brown",
  "steelGrey.jpg": "Steel Grey",
  "wildGinger.jpg": "Wild Ginger",
  "mossGreen.jpg": "Moss Green",
  "parkPetrol.jpg": "Park Petrol",
  "pink.jpg": "Pink",
};

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function loadEnvLocal() {
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
}

function getMimeType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

async function uploadAsset(filename) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "ml_default";

  if (!cloudName) {
    throw new Error("Missing CLOUDINARY_CLOUD_NAME in .env.local");
  }

  const filePath = join(assetsDir, filename);
  const file = readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([file], { type: getMimeType(filename) }), filename);
  form.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? `Failed to upload ${filename}`);
  }

  return {
    filename,
    color: FILENAME_TO_COLOR[filename],
    url: data.secure_url,
    publicId: data.public_id,
  };
}

function buildProductImagesTs(uploads, cloudName) {
  const byColor = Object.fromEntries(
    uploads.filter((item) => item.color).map((item) => [item.color, item.url]),
  );

  const defaultUrl = byColor["Charcoal Melange"] ?? uploads[0]?.url ?? "";

  const colorEntries = Object.entries(byColor)
    .map(([color, url]) => `  "${color}": "${url}",`)
    .join("\n");

  return `/** Cloudinary-hosted product images. */
export const PRODUCT_IMAGE_BASE_URL =
  "https://res.cloudinary.com/${cloudName}/image/upload";

export const PRODUCT_IMAGE_BY_COLOR: Record<string, string> = {
${colorEntries}
};

export function getProductImageUrl(color: string): string {
  return PRODUCT_IMAGE_BY_COLOR[color] ?? "${defaultUrl}";
}
`;
}

function replaceGithubUrls(content, uploads) {
  let updated = content;
  for (const { filename, url } of uploads) {
    const githubUrl = `https://raw.githubusercontent.com/shashanka2a/Threadz-App/main/assets/${filename}`;
    updated = updated.split(githubUrl).join(url);
  }
  return updated;
}

async function updateDatabase(uploads) {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.warn("SUPABASE_DB_URL not set — skipping database update");
    return;
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    for (const { color, url } of uploads) {
      if (!color) continue;
      const result = await client.query(
        `UPDATE products SET image = $1 WHERE color = $2 AND is_active = true`,
        [url, color],
      );
      console.log(`  DB: ${color} → ${result.rowCount} row(s)`);
    }

    const githubPattern =
      "https://raw.githubusercontent.com/shashanka2a/Threadz-App/main/assets/%";
    const fallback = uploads.find((item) => item.color === "Charcoal Melange")?.url;
    if (fallback) {
      const result = await client.query(
        `UPDATE products SET image = $1 WHERE image LIKE $2`,
        [fallback, githubPattern],
      );
      if (result.rowCount > 0) {
        console.log(`  DB: replaced ${result.rowCount} remaining GitHub URL(s)`);
      }
    }
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnvLocal();

  const files = readdirSync(assetsDir).filter((name) =>
    /\.(jpe?g|png|webp)$/i.test(name),
  );

  console.log(
    `Uploading ${files.length} images to Cloudinary (preset: ${process.env.CLOUDINARY_UPLOAD_PRESET ?? "ml_default"})...\n`,
  );

  const uploads = [];
  for (const filename of files.sort()) {
    const item = await uploadAsset(filename);
    uploads.push(item);
    console.log(`✓ ${filename} → ${item.url}`);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const productImagesPath = join(root, "src/data/product-images.ts");
  writeFileSync(productImagesPath, buildProductImagesTs(uploads, cloudName), "utf8");
  console.log(`\n✓ Updated ${productImagesPath}`);

  for (const sqlFile of ["seed.sql", "full-setup.sql"]) {
    const sqlPath = join(root, "supabase", sqlFile);
    const sql = readFileSync(sqlPath, "utf8");
    writeFileSync(sqlPath, replaceGithubUrls(sql, uploads), "utf8");
    console.log(`✓ Updated supabase/${sqlFile}`);
  }

  console.log("\nUpdating live database...");
  await updateDatabase(uploads);

  const mapPath = join(root, "scripts/cloudinary-urls.json");
  writeFileSync(mapPath, JSON.stringify(uploads, null, 2), "utf8");
  console.log(`✓ Wrote ${mapPath}`);
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
