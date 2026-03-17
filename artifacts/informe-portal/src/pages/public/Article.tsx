import { useParams } from "wouter";
import { PublicLayout } from "@/components/shared/PublicLayout";
import { PublicSidebar } from "@/components/shared/PublicSidebar";
import { usePublicArticle } from "@/hooks/use-public";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getImageUrl } from "@/lib/image-url";
import { Calendar, User, Eye, ArrowLeft, ArrowRight, ExternalLink, FileText, Play, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { NewsCard } from "@/components/shared/NewsCard";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import { BannerCarousel } from "@/components/shared/BannerCarousel";

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

            {(() => {
              const articleUrl = typeof window !== "undefined" ? window.location.href : "";
              const shareText = encodeURIComponent(article.title);
              const shareUrl = encodeURIComponent(articleUrl);
              return (
                <div className="px-4 sm:px-8 pt-4 flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm py-3 px-4 rounded transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Compartilhar no Whatsapp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold text-sm py-3 px-4 rounded transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Compartilhar no Facebook
                  </a>
                </div>
              );
            })()}

            {(article as any).videoUrl && (
              <div className="px-4 sm:px-8 pt-6">
                <VideoEmbed url={(article as any).videoUrl} />
              </div>
            )}

            {(() => {
              const cleanContent = article.content
                .replace(/\n{2,}/g, '\n')
                .replace(/(<br\s*\/?>[\s]*){3,}/gi, '<br/><br/>')
                .replace(/<p>\s*<\/p>/gi, '')
                .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
                .replace(/\n/g, '<br/>');

              const paragraphs = cleanContent.split(/<\/p>/i).filter(p => p.trim());
              const midPoint = Math.ceil(paragraphs.length / 2);

              if (paragraphs.length >= 4) {
                const firstHalf = paragraphs.slice(0, midPoint).join('</p>') + '</p>';
                const secondHalf = paragraphs.slice(midPoint).join('</p>') + '</p>';
                return (
                  <>
                    <div className="p-4 sm:p-8 pt-6 sm:pt-10 pb-0">
                      <div
                        className="prose prose-sm sm:prose-lg max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:my-2 prose-br:content-[''] prose-br:block prose-br:my-1"
                        dangerouslySetInnerHTML={{ __html: firstHalf }}
                      />
                    </div>
                    <div className="px-4 sm:px-8 py-4">
                      <BannerCarousel position="MID_NEWS" fallbackHeight="h-[90px]" fallbackLabel="BANNER MEIO NOTÍCIA" />
                    </div>
                    <div className="p-4 sm:p-8 pt-0">
                      <div
                        className="prose prose-sm sm:prose-lg max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:my-2 prose-br:content-[''] prose-br:block prose-br:my-1"
                        dangerouslySetInnerHTML={{ __html: secondHalf }}
                      />
                    </div>
                  </>
                );
              }

              return (
                <div className="p-4 sm:p-8 pt-6 sm:pt-10">
                  <div
                    className="prose prose-sm sm:prose-lg max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:my-2 prose-br:content-[''] prose-br:block prose-br:my-1"
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                  />
                </div>
              );
            })()}

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
          
          {(article.previousPost || article.nextPost) && (
            <div className="mt-8 border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {article.previousPost && (
                  <Link href={`/noticia/${article.previousPost.slug}`} className="group block">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Postagem anterior</span>
                    <p className="text-sm sm:text-base font-bold text-gray-800 mt-1 border-l-4 border-gray-300 pl-3 group-hover:border-primary group-hover:text-primary transition-colors leading-snug">
                      {article.previousPost.title}
                    </p>
                  </Link>
                )}
              </div>
              <div className="text-right">
                {article.nextPost && (
                  <Link href={`/noticia/${article.nextPost.slug}`} className="group block">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Próxima postagem</span>
                    <p className="text-sm sm:text-base font-bold text-gray-800 mt-1 border-r-4 border-gray-300 pr-3 group-hover:border-primary group-hover:text-primary transition-colors leading-snug">
                      {article.nextPost.title}
                    </p>
                  </Link>
                )}
              </div>
            </div>
          )}

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
