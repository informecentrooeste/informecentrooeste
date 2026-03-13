import { useParams } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicArticle } from "@/hooks/use-public";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getImageUrl } from "@/lib/image-url";
import { Calendar, User, Eye, ArrowLeft, ExternalLink, FileText, Play } from "lucide-react";
import { Link } from "wouter";
import { NewsCard } from "@/components/shared/NewsCard";
import { VideoEmbed } from "@/components/shared/VideoEmbed";

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
          <article className="bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-4 sm:p-8 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 mb-6">
                {article.category && (
                  <Link href={`/categoria/${article.category.slug}`}>
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded shadow-sm hover:opacity-90 transition-opacity uppercase cursor-pointer tracking-wider">
                      {article.category.name}
                    </span>
                  </Link>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
                {article.title}
              </h1>
              
              {article.summary && (
                <p className="text-base sm:text-xl text-muted-foreground font-medium mb-6 sm:mb-8 leading-relaxed">
                  {article.summary}
                </p>
              )}
              
              {article.publishedAt && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-semibold border-y border-border py-3 sm:py-4 mb-6 sm:mb-8">
                  <div className="bg-primary/10 p-1.5 rounded-full"><Calendar className="h-4 w-4 text-primary" /></div>
                  {format(new Date(article.publishedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
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

            {(article as any).videoUrl && (
              <div className="px-4 sm:px-8 pt-6">
                <VideoEmbed url={(article as any).videoUrl} />
              </div>
            )}

            <div className="p-4 sm:p-8 pt-6 sm:pt-10">
              <div 
                className="prose prose-sm sm:prose-lg max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
              />
            </div>

            {(() => {
              let gallery: string[] = [];
              try { if ((article as any).galleryImages) gallery = JSON.parse((article as any).galleryImages); } catch {}
              if (!gallery.length) return null;
              return (
                <div className="px-4 sm:px-8 pb-4">
                  <h3 className="text-lg font-black text-foreground mb-4 border-l-4 border-primary pl-3">Galeria de Fotos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((img, i) => (
                      <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden aspect-video border border-gray-200 hover:border-primary transition-colors group">
                        <img src={getImageUrl(img)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(article as any).attachmentUrl && (
              <div className="px-4 sm:px-8 pb-4">
                <a href={`/api${(article as any).attachmentUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors group">
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{(article as any).attachmentName || "Documento anexado"}</p>
                    <p className="text-xs text-muted-foreground">Clique para baixar</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-primary ml-auto" />
                </a>
              </div>
            )}

            {(article as any).redirectUrl && (
              <div className="px-4 sm:px-8 pb-4">
                <a href={(article as any).redirectUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group">
                  <div className="bg-blue-200 p-3 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground group-hover:text-blue-600 transition-colors">Acessar link</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{(article as any).redirectUrl}</p>
                  </div>
                </a>
              </div>
            )}
            
            {article.tags && article.tags.length > 0 && (
              <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-wrap gap-2">
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
