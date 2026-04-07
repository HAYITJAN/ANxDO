/**
 * Atlas ulanish xatolarida foydalanuvchiga tekshiruv ro‘yxati.
 */
function logAtlasHelp(err) {
  const msg = String(err?.message || err || '');
  const code = err?.code;

  if (msg.includes('bad auth') || msg.includes('authentication failed') || code === 8000) {
    console.error('\n──────── bad auth (login / parol mos emas) ────────');
    console.error('Bu VPN bilan bog‘liq emas — tarmoqga yetib, lekin Atlas loginni rad etmoqda.\n');
    console.error('1) cloud.mongodb.com → Database Access → foydalanuvchini tanlang.');
    console.error('2) Edit → parolni YANGILANG → server/.env dagi MONGODB_PASSWORD ga xuddi shu parolni yozing (qator oxirida probel bo‘lmasin).');
    console.error('3) MONGODB_URI ichidagi username (mongodb+srv://DAN_KEYINGI) Atlas dagi username bilan bir xil bo‘lsin.');
    console.error('4) Eng oson: Connect → Drivers → tayyor connection stringni nusxalang; parolni Atlas yangilaganingiz bilan almashtiring.');
    console.error('────────────────────────────────\n');
    return;
  }

  const name = err?.name || '';
  const isAtlas =
    name === 'MongooseServerSelectionError' ||
    msg.includes('Atlas') ||
    msg.includes('ReplicaSetNoPrimary') ||
    msg.includes('querySrv') ||
    msg.includes('ECONNREFUSED');

  if (!isAtlas) return;

  console.error('\n──────── Atlas tarmoq / cluster ────────');
  console.error('Quyidagilarni ketma-ket tekshiring:\n');
  console.error(
    '1) Network Access — IP: 0.0.0.0/0 yoki "Add Current IP Address".'
  );
  console.error('2) Cluster ishlayotgan bo‘lsin (Resume).');
  console.error('3) VPN / firewall 27017 chiqishini bloklamasin.');
  console.error('4) Connect → Drivers dan connection string yangilanganmi tekshiring.');
  console.error('────────────────────────────────\n');
}

module.exports = { logAtlasHelp };
