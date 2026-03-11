import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { NewsCard } from "@/components/shared/NewsCard";
import { VideosCarousel } from "@/components/shared/VideosCarousel";
import { usePublicNews, usePublicFeaturedNews } from "@/hooks/use-public";
import { Play, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: featured } = usePublicFeaturedNews();
  const { data: formigaNews } = usePublicNews({ category: "formiga", limit: 3 });
  const { data: regionalNews } = usePublicNews({ category: "regional", limit: 3 });
  const { data: politicaNews } = usePublicNews({ category: "politica", limit: 4 });
  const { data: geralNews } = usePublicNews({ category: "geral", limit: 3 });

  return (
    <PublicLayout>
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
        
        {/* LEFT COLUMN (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col gap-6 sm:gap-10">
          
          {/* 1. LIVE TV PLAYER */}
          <section>
            <div className="flex items-center mb-3 sm:mb-4">
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded mr-2 sm:mr-3 flex items-center gap-1 sm:gap-1.5 animate-pulse shadow-sm">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></span> AO VIVO
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-primary tracking-tight">INFORME TV </h2>
            </div>
            <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 sm:border-4 border-gray-900 bg-black">
              <iframe src="https://player.logicahost.com.br/player.php?player=2050" className="w-full h-full border-0" allowFullScreen></iframe>
            </div>
          </section>

          {/* 2. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* 3. DESTAQUES */}
          {featured && featured.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-red-600 pl-3 sm:pl-4 mb-4 sm:mb-6 text-primary uppercase tracking-tight">Destaques</h2>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
                {featured.slice(0, 4).map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* 4. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* 5. TWO-COLUMN NEWS GRID (FORMIGA | REGIONAL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {/* FORMIGA */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
                <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">Formiga</h2>
              </div>
              <div className="flex flex-col gap-4 sm:gap-5">
                {formigaNews?.data.map((item) => (
                  <NewsCard key={item.id} article={item} />
                ))}
              </div>
              <Link href="/categoria/formiga" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>

            {/* REGIONAL */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
                <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">Regional</h2>
              </div>
              <div className="flex flex-col gap-4 sm:gap-5">
                {regionalNews?.data.map((item) => (
                  <NewsCard key={item.id} article={item} />
                ))}
              </div>
              <Link href="/categoria/regional" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>
          </div>

          {/* 6. ARTICULISTAS SECTION */}
          <section className="bg-card p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg shadow-black/5 border border-border">
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-5 sm:mb-8 text-primary uppercase">Articulistas</h2>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {['João Silva', 'Maria Clara', 'Pedro Santos', 'Ana Beatriz', 'Carlos Eduardo', 'Luciana Costa'].map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group min-w-[85px] sm:min-w-[110px] snap-start">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                    <div className="w-full h-full bg-white rounded-full border-4 border-white overflow-hidden flex items-center justify-center">
                      <div className="text-xl sm:text-2xl font-black text-primary/40">{name.charAt(0)}</div>
                    </div>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-center group-hover:text-primary transition-colors">{name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* BANNER PROPAGANDA abaixo dos articulistas */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* 9. POLÍTICA SECTION */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-4 sm:mb-6 text-primary uppercase">Política</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 flex flex-col gap-3">
                {politicaNews?.data.slice(0, 4).map((item) => (
                  <NewsCard key={item.id} article={item} variant="horizontal" />
                ))}
              </div>
              <div className="md:w-1/2">
                <div className="w-full bg-gray-100 h-full min-h-[300px] flex items-center justify-center text-gray-400 font-bold text-sm rounded-xl border-2 border-dashed border-gray-200">
                  BANNER PROPAGANDA
                </div>
              </div>
            </div>
            <Link href="/categoria/politica" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>

          {/* 10. GERAL SECTION */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-4 sm:mb-6 text-primary uppercase">Geral</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="w-full bg-gray-100 h-full min-h-[300px] flex items-center justify-center text-gray-400 font-bold text-sm rounded-xl border-2 border-dashed border-gray-200">
                  BANNER PROPAGANDA
                </div>
              </div>
              <div className="md:w-1/2 flex flex-col gap-3">
                {geralNews?.data.slice(0, 4).map((item) => (
                  <NewsCard key={item.id} article={item} variant="horizontal" />
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/categoria/geral" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR (30%) */}
        <PublicSidebar />
      </main>

      {/* VÍDEOS CURTOS - FULL WIDTH, FUNDO PRETO, LIGADO AO FOOTER */}
      <VideosCarousel />
    </PublicLayout>
  );
}
