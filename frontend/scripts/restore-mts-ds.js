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
console.log(
  `[@mts-ds restore] WARNING: @mts-ds was removed by npm — restored ${count} packages from backup.`
);
console.log('[@mts-ds restore] Always use: npm install --legacy-peer-deps --prefer-offline');
