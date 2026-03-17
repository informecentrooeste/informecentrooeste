import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LightboxProvider } from "@/components/shared/ImageLightbox";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/public/Home";
import Article from "@/pages/public/Article";
import Category from "@/pages/public/Category";
import Search from "@/pages/public/Search";
import Columnist from "@/pages/public/Columnist";

// Admin Pages
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import CategoriesAdmin from "@/pages/admin/CategoriesAdmin";
import NewsList from "@/pages/admin/NewsList";
import NewsForm from "@/pages/admin/NewsForm";
import BannersAdmin from "@/pages/admin/BannersAdmin";
import InstagramVideosAdmin from "@/pages/admin/InstagramVideosAdmin";
import ColumnistsAdmin from "@/pages/admin/ColumnistsAdmin";
import ProgramsAdmin from "@/pages/admin/ProgramsAdmin";
import UsersAdmin from "@/pages/admin/UsersAdmin";
import SettingsAdmin from "@/pages/admin/SettingsAdmin";
import AuditAdmin from "@/pages/admin/AuditAdmin";
import WpImportAdmin from "@/pages/admin/WpImportAdmin";
import CitiesAdmin from "@/pages/admin/CitiesAdmin";

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
      <Route path="/articulista/:id" component={Columnist} />

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
        <ProtectedRoute component={BannersAdmin} />
      </Route>
      <Route path="/admin/instagram-videos">
        <ProtectedRoute component={InstagramVideosAdmin} />
      </Route>
      <Route path="/admin/articulistas">
        <ProtectedRoute component={ColumnistsAdmin} />
      </Route>
      <Route path="/admin/programas">
        <ProtectedRoute component={ProgramsAdmin} />
      </Route>
      <Route path="/admin/cidades">
        <ProtectedRoute component={CitiesAdmin} />
      </Route>
      <Route path="/admin/usuarios">
        <ProtectedRoute component={UsersAdmin} adminOnly />
      </Route>
      <Route path="/admin/configuracoes">
        <ProtectedRoute component={SettingsAdmin} adminOnly />
      </Route>
      <Route path="/admin/audit">
        <ProtectedRoute component={AuditAdmin} adminOnly />
      </Route>
      <Route path="/admin/importar-wordpress">
        <ProtectedRoute component={WpImportAdmin} adminOnly />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LightboxProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LightboxProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
