import { useRef } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

export function VideosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-black text-white">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div
              key={item}
              className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px] aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative group cursor-pointer border border-white/10 hover:border-white/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gray-800"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors group-hover:scale-110 duration-300">
                  <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
          ))}
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
