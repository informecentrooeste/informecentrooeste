import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useToggleCategoryStatus } from "@/hooks/use-admin";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@workspace/api-client-react";

export default function CategoriesAdmin() {
  const { data: categories, isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const toggleMutation = useToggleCategoryStatus();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || "");
    } else {
      setEditingId(null);
      setName("");
      setSlug("");
      setDescription("");
    }
    setIsModalOpen(true);
  };

  const generateSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: { name, slug, description } });
        toast({ title: "Categoria atualizada!" });
      } else {
        await createMutation.mutateAsync({ data: { name, slug, description } });
        toast({ title: "Categoria criada!" });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, data: { isActive: !currentStatus } });
      toast({ title: "Status alterado" });
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Categorias</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Gerencie as categorias de notícias do portal.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 text-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500 font-medium">Carregando...</td></tr>
            ) : categories?.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{cat.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono bg-gray-50 rounded px-2">{cat.slug}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(cat.id, cat.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cat.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {cat.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => openModal(cat)}
                    className="text-primary hover:text-primary/70 bg-primary/5 hover:bg-primary/10 p-2 rounded-lg transition-colors inline-flex"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
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
        ) : categories?.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleStatus(cat.id, cat.isActive)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                    cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {cat.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {cat.isActive ? 'Ativo' : 'Inativo'}
                </button>
                <button 
                  onClick={() => openModal(cat)}
                  className="text-primary bg-primary/5 p-2 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-lg">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                  <input required value={name} onChange={e => handleNameChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary" placeholder="Ex: Esportes" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
                  <input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 font-mono text-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary resize-none" />
                </div>
              </div>
              <div className="mt-6 sm:mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 text-sm">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
