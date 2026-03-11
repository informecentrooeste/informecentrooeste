import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Tv, Search, Instagram, Facebook, Youtube, Menu, X, Smartphone 
} from "lucide-react";
import { FaWhatsapp, FaGooglePlay, FaApple } from "react-icons/fa";
import { usePublicCategories } from "@/hooks/use-public";
import logoInforme from "@assets/logo-informe.png";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories } = usePublicCategories();
  const NAV_ORDER = ["geral", "formiga", "regional", "estadual", "brasil", "politica"];
  const navCategories = NAV_ORDER
    .map(slug => categories?.find(c => c.slug === slug))
    .filter(Boolean) as NonNullable<typeof categories>;

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
      {/* Top Banner Ad Placeholder */}
      <div className="w-full bg-gray-200 h-20 hidden md:flex items-center justify-center text-gray-500 font-bold text-sm">
        BANNER PROPAGANDA
      </div>

      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src={logoInforme} alt="Informe Centro-Oeste" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm">
            {navCategories.map(cat => (
              <Link key={cat.id} href={`/categoria/${cat.slug}`} className="hover:text-gray-300 transition-colors uppercase">
                {cat.name}
              </Link>
            ))}
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
        <div className="lg:hidden bg-primary text-primary-foreground border-t border-white/10 shadow-lg absolute w-full z-40">
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
            {navCategories.map(cat => (
              <Link key={cat.id} href={`/categoria/${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-white/10 uppercase">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 sm:py-10">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">

          <img src={logoInforme} alt="Informe Centro-Oeste" className="h-16 sm:h-20 w-auto" />

          <div className="flex flex-col items-center gap-3">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest text-center text-white">Tenha a Informe TV na palma da sua mão</h4>
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

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Redes Sociais</span>
              <a href="https://www.facebook.com/share/14TiuW9h73u" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Facebook className="h-6 w-6" /></a>
              <a href="https://www.instagram.com/informecentrooeste" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Instagram className="h-6 w-6" /></a>
              <a href="https://youtube.com/@informecentrooeste" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity"><Youtube className="h-6 w-6" /></a>
            </div>

            <div className="flex items-center gap-3">
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
      </footer>
    </div>
  );
}
