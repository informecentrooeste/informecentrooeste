import { AdminLayout } from "@/components/layout/AdminLayout";
import { useDashboardStats } from "@/hooks/use-admin";
import { FileText, Eye, Users, FileCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;

  const cards = [
    { title: "Total de Notícias", value: stats?.totalNews || 0, icon: FileText, color: "bg-blue-500" },
    { title: "Publicadas", value: stats?.publishedNews || 0, icon: FileCheck, color: "bg-green-500" },
    { title: "Visualizações", value: stats?.totalViews || 0, icon: Eye, color: "bg-purple-500" },
    { title: "Usuários Ativos", value: stats?.totalUsers || 0, icon: Users, color: "bg-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Visão Geral</h1>
        <p className="text-gray-500 font-medium text-sm">Bem-vindo ao painel de controle do Informe Centro-Oeste.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${card.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-inner shrink-0`}>
              <card.icon className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-xl sm:text-3xl font-black text-gray-900 leading-none mt-0.5 sm:mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 sm:mb-5 border-b border-gray-100 pb-3 sm:pb-4">Últimas Notícias Adicionadas</h2>
          <div className="flex flex-col gap-4">
            {stats?.recentNews.map(news => (
              <div key={news.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{news.title}</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                  news.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                  news.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {news.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 sm:mb-5 border-b border-gray-100 pb-3 sm:pb-4">Artigos Mais Acessados</h2>
          <div className="flex flex-col gap-4">
            {stats?.mostViewed.map(news => (
              <div key={news.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center text-purple-700 font-black text-xs flex-shrink-0">
                  <Eye className="h-4 w-4 mr-1" />
                  {news.viewCount}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{news.title}</h4>
                  <p className="text-xs text-primary font-bold mt-1 uppercase">{news.category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
