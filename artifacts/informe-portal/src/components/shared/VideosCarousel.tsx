import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicVideos } from "@/hooks/use-public";
import { getImageUrl } from "@/lib/image-url";

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function getInstagramEmbedUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/p/${match[1]}/embed/` : null;
}

function getThumbnail(video: { thumbnailUrl?: string | null; videoUrl: string; sourceType: string }): string {
  if (video.thumbnailUrl) return getImageUrl(video.thumbnailUrl);
  if (video.sourceType === "YOUTUBE") {
    const yt = getYoutubeThumbnail(video.videoUrl);
    if (yt) return yt;
  }
  return "";
}

export function VideosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: videosData } = usePublicVideos();
  const videos = Array.isArray(videosData) ? videosData : (videosData as any)?.data ?? [];

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const openVideo = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!videos.length) return null;

  return (
    <section className="bg-black text-white">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x"
        >
          {videos.map((video: any) => {
            const thumb = getThumbnail(video);
            const igEmbed = video.sourceType === "INSTAGRAM" ? getInstagramEmbedUrl(video.videoUrl) : null;

            return (
              <div
                key={video.id}
                className="snap-start shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer group"
                onClick={() => openVideo(video.videoUrl)}
              >
                <div className="aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden relative">
                  {igEmbed ? (
                    <iframe
                      src={igEmbed}
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                      loading="lazy"
                    />
                  ) : thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800" />
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-tight line-clamp-3 group-hover:text-white transition-colors">
                  {video.title}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
