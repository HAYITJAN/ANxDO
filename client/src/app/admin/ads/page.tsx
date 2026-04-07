"use client";

import { apiFetch } from "@/lib/api";
import type { AdItem } from "@/lib/ads";
import { uploadAdMedia } from "@/lib/uploadAdMedia";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useEffect, useState } from "react";

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

export default function AdminAdsPage() {
  const token = useAuthStore((s) => s.token);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch("/ads/manage", { token });
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    if (!file || !token) return;
    const kind = form.mediaType === "video" ? "video" : "image";
    setUploading(true);
    setErr(null);
    try {
      const { url } = await uploadAdMedia(file, kind, token);
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
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
      const res = await apiFetch(url, { method, token, body: JSON.stringify(body) });
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
    if (!token || !confirm("Reklama o‘chirilsinmi?")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch(`/ads/${id}`, { method: "DELETE", token });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "O‘chirilmadi");
      }
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-[family-name:var(--font-syne)] mb-2 text-lg font-semibold text-white">
        Reklama
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Rasm yoki videoni kompyuterdan yuklang yoki havola qo‘ying. Matn va ixtiyoriy tashqi havola. Faqat{" "}
        <strong>faol</strong> reklamalar bosh sahifada (placement:{" "}
        <code className="text-zinc-400">home</code>) ko‘rinadi.
      </p>

      {err && (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {err}
        </p>
      )}

      <form onSubmit={save} className="mb-10 space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12]/60 p-5">
        <p className="text-sm font-medium text-zinc-300">{editingId ? "Tahrirlash" : "Yangi reklama"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sarlavha</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
              placeholder="Masalan: Yangi mahsulot"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Matn / tavsif</span>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
              placeholder="Qisqa izoh (ixtiyoriy)"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Turi</span>
            <select
              value={form.mediaType}
              onChange={(e) =>
                setForm((f) => ({ ...f, mediaType: e.target.value as "image" | "video" }))
              }
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="image">Rasm</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Tartib raqami</span>
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
              <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#07060b] px-4 py-3 text-sm text-zinc-400 hover:border-violet-500/40">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="sr-only"
                  disabled={uploading || busy}
                  onChange={onPickFile}
                />
                <span className="text-violet-300">
                  {uploading ? "Yuklanmoqda…" : "Kompyuterdan rasm tanlash"}
                </span>
                <span className="text-xs text-zinc-600">(JPEG, PNG, GIF, WebP, max ~15 MB)</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-600">Yoki tashqi havola</span>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="https://..."
                />
              </label>
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt=""
                  className="mt-2 max-h-40 w-auto rounded-lg border border-white/10 object-contain"
                />
              ) : null}
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Video *</span>
              <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#07060b] px-4 py-3 text-sm text-zinc-400 hover:border-violet-500/40">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="sr-only"
                  disabled={uploading || busy}
                  onChange={onPickFile}
                />
                <span className="text-violet-300">
                  {uploading ? "Yuklanmoqda…" : "Kompyuterdan video tanlash"}
                </span>
                <span className="text-xs text-zinc-600">(MP4, WebM, MOV, max ~120 MB)</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-600">Yoki havola (YouTube yoki boshqa URL)</span>
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
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Tashqi havola (bosilganda ochiladi, ixtiyoriy)
            </span>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="https://..."
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Joylashuv</span>
            <input
              value={form.placement}
              onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="home yoki sidebar"
            />
            <span className="mt-1 block text-[11px] text-zinc-600">
              <code className="text-zinc-400">home</code> — bosh sahifa modali / lenta;{" "}
              <code className="text-zinc-400">sidebar</code> — o‘ng 150px vertikal panel (faqat katta ekran).
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-white/20 bg-[#07060b]"
            />
            Faol (saytda ko‘rsatish)
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={busy || uploading || !token}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-950/30 transition hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? "Saqlanmoqda…" : editingId ? "Yangilash" : "Qo‘shish"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Bekor qilish
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="mb-3 text-sm font-semibold text-zinc-400">Mavjud reklamalar</h3>
      <ul className="space-y-3">
        {ads.map((ad) => (
          <li
            key={ad._id}
            className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{ad.title || "(sarlavhasiz)"}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {ad.mediaType === "image" ? "Rasm" : "Video"} · tartib {ad.sortOrder ?? 0} ·{" "}
                {ad.placement || "home"} · {ad.active !== false ? "faol" : "o‘chirilgan"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => startEdit(ad)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-violet-300 hover:bg-white/5"
              >
                Tahrirlash
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(ad._id)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-rose-300/90 hover:bg-rose-500/10"
              >
                O‘chirish
              </button>
            </div>
          </li>
        ))}
      </ul>
      {ads.length === 0 ? <p className="text-sm text-zinc-600">Hozircha reklama yo‘q.</p> : null}
    </div>
  );
}
