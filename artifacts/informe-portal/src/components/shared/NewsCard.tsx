import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getImageUrl } from "@/lib/image-url";
import { type NewsCard as NewsCardType } from "@workspace/api-client-react";

export function NewsCard({ article, large = false, variant = "vertical" }: { article: NewsCardType, large?: boolean, variant?: "vertical" | "horizontal" }) {
  if (variant === "horizontal") {
    return (
      <Link href={`/noticia/${article.slug}`} className="group cursor-pointer flex flex-row h-auto bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
        <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100">
          {article.category && (
            <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded z-20 shadow-md">
              {article.category.name}
            </span>
          )}
          {article.featuredImage ? (
            <img src={getImageUrl(article.featuredImage)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>
        <div className="p-2.5 sm:p-3 flex-grow flex flex-col justify-center min-w-0">
          <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-3 leading-snug">
            {article.title}
          </h3>
          {article.publishedAt && (
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: ptBR })}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/noticia/${article.slug}`} className="group cursor-pointer flex flex-col h-full bg-card rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      <div className={`w-full relative overflow-hidden bg-gray-100 ${large ? 'aspect-video' : 'aspect-[4/3]'}`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
        {article.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-20 shadow-md">
            {article.category.name}
          </span>
        )}
        {article.featuredImage ? (
          <img 
            src={getImageUrl(article.featuredImage)} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
      </div>
      <div className="p-3 sm:p-5 flex-grow flex flex-col">
        <h3 className={`font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-3 leading-snug ${large ? 'text-base sm:text-xl' : 'text-sm sm:text-base'}`}>
          {article.title}
        </h3>
        {large && article.summary && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
            {article.summary}
          </p>
        )}
        <div className="mt-auto pt-2 sm:pt-4 border-t border-border flex items-center justify-between">
          {article.publishedAt ? (
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: ptBR })}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Agora
            </span>
          )}
          {article.viewCount > 0 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {article.viewCount} {article.viewCount === 1 ? 'visualização' : 'visualizações'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
