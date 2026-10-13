const fs = require('fs');
const path = require('path');

module.exports = function loadEnv() {
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  const envFilePath = path.join(__dirname, '..', '.env');
  const envPath = fs.existsSync(envLocalPath) ? envLocalPath : (fs.existsSync(envFilePath) ? envFilePath : null);

  if (!envPath) {
    console.error('❌ Neither .env.local nor .env found in root folder');
    return;
  }

  const contents = fs.readFileSync(envPath, 'utf8');

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return;

    const idx = trimmed.indexOf('=');
    if (idx === -1) return;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });

  console.log('✔ .env.local loaded');
};