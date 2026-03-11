import { useParams } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicArticle } from "@/hooks/use-public";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getImageUrl } from "@/lib/image-url";
import { Calendar, User, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { NewsCard } from "@/components/shared/NewsCard";

export default function Article() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = usePublicArticle(params.slug || "");

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground font-semibold">Carregando notícia...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Notícia não encontrada</h1>
          <p className="text-lg text-gray-600 mb-8">A página que você procura não existe ou foi removida.</p>
          <Link href="/" className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para a página inicial
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[70%]">
          <article className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-8 pb-6">
              <div className="flex items-center gap-3 mb-6">
                {article.category && (
                  <Link href={`/categoria/${article.category.slug}`}>
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded shadow-sm hover:opacity-90 transition-opacity uppercase cursor-pointer tracking-wider">
                      {article.category.name}
                    </span>
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
                {article.title}
              </h1>
              
              {article.summary && (
                <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                  {article.summary}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-semibold border-y border-border py-4 mb-8">
                {article.author && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full"><User className="h-4 w-4 text-primary" /></div>
                    Por {article.author.name}
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full"><Calendar className="h-4 w-4 text-primary" /></div>
                    {format(new Date(article.publishedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full"><Eye className="h-4 w-4 text-primary" /></div>
                  {article.viewCount} acessos
                </div>
              </div>
            </div>

            {article.featuredImage && (
              <div className="w-full aspect-video bg-gray-100 relative">
                <img 
                  src={getImageUrl(article.featuredImage)} 
                  alt={article.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="p-8 pt-10">
              <div 
                className="prose prose-lg max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
              />
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="px-8 pb-8 flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag.id} className="bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1 rounded-md">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>
          
          {article.related && article.related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-black border-l-[6px] border-primary pl-3 mb-6 text-primary uppercase">Notícias Relacionadas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {article.related.map(item => (
                  <NewsCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        <PublicSidebar />
      </main>
    </PublicLayout>
  );
}
