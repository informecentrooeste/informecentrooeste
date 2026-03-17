import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

function extractInstagramId(url: string): string | null {
  const patterns = [
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]+)/,
    /youtu\.be\/([A-Za-z0-9_-]+)/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectPlatform(url: string): "instagram" | "youtube" | "unknown" {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "unknown";
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <div className="max-w-[560px] w-full">
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 cursor-pointer group"
          style={{ paddingBottom: "56.25%" }}
          onClick={() => setPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Vídeo YouTube"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[560px] w-full">
      <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function InstaEmbed({ postId }: { postId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(window as any).instgrm) {
      const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          (window as any).instgrm?.Embeds?.process();
        };
        document.body.appendChild(script);
      } else {
        const check = setInterval(() => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
            clearInterval(check);
          }
        }, 200);
        return () => clearInterval(check);
      }
    } else {
      setTimeout(() => (window as any).instgrm.Embeds.process(), 100);
    }
  }, [postId]);

  const embedUrl = `https://www.instagram.com/reel/${postId}/`;

  return (
    <div ref={containerRef} className="max-w-[400px]">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={embedUrl}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "12px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "0",
          maxWidth: "400px",
          minWidth: "280px",
          padding: 0,
          width: "100%",
        }}
      >
        <a href={embedUrl} target="_blank" rel="noreferrer" />
      </blockquote>
    </div>
  );
}

export function VideoEmbed({ url }: { url: string }) {
  const platform = detectPlatform(url);

  if (platform === "instagram") {
    const postId = extractInstagramId(url);
    if (postId) return <InstaEmbed postId={postId} />;
  }

  if (platform === "youtube") {
    const videoId = extractYouTubeId(url);
    if (videoId) return <YouTubeEmbed videoId={videoId} />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
      <ExternalLink className="h-4 w-4" /> Assistir vídeo
    </a>
  );
}
