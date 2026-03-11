import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { NewsCard } from "@/components/shared/NewsCard";
import { usePublicNews, usePublicFeaturedNews } from "@/hooks/use-public";
import { Play, Instagram, ChevronRight } from "lucide-react";
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
          <div className="w-full bg-gray-100 h-[60px] sm:h-[90px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
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
          <div className="w-full bg-gray-100 h-[60px] sm:h-[90px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
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

          {/* 9. POLÍTICA SECTION */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-4 sm:mb-6 text-primary uppercase">Política</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {politicaNews?.data.slice(0, 2).map((item) => (
                  <NewsCard key={item.id} article={item} />
                ))}
              </div>
              {politicaNews?.data[2] && (
                <div className="md:w-1/3">
                  <Link href={`/noticia/${politicaNews.data[2].slug}`} className="group cursor-pointer block h-full min-h-[300px] bg-gradient-to-br from-primary to-purple-900 rounded-2xl overflow-hidden relative shadow-lg">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                    <div className="absolute inset-0 z-0 opacity-50 mix-blend-overlay"></div>
                    <div className="relative z-20 h-full flex flex-col justify-end p-6">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded mb-3 self-start shadow-md uppercase tracking-wider">Destaque</span>
                      <h3 className="font-black text-white text-xl leading-tight drop-shadow-lg group-hover:underline decoration-white/50">
                        {politicaNews.data[2].title}
                      </h3>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <Link href="/categoria/politica" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>

          {/* 10. GERAL SECTION */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-4 sm:mb-6 text-primary uppercase">Geral</h2>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {geralNews?.data.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
            <Link href="/categoria/geral" className="inline-flex items-center text-primary font-bold text-sm mt-6 hover:underline group">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>

          {/* 12. VÍDEOS DO INSTAGRAM */}
          <section className="bg-primary p-5 sm:p-8 rounded-xl sm:rounded-2xl text-primary-foreground mb-6 sm:mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
              <Instagram className="w-64 h-64" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8 uppercase relative z-10">
              <Instagram className="h-6 w-6 sm:h-8 sm:w-8" /> Vídeos do Instagram
            </h2>
            
            <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x relative z-10">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="snap-start shrink-0 w-28 sm:w-40 aspect-[9/16] bg-black rounded-xl overflow-hidden relative group cursor-pointer border-2 border-white/20 hover:border-white/50 transition-colors shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/40 transition-colors group-hover:scale-110 duration-300">
                      <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <p className="text-sm font-bold line-clamp-2 text-white drop-shadow-md leading-tight">
                      Vídeo destaque {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR (30%) */}
        <PublicSidebar />
      </main>
    </PublicLayout>
  );
}
