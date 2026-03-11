import { useSearch } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicSearch } from "@/hooks/use-public";
import { NewsCard } from "@/components/shared/NewsCard";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const q = queryParams.get("q") || "";

  const { data: results, isLoading } = usePublicSearch({ q, limit: 20 });

  return (
    <PublicLayout>
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[70%]">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8 flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <SearchIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-muted-foreground">Resultados da busca por:</h1>
              <p className="text-4xl font-black text-foreground tracking-tight">"{q}"</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : results?.data && results.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.data.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-xl text-muted-foreground font-semibold">Nenhum resultado encontrado para sua busca.</p>
              <p className="text-sm text-gray-500 mt-2">Tente usar palavras-chave diferentes ou mais gerais.</p>
            </div>
          )}
        </div>

        <PublicSidebar />
      </main>
    </PublicLayout>
  );
}
