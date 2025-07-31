// scripts/gen-env.js
// fungsi file ini adalah agar mengubah base url di.env secara otomatis untuk fetching ke API
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
const envPath = path.join(__dirname, './.env');

const envContent = `NEXT_PUBLIC_API_BASE_URL=http://${ip}:3000`;

fs.writeFileSync(envPath, envContent);

console.log(`✅ .env generated with IP: ${ip}`);
