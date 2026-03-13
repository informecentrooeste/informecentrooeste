import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

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

export function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const postId = extractInstagramId(url);

  useEffect(() => {
    if (!postId) return;

    if (!(window as any).instgrm) {
      const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          (window as any).instgrm?.Embeds?.process();
          setLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        const check = setInterval(() => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
            setLoaded(true);
            clearInterval(check);
          }
        }, 200);
        return () => clearInterval(check);
      }
    } else {
      (window as any).instgrm.Embeds.process();
      setLoaded(true);
    }
  }, [postId]);

  if (!postId) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
        <ExternalLink className="h-4 w-4" /> Assistir vídeo
      </a>
    );
  }

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
