import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminNews, useDeleteNews, useAdminPublishNews, useAdminArchiveNews } from "@/hooks/use-admin";
import { Plus, Edit, Trash2, CheckCircle, FileWarning, Search, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NewsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminNews({ page, limit: 10, search: search || undefined });
  const deleteMutation = useDeleteNews();
  const publishMutation = useAdminPublishNews();
  const archiveMutation = useAdminArchiveNews();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta notícia?")) {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Excluída com sucesso" });
    }
  };

  const handleStatus = async (id: number, action: 'publish' | 'archive') => {
    try {
      if (action === 'publish') await publishMutation.mutateAsync({ id });
      if (action === 'archive') await archiveMutation.mutateAsync({ id });
      toast({ title: "Status atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Notícias</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Gerencie as publicações do portal.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Link href="/admin/noticias/nova" className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5 text-sm transition-transform hover:-translate-y-0.5">
            <Plus className="h-4 w-4" /> Nova
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Imagem</th>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500 font-medium">Carregando...</td></tr>
            ) : data?.data?.map(news => (
              <tr key={news.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  {news.featuredImage ? (
                    <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden">
                      <img src={news.featuredImage.startsWith('/uploads') ? `/api${news.featuredImage}` : news.featuredImage} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 text-sm max-w-sm truncate">{news.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    {news.isFeatured && <span className="text-red-500 font-bold uppercase text-[10px]">Destaque</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-primary/10 text-primary font-bold text-xs px-2 py-1 rounded">
                    {news.category.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    news.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                    news.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {news.status === 'PUBLISHED' ? <CheckCircle className="h-3 w-3" /> : <FileWarning className="h-3 w-3" />}
                    {news.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {format(new Date(news.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {news.status !== 'PUBLISHED' && (
                      <button onClick={() => handleStatus(news.id, 'publish')} className="text-green-600 bg-green-50 p-2 rounded hover:bg-green-100 transition-colors" title="Publicar">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {news.status === 'PUBLISHED' && (
                      <button onClick={() => handleStatus(news.id, 'archive')} className="text-gray-600 bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors" title="Arquivar">
                        <FileWarning className="h-4 w-4" />
                      </button>
                    )}
                    <Link href={`/admin/noticias/${news.id}/editar`} className="text-primary bg-primary/5 p-2 rounded hover:bg-primary/10 transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(news.id)} className="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 font-medium">Carregando...</div>
        ) : data?.data?.map(news => (
          <div key={news.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-3">
              {news.featuredImage ? (
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img src={news.featuredImage.startsWith('/uploads') ? `/api${news.featuredImage}` : news.featuredImage} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{news.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="bg-primary/10 text-primary font-bold text-[10px] px-1.5 py-0.5 rounded">{news.category.name}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    news.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                    news.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {news.status}
                  </span>
                  <span className="text-[10px] text-gray-400">{format(new Date(news.createdAt), "dd/MM/yy")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
              {news.status !== 'PUBLISHED' && (
                <button onClick={() => handleStatus(news.id, 'publish')} className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-100 text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Publicar
                </button>
              )}
              {news.status === 'PUBLISHED' && (
                <button onClick={() => handleStatus(news.id, 'archive')} className="text-gray-600 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 text-xs font-bold flex items-center gap-1">
                  <FileWarning className="h-3.5 w-3.5" /> Arquivar
                </button>
              )}
              <Link href={`/admin/noticias/${news.id}/editar`} className="text-primary bg-primary/5 p-2 rounded-lg hover:bg-primary/10 text-xs font-bold flex items-center gap-1">
                <Edit className="h-3.5 w-3.5" /> Editar
              </Link>
              <button onClick={() => handleDelete(news.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
        
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Pág. {page}/{data.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs sm:text-sm font-bold">Anterior</button>
            <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs sm:text-sm font-bold">Próxima</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
