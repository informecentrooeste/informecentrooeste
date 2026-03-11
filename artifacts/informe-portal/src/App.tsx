import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/public/Home";
import Article from "@/pages/public/Article";
import Category from "@/pages/public/Category";
import Search from "@/pages/public/Search";

// Admin Pages
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import CategoriesAdmin from "@/pages/admin/CategoriesAdmin";
import NewsList from "@/pages/admin/NewsList";
import NewsForm from "@/pages/admin/NewsForm";

import { AdminLayout } from "@/components/layout/AdminLayout";

const PlaceholderAdmin = ({ title }: { title: string }) => {
  return (
    <AdminLayout>
      <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-500 text-sm">Módulo em desenvolvimento. Interface CRUD padrão a ser implementada.</p>
      </div>
    </AdminLayout>
  );
};

const ProtectedRoute = ({ component: Component, adminOnly = false }: any) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;
  if (!user) return <Redirect to="/admin/login" />;
  if (adminOnly && user.role !== "ADMIN") return <Redirect to="/admin/dashboard" />;
  return <Component />;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } }
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/noticia/:slug" component={Article} />
      <Route path="/categoria/:slug" component={Category} />
      <Route path="/busca" component={Search} />

      {/* Admin Auth Route */}
      <Route path="/admin/login" component={Login} />

      {/* Admin Protected Routes */}
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/admin/categorias">
        <ProtectedRoute component={CategoriesAdmin} />
      </Route>
      <Route path="/admin/noticias">
        <ProtectedRoute component={NewsList} />
      </Route>
      <Route path="/admin/noticias/nova">
        <ProtectedRoute component={NewsForm} />
      </Route>
      <Route path="/admin/noticias/:id/editar">
        <ProtectedRoute component={NewsForm} />
      </Route>
      
      {/* Additional Admin Modules */}
      <Route path="/admin/banners">
        <ProtectedRoute component={() => <PlaceholderAdmin title="Gerenciar Banners" />} />
      </Route>
      <Route path="/admin/videos">
        <ProtectedRoute component={() => <PlaceholderAdmin title="Gerenciar Vídeos" />} />
      </Route>
      <Route path="/admin/usuarios">
        <ProtectedRoute component={() => <PlaceholderAdmin title="Gerenciar Usuários" />} adminOnly />
      </Route>
      <Route path="/admin/configuracoes">
        <ProtectedRoute component={() => <PlaceholderAdmin title="Configurações do Portal" />} adminOnly />
      </Route>
      <Route path="/admin/audit">
        <ProtectedRoute component={() => <PlaceholderAdmin title="Logs de Auditoria" />} adminOnly />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
