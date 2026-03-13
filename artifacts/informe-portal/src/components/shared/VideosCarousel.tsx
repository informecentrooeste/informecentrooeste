import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function detectPlatform(url: string): "youtube" | "instagram" {
  if (/youtube|youtu\.be/i.test(url)) return "youtube";
  return "instagram";
}

function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match?.[1] || "";
}

function getInstagramEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed` : "";
}

function VideoCard({ video, isVisible }: { video: any; isVisible: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const platform = video.platform || detectPlatform(video.videoUrl);
  const ytId = platform === "youtube" ? getYouTubeId(video.videoUrl) : "";
  const igEmbed = platform === "instagram" ? getInstagramEmbedUrl(video.videoUrl) : "";

  return (
    <div
      ref={cardRef}
      data-video-card
      className="min-w-[220px] sm:min-w-[260px] md:min-w-[280px] lg:min-w-[300px] flex-shrink-0 group"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative shadow-lg shadow-black/50">
        {isVisible ? (
          platform === "youtube" && ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1`}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={video.title}
              loading="lazy"
            />
          ) : igEmbed ? (
            <iframe
              src={igEmbed}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              title={video.title}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
              <FaInstagram className="h-10 w-10 text-white/30" />
            </div>
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
            {platform === "youtube" ? (
              <FaYoutube className="h-10 w-10 text-white/30" />
            ) : (
              <FaInstagram className="h-10 w-10 text-white/30" />
            )}
          </div>
        )}

        <div className="absolute top-2 right-2 z-10">
          {platform === "youtube" ? (
            <FaYoutube className="h-4 w-4 text-red-500 drop-shadow-lg" />
          ) : (
            <FaInstagram className="h-4 w-4 text-white drop-shadow-lg" />
          )}
        </div>
      </div>

      {(video.title || video.description) && (
        <div className="mt-2">
          {video.title && (
            <p className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-1">
              {video.title}
            </p>
          )}
          {video.description && (
            <p className="text-[11px] sm:text-xs text-gray-400 leading-snug line-clamp-2 mt-0.5">
              {video.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function VideosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  const { data: videosData } = useQuery({
    queryKey: ["/api/public/instagram-videos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/instagram-videos`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const allVideos = (Array.isArray(videosData) ? videosData : []).map((v: any) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    platform: v.platform || detectPlatform(v.instagramUrl),
    videoUrl: v.instagramUrl,
  }));

  const [displayCount, setDisplayCount] = useState(4);

  const displayVideos = allVideos.slice(0, displayCount);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleCards((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const idx = Number(entry.target.getAttribute("data-idx"));
            if (entry.isIntersecting) {
              next.add(idx);
            } else {
              next.delete(idx);
            }
          });
          return next;
        });
      },
      {
        root: container,
        rootMargin: "100px",
        threshold: 0.3,
      }
    );

    const cards = container.querySelectorAll("[data-video-card]");
    cards.forEach((card, idx) => {
      card.setAttribute("data-idx", String(idx));
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [displayVideos.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      if (scrollLeft + clientWidth > scrollWidth - 200) {
        setDisplayCount((c) => Math.min(c + 4, allVideos.length));
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [allVideos.length]);

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
  }, [checkScroll, displayVideos.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("[data-video-card]")?.clientWidth ?? 280;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const placeholders = allVideos.length === 0
    ? Array.from({ length: 4 }, (_, i) => ({
        id: `placeholder-${i}`,
        title: "",
        description: "",
        platform: "instagram" as const,
        videoUrl: "",
        _placeholder: true,
      }))
    : [];

  const finalVideos = allVideos.length > 0 ? displayVideos : placeholders;

  return (
    <section className="bg-black text-white">
      <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth items-start justify-start"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {finalVideos.map((video: any, idx: number) => {
              if (video._placeholder) {
                return (
                  <div
                    key={video.id}
                    data-video-card
                    className="min-w-[220px] sm:min-w-[260px] md:min-w-[280px] lg:min-w-[300px] flex-shrink-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative shadow-lg shadow-black/50">
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
                        <FaInstagram className="h-10 w-10 text-white/30" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  isVisible={visibleCards.has(idx)}
                />
              );
            })}
          </div>
        </div>

        {allVideos.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
