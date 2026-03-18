import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Tv, Search, Instagram, Facebook, Youtube, Menu, X, Smartphone, ChevronDown, MapPin 
} from "lucide-react";
import { FaWhatsapp, FaGooglePlay, FaApple } from "react-icons/fa";
import { usePublicCategories } from "@/hooks/use-public";
import logoInforme from "@assets/logo-informe.png";
import { BannerCarousel } from "@/components/shared/BannerCarousel";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function TopBanner() {
  const { data: mobileBanners } = useQuery({
    queryKey: ["/api/public/banners", "TOP_MOBILE"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/banners?position=TOP_MOBILE`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const hasMobileBanner = Array.isArray(mobileBanners) && mobileBanners.filter((b: any) => b.isActive).length > 0;

  if (hasMobileBanner) {
    return (
      <>
        <div className="hidden md:block">
          <BannerCarousel position="TOP" fallbackHeight="h-[50px] md:h-[80px]" fallbackLabel="BANNER TOPO DESKTOP (1920x150)" className="" fillWidth />
        </div>
        <div className="block md:hidden">
          <BannerCarousel position="TOP_MOBILE" fallbackHeight="h-[50px]" fallbackLabel="BANNER TOPO MOBILE (750x150)" className="" fillWidth />
        </div>
      </>
    );
  }

  return (
    <BannerCarousel position="TOP" fallbackHeight="h-[50px] sm:h-[60px] md:h-[80px]" fallbackLabel="BANNER TOPO (1920x150)" className="" fillWidth />
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories } = usePublicCategories();
  const NAV_ORDER = ["geral", "formiga", "regional", "estadual", "brasil", "politica"];
  const navCategories = NAV_ORDER
    .map(slug => categories?.find(c => c.slug === slug))
    .filter(Boolean) as NonNullable<typeof categories>;

  const [regionalOpen, setRegionalOpen] = useState(false);
  const [mobileRegionalOpen, setMobileRegionalOpen] = useState(false);
  const regionalRef = useRef<HTMLDivElement>(null);

  const { data: regionalCities = [] } = useQuery<{ id: number; name: string; slug: string }[]>({
    queryKey: ["/api/public/cities", "regional"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/cities?category=regional`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionalRef.current && !regionalRef.current.contains(e.target as Node)) {
        setRegionalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/busca?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-foreground font-sans">
      {/* Banner Topo - Desktop/Mobile */}
      <TopBanner />

      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src={logoInforme} alt="Informe Centro-Oeste" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm">
            {navCategories.map(cat => {
              if (cat.slug === "regional" && regionalCities.length > 0) {
                return (
                  <div key={cat.id} className="relative" ref={regionalRef}>
                    <button
                      onClick={() => setRegionalOpen(!regionalOpen)}
                      className="hover:text-gray-300 transition-colors uppercase flex items-center gap-1"
                    >
                      {cat.name}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${regionalOpen ? "rotate-180" : ""}`} />
                    </button>
                    {regionalOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <Link
                          href="/categoria/regional"
                          onClick={() => setRegionalOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-primary/5 transition-colors text-sm font-bold text-primary"
                        >
                          <MapPin className="h-4 w-4" />
                          Todas as Cidades
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        {regionalCities.map(city => (
                          <Link
                            key={city.id}
                            href={`/categoria/regional?cidade=${city.slug}`}
                            onClick={() => setRegionalOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-primary/5 transition-colors text-sm font-medium"
                          >
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {city.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={cat.id} href={`/categoria/${cat.slug}`} className="hover:text-gray-300 transition-colors uppercase">
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-white/10 rounded-full px-3 py-1">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none w-32 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="text-white hover:text-gray-300 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
            
            <div className="hidden sm:flex items-center gap-3">
              <a href="https://www.instagram.com/informecentrooeste" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.facebook.com/share/14TiuW9h73u" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://youtube.com/@informecentrooeste" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
            
            <button 
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary text-primary-foreground border-t border-white/10 shadow-lg fixed top-16 left-0 w-full z-40">
          <div className="p-4 border-b border-white/10">
            <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded px-3 py-2">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none text-white w-full focus:outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit"><Search className="h-5 w-5 text-white/80" /></button>
            </form>
          </div>
          <nav className="flex flex-col px-4 py-2 font-semibold">
            {navCategories.map(cat => {
              if (cat.slug === "regional" && regionalCities.length > 0) {
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setMobileRegionalOpen(!mobileRegionalOpen)}
                      className="w-full py-3 border-b border-white/10 uppercase flex items-center justify-between"
                    >
                      {cat.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileRegionalOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileRegionalOpen && (
                      <div className="bg-white/5 border-b border-white/10">
                        <Link
                          href="/categoria/regional"
                          onClick={() => { setMobileMenuOpen(false); setMobileRegionalOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
                        >
                          <MapPin className="h-4 w-4" /> Todas as Cidades
                        </Link>
                        {regionalCities.map(city => (
                          <Link
                            key={city.id}
                            href={`/categoria/regional?cidade=${city.slug}`}
                            onClick={() => { setMobileMenuOpen(false); setMobileRegionalOpen(false); }}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white/80"
                          >
                            <MapPin className="h-3.5 w-3.5 text-white/50" /> {city.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={cat.id} href={`/categoria/${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-white/10 uppercase">
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center">

            <div className="shrink-0">
              <img src={logoInforme} alt="Informe Centro-Oeste" className="h-16 sm:h-20 w-auto" />
            </div>

            <div className="flex flex-col items-center lg:items-start gap-5">

              <div className="flex flex-col items-center lg:items-start gap-2">
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest text-white">Tenha a Informe TV na palma da sua mão</h4>
                <div className="flex gap-3">
                  <a href="https://play.google.com/store/apps/details?id=com.logicahost.informetv" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-3 text-white transition-colors">
                    <FaGooglePlay className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-[9px] leading-tight text-white/80 uppercase">Get it on</div>
                      <div className="font-semibold text-sm leading-tight text-white">Google Play</div>
                    </div>
                  </a>
                  <a href="https://apps.apple.com/br/app/informe-tv/id6746223815" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-3 text-white transition-colors">
                    <FaApple className="h-7 w-7" />
                    <div className="text-left">
                      <div className="text-[9px] leading-tight text-white/80 uppercase">Download on the</div>
                      <div className="font-semibold text-sm leading-tight text-white">App Store</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
                <div className="flex flex-col items-center sm:items-start gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Redes Sociais</span>
                  <div className="flex items-center gap-3">
                    <a href="https://www.facebook.com/share/14TiuW9h73u" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Facebook className="h-6 w-6" /></a>
                    <a href="https://www.instagram.com/informecentrooeste" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Instagram className="h-6 w-6" /></a>
                    <a href="https://youtube.com/@informecentrooeste" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Youtube className="h-6 w-6" /></a>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-start gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Entre em Contato</span>
                  <a href="https://wa.me/5537998249936" target="_blank" rel="noreferrer" className="border border-white/30 hover:bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2 font-bold text-sm transition-colors">
                    <FaWhatsapp className="h-5 w-5" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" target="_blank" rel="noreferrer" className="border border-white/30 hover:bg-white/10 rounded-lg px-5 py-2.5 flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors">
                  <FaWhatsapp className="h-5 w-5" /> Grupo VIP Formiga
                </a>
                <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" target="_blank" rel="noreferrer" className="border border-white/30 hover:bg-white/10 rounded-lg px-5 py-2.5 flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors">
                  <FaWhatsapp className="h-5 w-5" /> Grupo VIP Córrego Fundo
                </a>
              </div>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
