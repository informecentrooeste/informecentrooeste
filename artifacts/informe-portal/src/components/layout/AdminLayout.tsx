import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, FileText, Tags, Image, Video as VideoIcon, 
  Users, Settings, LogOut, ShieldAlert
} from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/noticias", icon: FileText, label: "Notícias" },
    { href: "/admin/categorias", icon: Tags, label: "Categorias" },
    { href: "/admin/banners", icon: Image, label: "Banners" },
    { href: "/admin/videos", icon: VideoIcon, label: "Vídeos" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push(
      { href: "/admin/usuarios", icon: Users, label: "Usuários" },
      { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
      { href: "/admin/audit", icon: ShieldAlert, label: "Logs de Auditoria" }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1b4b] text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/20">
          <span className="font-black text-xl tracking-wider">INFORME ADMIN</span>
        </div>
        
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg shadow-inner">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{user?.name}</p>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-md" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "" : "opacity-70"}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-semibold text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-bold text-gray-800 text-lg">Painel de Administração</h1>
          <a href="/" target="_blank" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Ver Portal <ChevronRight className="h-4 w-4" />
          </a>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function ChevronRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
