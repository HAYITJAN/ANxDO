/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const dirs = [
  path.join(process.cwd(), ".next"),
  path.join(process.cwd(), "node_modules", ".cache"),
];

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* `.next` Windows da qulflangan bo‘lsa — qisqa kutish */
  }
}

function rmWithRetry(dir) {
  if (!fs.existsSync(dir)) return;
  for (let i = 0; i < 8; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err) {
      if (i === 7) throw err;
      sleepSync(400 + i * 200);
    }
  }
}

try {
  for (const d of dirs) {
    rmWithRetry(d);
  }
} catch (err) {
  console.error(
    "Tozalash muvaffaqiyatsiz. Avval `npm run dev` ni to‘xtating (Ctrl+C), keyin `npm run clean` ni qayta ishga tushiring.\n",
    err.message
  );
  process.exit(1);
}
