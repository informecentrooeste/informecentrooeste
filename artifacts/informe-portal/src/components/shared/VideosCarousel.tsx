import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { usePublicVideos } from "@/hooks/use-public";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

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

  const regularInstagramVideos = (Array.isArray(regularData) ? regularData : (regularData as any)?.data ?? [])
    .filter((v: any) => v.sourceType === "INSTAGRAM")
    .map((v: any) => ({
      id: `vid-${v.id}`,
      title: v.title,
      description: v.description,
      instagramUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
    }));

  const dedicatedInstagramVideos = (Array.isArray(instagramData) ? instagramData : []).map((v: any) => ({
    id: `ig-${v.id}`,
    title: v.title,
    description: v.description,
    instagramUrl: v.instagramUrl,
    thumbnailUrl: v.thumbnailUrl,
  }));

  const videos = [...dedicatedInstagramVideos, ...regularInstagramVideos].slice(0, 15);

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
  }, [checkScroll, videos.length]);

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

  if (!videos.length) return null;

  return (
    <section className="bg-black text-white">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth items-center justify-start"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {videos.map((video: any) => {
              const thumb = video.thumbnailUrl ? getImageUrl(video.thumbnailUrl) : "";
              return (
                <div
                  key={video.id}
                  data-video-card
                  onClick={() => window.open(video.instagramUrl, "_blank", "noopener,noreferrer")}
                  className="min-w-[90px] sm:min-w-[100px] md:min-w-[110px] lg:min-w-[120px] flex-1 cursor-pointer group"
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
                        <FaInstagram className="h-10 w-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <FaInstagram className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <FaInstagram className="h-4 w-4 text-white drop-shadow-lg" />
                    </div>
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
