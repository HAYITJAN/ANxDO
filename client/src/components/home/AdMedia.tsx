import type { AdItem } from "@/lib/ads";
import { isIframeEmbedUrl, toEmbedUrl } from "@/lib/videoEmbed";

export function AdMedia({
  ad,
  className = "",
  imgClassName = "h-full w-full object-cover",
}: {
  ad: AdItem;
  className?: string;
  imgClassName?: string;
}) {
  if (ad.mediaType === "image" && ad.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- tashqi URL / admin reklama
    return (
      <img src={ad.imageUrl} alt={ad.title || ""} className={imgClassName} loading="lazy" />
    );
  }
  if (ad.mediaType === "video" && ad.videoUrl) {
    const embed = toEmbedUrl(ad.videoUrl);
    if (embed && isIframeEmbedUrl(embed)) {
      return (
        <iframe
          title={ad.title || "Media"}
          src={embed}
          className={`aspect-video h-full min-h-[120px] w-full rounded-xl border-0 bg-black ${className}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        src={ad.videoUrl}
        controls
        playsInline
        className={`aspect-video w-full rounded-xl bg-black ${className}`}
        preload="metadata"
      />
    );
  }
  return null;
}
