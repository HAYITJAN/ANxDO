/**
 * Body dan `streams` va `videoUrl` ni bir xil holatga keltiradi.
 * `streams` bo‘sh bo‘lsa, lekin `videoUrl` bo‘lsa — bitta default oqim.
 */
function normalizeMovieStreams(body) {
  if (!body || typeof body !== 'object') return body;
  const out = { ...body };
  const list = [];

  if (Array.isArray(out.streams)) {
    for (const s of out.streams) {
      if (!s || typeof s !== 'object') continue;
      const lang = String(s.lang || '').trim();
      const videoUrl = String(s.videoUrl || '').trim();
      const externalWatchUrl = String(s.externalWatchUrl || '').trim();
      if (!lang || (!videoUrl && !externalWatchUrl)) continue;
      list.push({
        lang,
        label: String(s.label || '').trim(),
        videoUrl,
        externalWatchUrl,
      });
    }
  }

  const legacy = String(out.videoUrl || '').trim();
  if (list.length === 0 && legacy) {
    list.push({ lang: 'default', label: 'Asosiy', videoUrl: legacy, externalWatchUrl: '' });
  }

  out.streams = list;
  const firstWithVideo = list.find((x) => x.videoUrl);
  out.videoUrl = firstWithVideo?.videoUrl || list[0]?.videoUrl || '';
  return out;
}

module.exports = { normalizeMovieStreams };
