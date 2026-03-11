import { Tv, Cloud, MapPin, Sun, ChevronRight, MessageCircle, Youtube } from "lucide-react";
import { Link } from "wouter";
import { usePublicLatestNews, usePublicMostRead } from "@/hooks/use-public";
import { getImageUrl } from "@/lib/image-url";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PublicSidebar() {
  const { data: latestNews } = usePublicLatestNews(4);
  const { data: mostRead } = usePublicMostRead(5);

  return (
    <aside className="w-full flex flex-col gap-8 lg:sticky lg:top-24 h-fit">
      
      {/* 1. TV AO VIVO BADGE */}
      <div className="bg-red-600 text-white rounded-xl p-4 flex items-center justify-between shadow-lg shadow-red-600/20 cursor-pointer hover:bg-red-700 transition-colors">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6" />
          <span className="font-bold text-lg uppercase tracking-wider">TV AO VIVO</span>
        </div>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>

      {/* 2. PROPAGANDA BANNER VERTICAL */}
      <div className="w-full bg-gray-200 h-[250px] flex flex-col items-center justify-center text-gray-500 font-bold text-sm rounded-xl border border-gray-300">
        <span>BANNER PROPAGANDA</span>
        <span className="text-xs font-normal mt-1">(300x250)</span>
      </div>

      {/* 5. ÚLTIMAS NOTÍCIAS */}
      <section className="bg-white p-5 rounded-xl shadow-md shadow-black/5 border border-gray-100">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3 mb-5 text-primary uppercase">Últimas Notícias</h2>
        
        <div className="flex flex-col gap-4">
          {latestNews?.map((item) => (
            <Link key={item.id} href={`/noticia/${item.slug}`} className="flex gap-3 group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.featuredImage ? (
                  <img src={getImageUrl(item.featuredImage)} alt={item.title} className="img-safe group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.publishedAt && (
                  <span className="text-xs text-muted-foreground mt-2 block uppercase font-semibold">
                    {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: ptBR })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. PREVISÃO DO TEMPO */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cloud className="h-4 w-4" /> Previsão do Tempo
        </h2>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1 font-semibold text-blue-100 mb-1">
              <MapPin className="h-4 w-4" /> Formiga, MG
            </div>
            <div className="text-5xl font-black tracking-tighter">28°C</div>
            <div className="text-sm text-blue-100 mt-1">Ensolarado com nuvens</div>
          </div>
          <Sun className="h-16 w-16 text-yellow-300 drop-shadow-xl" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 border-t border-blue-400/30 pt-4">
          <div className="text-center">
            <span className="text-xs text-blue-100 block mb-1">Amanhã</span>
            <Cloud className="h-6 w-6 mx-auto mb-1 text-white" />
            <span className="font-bold text-sm">26° <span className="text-blue-200 text-xs font-normal">19°</span></span>
          </div>
          <div className="text-center">
            <span className="text-xs text-blue-100 block mb-1">Sexta</span>
            <Sun className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
            <span className="font-bold text-sm">30° <span className="text-blue-200 text-xs font-normal">21°</span></span>
          </div>
          <div className="text-center">
            <span className="text-xs text-blue-100 block mb-1">Sábado</span>
            <Sun className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
            <span className="font-bold text-sm">32° <span className="text-blue-200 text-xs font-normal">22°</span></span>
          </div>
        </div>
      </section>

      {/* 7. MAIS LIDAS */}
      <section className="bg-white p-5 rounded-xl shadow-md shadow-black/5 border border-gray-100">
        <h2 className="text-xl font-bold border-l-4 border-red-600 pl-3 mb-6 text-primary uppercase">Mais Lidas</h2>
        
        <div className="flex flex-col gap-5">
          {mostRead?.map((item, index) => (
            <Link key={item.id} href={`/noticia/${item.slug}`} className="flex gap-4 group cursor-pointer relative">
              <div className="absolute -left-2 -top-3 text-5xl font-black text-gray-100/80 z-0 select-none pointer-events-none group-hover:text-primary/10 transition-colors">{index + 1}</div>
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 z-10 relative mt-1 shadow-sm">
                {item.featuredImage ? (
                  <img src={getImageUrl(item.featuredImage)} alt={item.title} className="img-safe group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                )}
              </div>
              <div className="z-10 relative flex items-center">
                <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-3">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. APOIADOR CALL TO ACTION */}
      <div className="w-full bg-gradient-to-b from-primary to-purple-900 rounded-xl p-8 text-center text-white shadow-xl cursor-pointer transform transition hover:-translate-y-1">
        <h3 className="font-black text-3xl mb-2 italic tracking-tight">SEJA UM APOIADOR</h3>
        <p className="font-semibold text-purple-200 mb-6 text-sm">DO INFORME CENTRO-OESTE</p>
        <a href="https://wa.me/5537999493124" target="_blank" rel="noreferrer" className="block bg-yellow-400 text-purple-950 font-black py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors uppercase text-sm w-full shadow-lg hover:shadow-yellow-400/20 active:scale-95">
          Saiba como
        </a>
      </div>

      {/* 9. WHATSAPP SECTION */}
      <section className="bg-white p-6 rounded-xl shadow-md shadow-black/5 border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white mb-4 shadow-lg shadow-green-500/30">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-6">Participe dos nossos grupos!</h2>
        
        <div className="flex flex-col gap-3">
          <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2">
            <MessageCircle className="h-5 w-5" /> GRUPO VIP FORMIGA
          </a>
          <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2">
            <MessageCircle className="h-5 w-5" /> GRUPO VIP CÓRREGO FUNDO
          </a>
        </div>
        
        <div className="mt-6 pt-5 border-t border-gray-100">
          <span className="text-sm text-muted-foreground font-semibold block mb-1">Contato Redação:</span>
          <a href="https://wa.me/5537998249936" className="text-xl font-black text-green-600 hover:text-green-700 hover:underline flex items-center justify-center gap-2">
            (37) 99824-9936
          </a>
        </div>
      </section>

      {/* 11. NAVEGAR */}
      <section className="bg-white p-6 rounded-xl shadow-md shadow-black/5 border border-gray-100">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3 mb-5 text-primary uppercase">Navegar</h2>
        <ul className="grid grid-cols-2 gap-y-3 text-sm font-semibold text-muted-foreground">
          {["Geral", "Formiga", "Regional", "Estadual", "Brasil", "Política", "Vídeos Curtos", "Colunistas"].map(item => (
            <li key={item}>
              <Link href={`/categoria/${item.toLowerCase()}`} className="hover:text-primary transition-colors flex items-center gap-1 group">
                <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-transform" /> 
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
