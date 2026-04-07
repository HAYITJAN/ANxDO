/**
 * Atlas ulanishi.
 * `family: 4` ba’zi Windows / provayderlarda IPv6 yoki NAT bilan ReplicaSetNoPrimary xatosiga olib keladi — qo‘llanmaydi.
 */
module.exports = {
  serverSelectionTimeoutMS: 60_000,
  connectTimeoutMS: 25_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
};
