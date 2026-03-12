import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, User, Eye, Calendar } from "lucide-react";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

export default function Columnist() {
  const [, params] = useRoute("/articulista/:id");
  const id = params?.id;

  const { data: columnist, isLoading, error } = useQuery({
    queryKey: [`/api/public/columnists/${id}`],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/columnists/${id}`);
      if (!res.ok) throw new Error("Articulista não encontrado");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-72 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !columnist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">Articulista não encontrado</p>
        <Link href="/" className="text-primary font-semibold hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao início
      </Link>

      <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white shrink-0">
              {columnist.photoUrl ? (
                <img src={getImageUrl(columnist.photoUrl)} alt={columnist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User className="h-12 w-12 text-primary/30" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{columnist.name}</h1>
              <p className="text-white/80 text-sm sm:text-base mt-1">Articulista</p>
              {columnist.bio && (
                <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">{columnist.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {columnist.article ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-6 border-l-4 border-primary pl-3">
                Artigo
              </h2>
              
              {columnist.article.featuredImage && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(columnist.article.featuredImage)}
                    alt={columnist.article.title}
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                {columnist.article.title}
              </h3>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6">
                {columnist.article.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(columnist.article.publishedAt), { addSuffix: true, locale: ptBR })}
                  </span>
                )}
                {columnist.article.viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {columnist.article.viewCount} visualizações
                  </span>
                )}
              </div>

              {columnist.article.summary && (
                <p className="text-muted-foreground text-sm italic mb-6 border-l-2 border-primary/30 pl-4">
                  {columnist.article.summary}
                </p>
              )}

              <div
                className="prose prose-sm sm:prose-base max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: columnist.article.content }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum artigo publicado ainda.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Em breve este articulista publicará seu conteúdo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
