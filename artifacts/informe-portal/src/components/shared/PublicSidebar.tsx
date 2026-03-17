import { Tv, Cloud, MapPin, Sun, ChevronRight, CloudRain, CloudLightning, CloudDrizzle, CloudSun, Snowflake, CloudFog, Droplets, Wind } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";
import { usePublicLatestNews, usePublicMostRead } from "@/hooks/use-public";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";
import { BannerCarousel } from "@/components/shared/BannerCarousel";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function WeatherIcon({ icon, className = "h-6 w-6" }: { icon: string; className?: string }) {
  switch (icon) {
    case "sun": return <Sun className={`${className} text-yellow-300`} />;
    case "cloud-sun": return <CloudSun className={`${className} text-yellow-200`} />;
    case "cloud": return <Cloud className={`${className} text-white`} />;
    case "cloud-rain": return <CloudRain className={`${className} text-blue-200`} />;
    case "cloud-drizzle": return <CloudDrizzle className={`${className} text-blue-200`} />;
    case "cloud-lightning": return <CloudLightning className={`${className} text-yellow-400`} />;
    case "cloud-fog": return <CloudFog className={`${className} text-gray-300`} />;
    case "snowflake": return <Snowflake className={`${className} text-white`} />;
    default: return <Cloud className={`${className} text-white`} />;
  }
}

export function PublicSidebar() {
  const { data: latestNews } = usePublicLatestNews(4);
  const { data: mostRead } = usePublicMostRead(5);
  const { data: programs } = useQuery({
    queryKey: ["/api/public/programs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/programs`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
  const { data: weather } = useQuery({
    queryKey: ["/api/public/weather"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/weather`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 30,
  });

  return (
    <aside className="w-full lg:w-[25%] lg:min-w-[280px] flex flex-col gap-5 sm:gap-8 lg:sticky lg:top-24 h-fit">
      
      <a href="https://player.logicahost.com.br/player.php?player=2050" target="_blank" rel="noreferrer" className="bg-red-600 text-white rounded-xl p-4 flex items-center justify-between shadow-lg shadow-red-600/20 cursor-pointer hover:bg-red-700 transition-colors">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6" />
          <span className="font-bold text-lg uppercase tracking-wider">TV AO VIVO</span>
        </div>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </a>

      <BannerCarousel position="ABOVE_PROGRAMAS" fallbackHeight="h-[250px]" fallbackLabel="BANNER ACIMA DO PROGRAMAS" />

      <section className="bg-white p-5 rounded-xl shadow-md shadow-black/5 border border-gray-100">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3 mb-5 text-primary uppercase">Programas</h2>
        <div className="flex flex-col gap-3">
          {(programs && programs.length > 0 ? programs : [
            { id: 1, name: "Informe Notícias", description: "Principais notícias da região", coverUrl: null, linkUrl: null },
            { id: 2, name: "Informe Saúde", description: "Informações sobre saúde e bem-estar", coverUrl: null, linkUrl: null },
            { id: 3, name: "Microfonia", description: "Entrevistas e debates ao vivo", coverUrl: null, linkUrl: null },
          ]).map((programa: any) => {
            const content = (
              <div key={programa.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary/5 transition-colors cursor-pointer group border border-gray-100">
                {programa.coverUrl ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={getImageUrl(programa.coverUrl)} alt={programa.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Tv className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{programa.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{programa.description}</p>
                </div>
              </div>
            );
            return programa.linkUrl ? (
              <a key={programa.id} href={programa.linkUrl} target="_blank" rel="noreferrer">{content}</a>
            ) : (
              <div key={programa.id}>{content}</div>
            );
          })}
        </div>
        <Link href="/categoria/programas" className="flex items-center justify-center gap-1 mt-4 text-sm font-semibold text-primary hover:underline">
          Ver mais <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      <BannerCarousel position="ABOVE_ULTIMAS_NOTICIAS_NEW" fallbackHeight="h-[250px]" fallbackLabel="BANNER ACIMA DAS ÚLTIMAS NOTÍCIAS" />

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

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cloud className="h-4 w-4" /> Previsão do Tempo
        </h2>
        
        {weather ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1 font-semibold text-blue-100 mb-1">
                  <MapPin className="h-4 w-4" /> {weather.city}, {weather.state}
                </div>
                <div className="text-5xl font-black tracking-tighter">{weather.current.temp}°C</div>
                <div className="text-sm text-blue-100 mt-1">{weather.current.description}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-blue-200">
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {weather.current.humidity}%</span>
                  <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weather.current.windSpeed} km/h</span>
                </div>
              </div>
              <WeatherIcon icon={weather.current.icon} className="h-16 w-16 drop-shadow-xl" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 border-t border-blue-400/30 pt-4">
              {weather.forecast?.map((day: any, i: number) => (
                <div key={i} className="text-center">
                  <span className="text-xs text-blue-100 block mb-1">{day.day}</span>
                  <WeatherIcon icon={day.icon} className="h-6 w-6 mx-auto mb-1" />
                  <span className="font-bold text-sm">{day.maxTemp}° <span className="text-blue-200 text-xs font-normal">{day.minTemp}°</span></span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1 font-semibold text-blue-100 mb-1">
                  <MapPin className="h-4 w-4" /> Formiga, MG
                </div>
                <div className="text-3xl font-black tracking-tighter mt-2">Carregando...</div>
              </div>
              <Cloud className="h-16 w-16 text-blue-300/50 animate-pulse" />
            </div>
          </>
        )}
      </section>

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

      <BannerCarousel position="BELOW_MAIS_LIDAS" fallbackHeight="h-[250px]" fallbackLabel="BANNER ABAIXO DAS MAIS LIDAS" />

      <section className="bg-white p-6 rounded-xl shadow-md shadow-black/5 border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white mb-4 shadow-lg shadow-green-500/30">
          <FaWhatsapp className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-6">Participe dos nossos grupos!</h2>
        
        <div className="flex flex-col gap-3">
          <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2">
            <FaWhatsapp className="h-5 w-5" /> GRUPO VIP FORMIGA
          </a>
          <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2">
            <FaWhatsapp className="h-5 w-5" /> GRUPO VIP CÓRREGO FUNDO
          </a>
        </div>
        
        <div className="mt-6 pt-5 border-t border-gray-100">
          <span className="text-sm text-muted-foreground font-semibold block mb-1">Contato Redação:</span>
          <a href="https://wa.me/5537998249936" className="text-xl font-black text-green-600 hover:text-green-700 hover:underline flex items-center justify-center gap-2">
            (37) 99824-9936
          </a>
        </div>
      </section>

      <BannerCarousel position="ABOVE_NAVEGAR" fallbackHeight="h-[250px]" fallbackLabel="BANNER ACIMA DO NAVEGAR" />

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
