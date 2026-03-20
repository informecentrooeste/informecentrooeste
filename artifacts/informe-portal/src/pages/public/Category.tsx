import { useState, useEffect } from "react";
import { useParams, useSearch } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicCategories } from "@/hooks/use-public";
import { NewsCard } from "@/components/shared/NewsCard";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

export default function Category() {
  const params = useParams<{ slug: string }>();
  const categorySlug = params.slug || "";
  const searchString = useSearch();
  const cidadeParam = new URLSearchParams(searchString).get("cidade") || "";
  const [selectedCity, setSelectedCity] = useState(cidadeParam);

  useEffect(() => {
    setSelectedCity(cidadeParam);
  }, [cidadeParam]);

  const { data: categories } = usePublicCategories();
  const category = categories?.find(c => c.slug === categorySlug);

  const { data: cities = [] } = useQuery<{ id: number; name: string; slug: string; categoryId: number }[]>({
    queryKey: ["/api/public/cities", categorySlug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/cities?category=${categorySlug}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!categorySlug,
  });

  const { data: news, isLoading } = useQuery({
    queryKey: ["/api/public/news", categorySlug, selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams({ category: categorySlug, limit: "12", page: "1" });
      if (selectedCity) params.set("city", selectedCity);
      const res = await fetch(`${API_BASE}/public/news?${params}`);
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: !!categorySlug,
  });

  return (
    <PublicLayout>
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[70%]">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-5 sm:p-8 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-black text-primary uppercase tracking-tight">
              {category ? category.name : categorySlug}
            </h1>
            {category?.description && (
              <p className="mt-2 text-muted-foreground text-lg font-medium">{category.description}</p>
            )}

            {cities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <button
                  onClick={() => setSelectedCity("")}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${!selectedCity ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Todas
                </button>
                {cities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCity(city.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedCity === city.slug ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}

            {news && (
              <p className="mt-3 text-sm text-muted-foreground font-medium">
                {selectedCity
                  ? `Mostrando ${Math.min(news.data?.length || 0, news.total)} de ${news.total} notícias de ${cities.find(c => c.slug === selectedCity)?.name || selectedCity}`
                  : `${news.total} notícias encontradas`
                }
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : news?.data && news.data.length > 0 ? (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-6">
              {news.data.map((article: any) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-xl text-muted-foreground font-semibold">Nenhuma notícia encontrada nesta categoria.</p>
            </div>
          )}
        </div>

        <PublicSidebar />
      </main>
    </PublicLayout>
  );
}
