/**
 * Update REACT_APP_API_URL in .env, build the CRA app, then deploy to Firebase.
 *
 * Usage:
 *   npm run deploy -- https://adlcompany.com/
 *   npm run deploy -- https://192.168.1.50:5443
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const clientRoot = path.join(__dirname, "..");
const envPath = path.join(clientRoot, ".env");

function fail(message) {
  console.error(`deploy: ${message}`);
  process.exit(1);
}

function normalizeApiUrl(raw) {
  const trimmed = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!trimmed) {
    fail(
      'Missing API URL.\n  Example: npm run deploy -- https://adlcompany.com/',
    );
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    fail(`Invalid URL: ${raw}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    fail(`URL must start with http:// or https:// (got ${parsed.protocol})`);
  }

  // Match client/src/config/api.js: strip trailing slashes from the origin base.
  return trimmed.replace(/\/+$/, "");
}

function updateEnvFile(apiUrl) {
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const lines = existing.length ? existing.split(/\r?\n/) : [];
  const nextLine = `REACT_APP_API_URL="${apiUrl}"`;
  const keyPattern = /^\s*#?\s*REACT_APP_API_URL\s*=/;

  let replaced = false;
  const updated = lines.map((line) => {
    if (!keyPattern.test(line)) return line;
    if (replaced) return line;
    replaced = true;
    return nextLine;
  });

  if (!replaced) {
    if (updated.length && updated[updated.length - 1] !== "") {
      updated.push("");
    }
    updated.push(nextLine);
  }

  let content = updated.join("\n");
  if (!content.endsWith("\n")) content += "\n";
  fs.writeFileSync(envPath, content, "utf8");
  console.log(`deploy: updated ${path.relative(clientRoot, envPath)} -> ${nextLine}`);
}

function run(command) {
  console.log(`deploy: ${command}`);
  const result = spawnSync(command, {
    cwd: clientRoot,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  if (result.error) {
    fail(result.error.message);
  }
  if (result.status !== 0) {
    fail(`Command failed with exit code ${result.status}: ${command}`);
  }
}

const apiUrl = normalizeApiUrl(process.argv[2]);
updateEnvFile(apiUrl);
run("npm run build");
run("firebase deploy");
console.log("deploy: done");
