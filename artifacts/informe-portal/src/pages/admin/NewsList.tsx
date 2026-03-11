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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notícias</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie as publicações do portal.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar notícias..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Link href="/admin/noticias/nova" className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
            <Plus className="h-5 w-5" /> Nova
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                    <span className="font-mono bg-gray-100 px-1 rounded">{news.slug}</span>
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
        
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Página {page} de {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-sm font-bold">Anterior</button>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-sm font-bold">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
