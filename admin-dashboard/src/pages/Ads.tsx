import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../lib/api";
import { uploadAdMedia } from "../lib/uploadAdMedia";

type AdItem = {
  _id: string;
  title?: string;
  body?: string;
  mediaType: "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  active?: boolean;
  sortOrder?: number;
  placement?: string;
};

const emptyForm = {
  title: "",
  body: "",
  mediaType: "image" as "image" | "video",
  imageUrl: "",
  videoUrl: "",
  linkUrl: "",
  active: true,
  sortOrder: 0,
  placement: "home",
};

export default function Ads() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await apiFetch("/ads/manage");
    if (res.ok) {
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(ad: AdItem) {
    setEditingId(ad._id);
    setForm({
      title: ad.title ?? "",
      body: ad.body ?? "",
      mediaType: ad.mediaType === "video" ? "video" : "image",
      imageUrl: ad.imageUrl ?? "",
      videoUrl: ad.videoUrl ?? "",
      linkUrl: ad.linkUrl ?? "",
      active: ad.active !== false,
      sortOrder: typeof ad.sortOrder === "number" ? ad.sortOrder : 0,
      placement: ad.placement ?? "home",
    });
    setErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErr(null);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const kind = form.mediaType === "video" ? "video" : "image";
    setUploading(true);
    setErr(null);
    try {
      const { url } = await uploadAdMedia(file, kind);
      setForm((f) => ({
        ...f,
        ...(kind === "image" ? { imageUrl: url } : { videoUrl: url }),
      }));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Yuklashda xato");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (form.mediaType === "image" && !form.imageUrl.trim()) {
      setErr("Rasm uchun fayl yuklang yoki URL kiriting");
      return;
    }
    if (form.mediaType === "video" && !form.videoUrl.trim()) {
      setErr("Video uchun fayl yuklang yoki URL kiriting");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const body = {
        title: form.title.trim(),
        body: form.body.trim(),
        mediaType: form.mediaType,
        imageUrl: form.imageUrl.trim(),
        videoUrl: form.videoUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
        placement: form.placement.trim() || "home",
      };
      const url = editingId ? `/ads/${editingId}` : "/ads";
      const method = editingId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Saqlanmadi");
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Reklama o‘chirilsinmi?")) return;
    setBusy(true);
    const res = await apiFetch(`/ads/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      await load();
    }
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display mb-2 text-lg font-semibold text-white">Reklama</h2>
      <p className="mb-6 text-sm text-zinc-500">
        Rasm/videoni kompyuterdan yuklang yoki havola kiriting. Faqat faol va{" "}
        <code className="text-zinc-400">home</code> joylashuvidagi reklamalar saytda ko‘rinadi.
      </p>

      {err && (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</p>
      )}

      <form onSubmit={save} className="mb-10 space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12]/60 p-5">
        <p className="text-sm font-medium text-zinc-300">{editingId ? "Tahrirlash" : "Yangi reklama"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sarlavha</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Matn</span>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Turi</span>
            <select
              value={form.mediaType}
              onChange={(e) => setForm((f) => ({ ...f, mediaType: e.target.value as "image" | "video" }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="image">Rasm</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Tartib</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          {form.mediaType === "image" ? (
            <div className="space-y-2 sm:col-span-2">
              <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Rasm *</span>
              <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#07060b] px-4 py-3 text-sm text-zinc-400">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="sr-only"
                  disabled={uploading || busy}
                  onChange={onPickFile}
                />
                <span className="text-violet-300">{uploading ? "Yuklanmoqda…" : "Kompyuterdan tanlash"}</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-600">Yoki URL</span>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="https://..."
                />
              </label>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="mt-2 max-h-40 rounded-lg border border-white/10 object-contain" />
              ) : null}
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Video *</span>
              <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#07060b] px-4 py-3 text-sm text-zinc-400">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="sr-only"
                  disabled={uploading || busy}
                  onChange={onPickFile}
                />
                <span className="text-violet-300">{uploading ? "Yuklanmoqda…" : "Kompyuterdan tanlash"}</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-600">Yoki URL (YouTube va h.k.)</span>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="https://..."
                />
              </label>
              {form.videoUrl ? (
                <video
                  src={form.videoUrl}
                  controls
                  className="mt-2 max-h-48 w-full rounded-lg border border-white/10 bg-black"
                  preload="metadata"
                />
              ) : null}
            </div>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Tashqi havola</span>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Joylashuv</span>
            <input
              value={form.placement}
              onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="home"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-white/20 bg-[#07060b]"
            />
            Faol
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={busy || uploading}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "…" : editingId ? "Yangilash" : "Qo‘shish"}
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit} className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-zinc-300">
              Bekor
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="mb-3 text-sm font-semibold text-zinc-400">Ro‘yxat</h3>
      <ul className="space-y-3">
        {ads.map((ad) => (
          <li
            key={ad._id}
            className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{ad.title || "(sarlavhasiz)"}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {ad.mediaType} · {ad.placement || "home"} · {ad.active !== false ? "faol" : "o‘chiq"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => startEdit(ad)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-violet-300"
              >
                Tahrirlash
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(ad._id)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-rose-300"
              >
                O‘chirish
              </button>
            </div>
          </li>
        ))}
      </ul>
      {ads.length === 0 ? <p className="text-sm text-zinc-600">Bo‘sh.</p> : null}
    </div>
  );
}
