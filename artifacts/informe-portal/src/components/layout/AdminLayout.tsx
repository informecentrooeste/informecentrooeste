import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, FileText, Tags, Image, Video as VideoIcon, 
  Users, Settings, LogOut, ShieldAlert, Menu, X, ChevronRight, UserCircle, Tv
} from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/noticias", icon: FileText, label: "Notícias" },
    { href: "/admin/categorias", icon: Tags, label: "Categorias" },
    { href: "/admin/banners", icon: Image, label: "Banners" },
    { href: "/admin/instagram-videos", icon: VideoIcon, label: "Instagram Videos" },
    { href: "/admin/articulistas", icon: UserCircle, label: "Articulistas" },
    { href: "/admin/programas", icon: Tv, label: "Programas" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push(
      { href: "/admin/usuarios", icon: Users, label: "Usuários" },
      { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
      { href: "/admin/audit", icon: ShieldAlert, label: "Logs de Auditoria" }
    );
  }

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/20 shrink-0">
        <span className="font-black text-xl tracking-wider">INFORME ADMIN</span>
      </div>
      
      <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{user?.name}</p>
          <p className="text-xs text-white/50">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                isActive 
                  ? "bg-primary text-white shadow-md" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "" : "opacity-70"}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-semibold text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair do sistema
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 bottom-0 z-40 bg-[#1e1b4b] text-white flex flex-col shadow-xl w-64
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-20 lg:min-h-screen lg:sticky lg:top-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-14 sm:h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="font-bold text-gray-800 text-sm sm:text-lg truncate">Painel de Administração</h1>
          </div>
          <a href="/" target="_blank" className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0">
            Ver Portal <ChevronRight className="h-4 w-4 hidden sm:block" />
          </a>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
