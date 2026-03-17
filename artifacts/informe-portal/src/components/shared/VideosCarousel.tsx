import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

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

function VideoCard({ video }: { video: any }) {
  const url = video.videoUrl || "";
  const igId = extractInstagramId(url);
  const ytId = extractYouTubeId(url);
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const [playing, setPlaying] = useState(false);
  const uploadedThumb = video.thumbnailUrl ? getImageUrl(video.thumbnailUrl) : null;
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const thumbSrc = uploadedThumb || ytThumb;

  const openLink = () => {
    const link = video.redirectUrl || video.videoUrl;
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  const handlePlay = () => {
    if (igId) {
      openLink();
    } else {
      setPlaying(true);
    }
  };

  if (playing && ytId) {
    return (
      <div data-video-card className="min-w-[220px] sm:min-w-[250px] md:min-w-[270px] flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
        <div className="rounded-2xl overflow-hidden shadow-lg shadow-black/50 bg-black aspect-[9/16]">
          <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`} className="w-full h-full border-0" title={video.title || "YouTube video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div data-video-card className="min-w-[220px] sm:min-w-[250px] md:min-w-[270px] flex-shrink-0 group" style={{ scrollSnapAlign: "start" }}>
      <div className="rounded-2xl overflow-hidden shadow-lg shadow-black/50 bg-gradient-to-b from-gray-800 to-gray-950 aspect-[9/16] relative cursor-pointer" onClick={handlePlay}>
        {thumbSrc ? (
          <img src={thumbSrc} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              {isYouTube ? <FaYoutube className="h-10 w-10 text-white/20" /> : <FaInstagram className="h-10 w-10 text-white/20" />}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
            <Play className="h-6 w-6 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-3 right-3 z-10">
          {isYouTube ? (
            <div className="bg-red-600 rounded-lg p-1.5"><FaYoutube className="h-3.5 w-3.5 text-white" /></div>
          ) : (
            <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-1.5"><FaInstagram className="h-3.5 w-3.5 text-white" /></div>
          )}
        </div>
        {(video.title || video.description) && (
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <p className="text-white text-xs sm:text-sm font-medium leading-snug line-clamp-2 drop-shadow-lg">{video.title || video.description}</p>
          </div>
        )}
      </div>
      {igId && (
        <button onClick={openLink} className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-white transition-colors mx-auto">
          <FaInstagram className="h-3 w-3" />
          Assistir no Instagram
        </button>
      )}
      {isYouTube && (
        <button onClick={openLink} className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-white transition-colors mx-auto">
          <ExternalLink className="h-3 w-3" />
          Abrir no YouTube
        </button>
      )}
    </div>
  );
}

export function VideosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: instagramData } = useQuery({
    queryKey: ["/api/public/instagram-videos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/instagram-videos`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const instagramVideos = (Array.isArray(instagramData) ? instagramData : []).map((v: any) => ({
    id: `ig-${v.id}`,
    title: v.title,
    description: v.description,
    sourceType: "INSTAGRAM",
    videoUrl: v.instagramUrl,
    thumbnailUrl: v.thumbnailUrl,
    redirectUrl: v.instagramUrl,
  }));

  const allVideos = instagramVideos.slice(0, 15);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, allVideos.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("[data-video-card]")?.clientWidth ?? 270;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (allVideos.length === 0) {
    return (
      <section className="bg-black text-white">
        <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center justify-start">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="min-w-[220px] sm:min-w-[250px] md:min-w-[270px] flex-shrink-0">
                <div className="aspect-[9/16] bg-gradient-to-b from-gray-800 to-gray-950 rounded-2xl overflow-hidden relative shadow-lg shadow-black/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <FaInstagram className="h-10 w-10 text-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black text-white">
      <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="relative">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth items-start justify-start" style={{ scrollSnapType: "x mandatory" }}>
            {allVideos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-default">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-default">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
