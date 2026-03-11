import { useParams } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicNews, usePublicCategories } from "@/hooks/use-public";
import { NewsCard } from "@/components/shared/NewsCard";

export default function Category() {
  const params = useParams<{ slug: string }>();
  const categorySlug = params.slug || "";
  
  const { data: categories } = usePublicCategories();
  const category = categories?.find(c => c.slug === categorySlug);
  
  const { data: news, isLoading } = usePublicNews({ 
    category: categorySlug,
    limit: 12,
    page: 1
  });

  return (
    <PublicLayout>
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[70%]">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
            <h1 className="text-4xl font-black text-primary uppercase tracking-tight">
              {category ? category.name : categorySlug}
            </h1>
            {category?.description && (
              <p className="mt-2 text-muted-foreground text-lg font-medium">{category.description}</p>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : news?.data && news.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.data.map(article => (
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
