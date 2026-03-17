import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

interface BannerCarouselProps {
  position: string;
  className?: string;
  fallbackHeight?: string;
  fallbackLabel?: string;
  fillWidth?: boolean;
}

export function BannerCarousel({ position, className = "", fallbackHeight = "h-[90px] sm:h-[120px]", fallbackLabel, fillWidth }: BannerCarouselProps) {
  const { data } = useQuery({
    queryKey: ["/api/public/banners", position],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/banners?position=${position}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const banners = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const activeBanners = banners.filter((b: any) => b.isActive);

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrent(prev => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, activeBanners.length]);

  useEffect(() => {
    if (current >= activeBanners.length && activeBanners.length > 0) {
      setCurrent(0);
    }
  }, [activeBanners.length, current]);

  if (!activeBanners.length) {
    return (
      <div className={`w-full bg-gray-100 ${fallbackHeight} flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200 ${className}`}>
        {fallbackLabel || "BANNER PROPAGANDA"}
      </div>
    );
  }

  const banner = activeBanners[current];

  const imgEl = fillWidth ? (
    <div
      className={`relative overflow-hidden w-full h-[50px] sm:h-[80px] md:h-[100px] lg:h-[120px] ${className || ""}`}
      style={{
        backgroundImage: `url(${getImageUrl(banner.imageUrl)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {activeBanners.length > 1 && (
        <div className="absolute bottom-1.5 right-3 flex gap-1 z-10">
          {activeBanners.map((_: any, i: number) => (
            <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className={`relative overflow-hidden ${className || "rounded-xl"}`}>
      <img
        src={getImageUrl(banner.imageUrl)}
        alt={banner.title}
        className="w-full h-auto object-cover block"
        loading="lazy"
      />
      {activeBanners.length > 1 && (
        <div className="absolute bottom-1.5 right-3 flex gap-1 z-10">
          {activeBanners.map((_: any, i: number) => (
            <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );

  if (banner.targetUrl) {
    return (
      <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer">
        {imgEl}
      </a>
    );
  }

  return imgEl;
}
