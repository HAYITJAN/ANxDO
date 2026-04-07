/**
 * Atlas mongodb+srv SRV DNS so‘rovlari ba’zi Windows/TPS muhitlarida default DNS orqali ishlamaydi.
 * Ulanishdan oldin chaqiring (seed va index birinchi import).
 */
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
