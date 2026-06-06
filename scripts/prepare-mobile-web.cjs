const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "www");

const staticEntries = [
  "_headers",
  "app",
  "app.html",
  "favicon.png",
  "favicon.svg",
  "feed.xml",
  "feeds",
  "index.html",
  "manifest.json",
  "nearnow-banner.svg",
  "service-worker.js",
  "icons",
  "netlify",
  "vendor",
  "styles.css",
  "app.js",
  "feeds.js",
  "home.css",
  "home.js"
];

function rmIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function copyEntry(entryName) {
  const source = path.join(projectRoot, entryName);
  const target = path.join(outputDir, entryName);

  if (!fs.existsSync(source)) {
    throw new Error(`Required web asset is missing: ${entryName}`);
  }

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

rmIfExists(outputDir);
fs.mkdirSync(outputDir, { recursive: true });

for (const entry of staticEntries) {
  copyEntry(entry);
}

console.log("Prepared mobile web bundle in ./www");
