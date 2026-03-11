import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { usePublicVideos } from "@/hooks/use-public";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function getThumbnail(video: any): string {
  if (video.thumbnailUrl) return getImageUrl(video.thumbnailUrl);
  if (video.sourceType === "YOUTUBE") {
    const yt = getYoutubeThumbnail(video.videoUrl);
    if (yt) return yt;
  }
  return "";
}

export function VideosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: regularData } = usePublicVideos();
  const { data: instagramData } = useQuery({
    queryKey: ["/api/public/instagram-videos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/instagram-videos`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const regularVideos = (Array.isArray(regularData) ? regularData : (regularData as any)?.data ?? []).map((v: any) => ({ ...v, _type: "regular" }));
  const instagramVideos = (Array.isArray(instagramData) ? instagramData : []).map((v: any) => ({
    id: `ig-${v.id}`,
    title: v.title,
    description: v.description,
    sourceType: "INSTAGRAM",
    videoUrl: v.instagramUrl,
    thumbnailUrl: v.thumbnailUrl,
    redirectUrl: v.instagramUrl,
    _type: "instagram",
  }));

  const allVideos = [...instagramVideos, ...regularVideos].slice(0, 15);

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
    const cardWidth = scrollRef.current.querySelector("[data-video-card]")?.clientWidth ?? 180;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 3;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const openVideo = (video: any) => {
    const url = video.redirectUrl || video.videoUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!allVideos.length) return null;

  return (
    <section className="bg-black text-white">
      <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-center mb-6 sm:mb-8 text-white/90">Vídeos</h2>
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth items-center justify-start"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {allVideos.map((video: any) => {
              const thumb = getThumbnail(video);
              const isInstagram = video.sourceType === "INSTAGRAM";
              return (
                <div
                  key={video.id}
                  data-video-card
                  onClick={() => openVideo(video)}
                  className="min-w-[130px] sm:min-w-[155px] md:min-w-[170px] lg:min-w-[185px] flex-1 cursor-pointer group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative shadow-lg shadow-black/50">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
                        {isInstagram ? (
                          <FaInstagram className="h-10 w-10 text-white/30" />
                        ) : (
                          <Play className="h-10 w-10 text-white/30" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {isInstagram && (
                      <div className="absolute top-2 right-2 z-10">
                        <FaInstagram className="h-4 w-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] sm:text-xs text-gray-400 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {video.description || video.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-default"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-default"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
