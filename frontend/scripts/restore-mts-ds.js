const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const backup = path.join(root, '.mts-ds-backup');
const dest = path.join(root, 'node_modules', '@mts-ds');

if (!fs.existsSync(backup)) {
  process.exit(0);
}

if (fs.existsSync(dest)) {
  process.exit(0);
}

fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });
fs.cpSync(backup, dest, { recursive: true, force: true });
const count = fs.readdirSync(dest).length;

// Remove nested @types/react from @mts-ds packages — they conflict with the project's @types/react
let cleaned = 0;
for (const pkg of fs.readdirSync(dest)) {
  const nested = path.join(dest, pkg, 'node_modules', '@types', 'react');
  if (fs.existsSync(nested)) { fs.rmSync(nested, { recursive: true, force: true }); cleaned++; }
}
if (cleaned > 0) console.log(`[@mts-ds restore] Removed nested @types/react from ${cleaned} packages (React type conflict fix).`);

console.log(
  `[@mts-ds restore] WARNING: @mts-ds was removed by npm — restored ${count} packages from backup.`
);
console.log('[@mts-ds restore] Always use: npm install --legacy-peer-deps --prefer-offline');
