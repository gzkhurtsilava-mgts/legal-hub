const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'node_modules', '@mts-ds');
const dest = path.join(root, '.mts-ds-backup');

if (!fs.existsSync(src)) {
  process.exit(0);
}

fs.cpSync(src, dest, { recursive: true, force: true });
const count = fs.readdirSync(dest).length;
console.log(`[@mts-ds backup] Backed up ${count} packages to .mts-ds-backup/`);
