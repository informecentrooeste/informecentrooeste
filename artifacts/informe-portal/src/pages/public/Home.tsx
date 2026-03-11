import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { NewsCard } from "@/components/shared/NewsCard";
import { VideosCarousel } from "@/components/shared/VideosCarousel";
import { usePublicNews, usePublicFeaturedNews, usePublicLatestNews } from "@/hooks/use-public";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function DestaquesCarousel({ articles }: { articles: any[] }) {
  const [current, setCurrent] = useState(0);
  const items = articles.slice(0, 5);

  const next = useCallback(() => {
    if (items.length <= 1) return;
    setCurrent(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrent(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (!items.length) return null;

  const article = items[current];
  const category = article.category;
  const imageUrl = article.imageUrl ? getImageUrl(article.imageUrl) : null;

  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-red-600 pl-3 sm:pl-4 mb-4 sm:mb-6 text-primary uppercase tracking-tight">Destaque</h2>
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 shadow-xl group">
        <Link href={`/noticia/${article.slug}`}>
          <div className="relative aspect-[16/8] sm:aspect-[16/7]">
            {imageUrl ? (
              <img src={imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
              {category && (
                <span className="inline-block bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded mb-2 sm:mb-3">{category.name}</span>
              )}
              <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight line-clamp-3 drop-shadow-lg">{article.title}</h3>
              {article.summary && (
                <p className="text-white/70 text-sm sm:text-base mt-2 line-clamp-2 max-w-2xl">{article.summary}</p>
              )}
            </div>
          </div>
        </Link>

        {items.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); prev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={(e) => { e.preventDefault(); next(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="absolute bottom-2 sm:bottom-4 right-4 sm:right-8 flex gap-1.5 z-10">
              {items.map((_: any, i: number) => (
                <button key={i} onClick={(e) => { e.preventDefault(); setCurrent(i); }} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: featured } = usePublicFeaturedNews();
  const { data: latestForCarousel } = usePublicLatestNews(5);
  const { data: formigaNews } = usePublicNews({ category: "formiga", limit: 4 });
  const { data: regionalNews } = usePublicNews({ category: "regional", limit: 4 });
  const { data: estadualNews } = usePublicNews({ category: "estadual", limit: 4 });
  const { data: brasilNews } = usePublicNews({ category: "brasil", limit: 4 });
  const { data: politicaNews } = usePublicNews({ category: "politica", limit: 4 });
  const { data: geralNews } = usePublicNews({ category: "geral", limit: 4 });
  const { data: columnistsData } = useQuery({
    queryKey: ["/api/public/columnists"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/columnists`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const columnists = Array.isArray(columnistsData) ? columnistsData : [];

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

          {/* 3. DESTAQUE - carrossel das últimas 5 notícias */}
          <DestaquesCarousel articles={Array.isArray(latestForCarousel) ? latestForCarousel : (latestForCarousel as any)?.data ?? []} />

          {/* 4. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* 5. TWO-COLUMN NEWS GRID (FORMIGA | REGIONAL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {[
              { title: "Formiga", slug: "formiga", data: formigaNews },
              { title: "Regional", slug: "regional", data: regionalNews },
            ].map(({ title, slug, data }) => (
              <section key={slug}>
                <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
                  <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">{title}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {data?.data?.[0] && <NewsCard article={data.data[0]} large />}
                  {data?.data?.slice(1, 4).map((item) => (
                    <NewsCard key={item.id} article={item} variant="horizontal" />
                  ))}
                </div>
                <Link href={`/categoria/${slug}`} className="inline-flex items-center text-primary font-bold text-sm mt-4 hover:underline group">
                  VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </section>
            ))}
          </div>

          {/* ARTICULISTAS SECTION */}
          <section className="bg-card p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg shadow-black/5 border border-border">
            <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 mb-5 sm:mb-8 text-primary uppercase">Articulistas</h2>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {(columnists.length > 0 ? columnists : [
                { id: 1, name: 'João Silva', photoUrl: null, articleSlug: null },
                { id: 2, name: 'Maria Clara', photoUrl: null, articleSlug: null },
                { id: 3, name: 'Pedro Santos', photoUrl: null, articleSlug: null },
                { id: 4, name: 'Ana Beatriz', photoUrl: null, articleSlug: null },
                { id: 5, name: 'Carlos Eduardo', photoUrl: null, articleSlug: null },
                { id: 6, name: 'Luciana Costa', photoUrl: null, articleSlug: null },
              ]).map((c: any) => {
                const content = (
                  <div className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group min-w-[85px] sm:min-w-[110px] snap-start">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                      <div className="w-full h-full bg-white rounded-full border-4 border-white overflow-hidden flex items-center justify-center">
                        {c.photoUrl ? (
                          <img src={getImageUrl(c.photoUrl)} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xl sm:text-2xl font-black text-primary/40">{c.name.charAt(0)}</div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-center group-hover:text-primary transition-colors">{c.name}</span>
                  </div>
                );
                return c.articleSlug ? (
                  <Link key={c.id} href={`/noticia/${c.articleSlug}`}>{content}</Link>
                ) : (
                  <div key={c.id}>{content}</div>
                );
              })}
            </div>
          </section>

          {/* BANNER PROPAGANDA abaixo dos articulistas */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* ESTADUAL | BRASIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {[
              { title: "Estadual", slug: "estadual", data: estadualNews },
              { title: "Brasil", slug: "brasil", data: brasilNews },
            ].map(({ title, slug, data }) => (
              <section key={slug}>
                <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
                  <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">{title}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {data?.data?.[0] && <NewsCard article={data.data[0]} large />}
                  {data?.data?.slice(1, 4).map((item) => (
                    <NewsCard key={item.id} article={item} variant="horizontal" />
                  ))}
                </div>
                <Link href={`/categoria/${slug}`} className="inline-flex items-center text-primary font-bold text-sm mt-4 hover:underline group">
                  VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </section>
            ))}
          </div>

          {/* BANNER PROPAGANDA */}
          <div className="w-full bg-gray-100 h-[90px] sm:h-[120px] flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-xl border-2 border-dashed border-gray-200">
            BANNER PROPAGANDA
          </div>

          {/* POLÍTICA SECTION */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
              <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">Política</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 flex flex-col gap-3">
                {politicaNews?.data?.[0] && <NewsCard article={politicaNews.data[0]} large />}
                {politicaNews?.data?.slice(1, 4).map((item) => (
                  <NewsCard key={item.id} article={item} variant="horizontal" />
                ))}
              </div>
              <div className="md:w-1/2">
                <div className="w-full bg-gray-100 h-full min-h-[300px] flex items-center justify-center text-gray-400 font-bold text-sm rounded-xl border-2 border-dashed border-gray-200">
                  BANNER PROPAGANDA
                </div>
              </div>
            </div>
            <Link href="/categoria/politica" className="inline-flex items-center text-primary font-bold text-sm mt-4 hover:underline group">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>

          {/* GERAL SECTION */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-border mb-4 sm:mb-5 pb-2">
              <h2 className="text-xl sm:text-2xl font-black border-l-4 sm:border-l-[6px] border-primary pl-3 text-primary uppercase">Geral</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="w-full bg-gray-100 h-full min-h-[300px] flex items-center justify-center text-gray-400 font-bold text-sm rounded-xl border-2 border-dashed border-gray-200">
                  BANNER PROPAGANDA
                </div>
              </div>
              <div className="md:w-1/2 flex flex-col gap-3">
                {geralNews?.data?.[0] && <NewsCard article={geralNews.data[0]} large />}
                {geralNews?.data?.slice(1, 4).map((item) => (
                  <NewsCard key={item.id} article={item} variant="horizontal" />
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/categoria/geral" className="inline-flex items-center text-primary font-bold text-sm mt-4 hover:underline group">
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
