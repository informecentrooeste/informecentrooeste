import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Tv, Search, Instagram, Facebook, Youtube, Menu, X, Smartphone, MessageCircle 
} from "lucide-react";
import { usePublicCategories } from "@/hooks/use-public";

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
            <img src={`${import.meta.env.BASE_URL}images/logo-informe.png`} alt="Informe Centro-Oeste" className="h-10 w-auto" />
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
      <footer className="bg-primary text-primary-foreground mt-12 pt-12 pb-6 border-t-[6px] border-red-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 lg:gap-0">
            
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="mb-4">
                <img src={`${import.meta.env.BASE_URL}images/logo-informe.png`} alt="Informe Centro-Oeste" className="h-14 w-auto" />
              </div>
              <p className="text-indigo-200 max-w-xs text-sm">
                Tenha a Informe TV na palma da sua mão. Informação com credibilidade e agilidade para todo o Centro-Oeste.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Baixe nosso App</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://play.google.com/store/apps/details?id=com.logicahost.informetv" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3 transition-transform hover:-translate-y-1">
                  <Tv className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-gray-300">DISPONÍVEL NO</div>
                    <div className="font-semibold text-sm leading-tight">Google Play</div>
                  </div>
                </a>
                <a href="https://apps.apple.com/br/app/informe-tv/id6746223815" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3 transition-transform hover:-translate-y-1">
                  <Smartphone className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-gray-300">Baixar na</div>
                    <div className="font-semibold text-sm leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Redes Sociais</h4>
              <div className="flex items-center gap-4 mb-6">
                <a href="https://www.instagram.com/informecentrooeste" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all hover:scale-110"><Instagram className="h-5 w-5" /></a>
                <a href="https://www.facebook.com/share/14TiuW9h73u" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all hover:scale-110"><Facebook className="h-5 w-5" /></a>
                <a href="https://youtube.com/@informecentrooeste" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all hover:scale-110"><Youtube className="h-5 w-5" /></a>
              </div>
              
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider mt-2">Entre em Contato</h4>
              <div className="flex flex-col gap-2 w-full max-w-[250px]">
                <a href="https://wa.me/5537998249936" target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg">
                  <MessageCircle className="h-4 w-4" /> (37) 99824-9936
                </a>
                <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors text-center">
                  GRUPO VIP FORMIGA
                </a>
                <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors text-center">
                  GRUPO VIP CÓRREGO FUNDO
                </a>
              </div>
            </div>
            
          </div>
          
          <div className="border-t border-white/10 mt-10 pt-6 text-center text-primary-foreground/60 text-xs">
            <p>&copy; {new Date().getFullYear()} Informe Centro-Oeste / Informe TV. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
