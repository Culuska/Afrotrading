import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

function svgIcon(size) {
  const r = size * 0.22;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="#070b14"/>
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f3d98b"/>
        <stop offset="45%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#96741f"/>
      </linearGradient>
    </defs>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, Helvetica, sans-serif" font-weight="800"
      font-size="${size * 0.46}" fill="url(#gold)">A</text>
  </svg>`;
}

async function main() {
  const sizes = [
    { size: 192, name: "icon-192.png" },
    { size: 512, name: "icon-512.png" },
    { size: 180, name: "apple-icon.png" },
  ];

  for (const { size, name } of sizes) {
    await sharp(Buffer.from(svgIcon(size))).png().toFile(path.join(publicDir, name));
    console.log(`Generated ${name}`);
  }

  // Favicon (32x32) saved as .ico via png fallback naming isn't true ICO, so keep as png favicon
  await sharp(Buffer.from(svgIcon(64))).resize(32, 32).png().toFile(path.join(publicDir, "favicon-32.png"));

  // Open Graph image
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#070b14"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <defs>
      <radialGradient id="glow" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#d4af37" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#070b14" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f3d98b"/>
        <stop offset="45%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#96741f"/>
      </linearGradient>
    </defs>
    <text x="90" y="300" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="86" fill="#f4f6fb">Afro<tspan fill="url(#gold)">Trading</tspan></text>
    <text x="90" y="380" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="34" fill="#9aa3b5">Premium Gold (XAUUSD) Trading Signals</text>
    <rect x="90" y="430" width="230" height="56" rx="28" fill="url(#gold)"/>
    <text x="205" y="466" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="24" fill="#070b14">Join Telegram</text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(publicDir, "og-image.png"));
  console.log("Generated og-image.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
