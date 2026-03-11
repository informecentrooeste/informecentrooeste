import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-url";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...getAuthHeaders(), ...opts?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Request failed"); }
  return res.json();
}

type ColumnistForm = {
  name: string;
  photoUrl: string;
  bio: string;
  articleSlug: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: ColumnistForm = { name: "", photoUrl: "", bio: "", articleSlug: "", sortOrder: 0, isActive: true };

export default function ColumnistsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ColumnistForm>(emptyForm);

  const { data: columnists, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/columnists"],
    queryFn: () => apiFetch("/admin/columnists"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/admin/columnists", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/columnists"] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => apiFetch(`/admin/columnists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/columnists"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/columnists/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/columnists"] }),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: any) => apiFetch(`/admin/columnists/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/columnists"] }),
  });

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => {
    setForm({
      name: c.name,
      photoUrl: c.photoUrl || "",
      bio: c.bio || "",
      articleSlug: c.articleSlug || "",
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      photoUrl: form.photoUrl.trim() || undefined,
      bio: form.bio.trim() || undefined,
      articleSlug: form.articleSlug.trim() || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Articulista atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Articulista adicionado!" });
      }
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este articulista?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Articulista excluído!" });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articulistas</h1>
        <button onClick={openNew} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 flex items-center gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Novo Articulista
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Articulista" : "Novo Articulista"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Nome do articulista" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Foto</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://... (link da foto do articulista)" />
            </div>
            {form.photoUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preview da Foto</label>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                  <img src={getImageUrl(form.photoUrl)} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug do Artigo</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.articleSlug} onChange={e => setForm({ ...form, articleSlug: e.target.value })} placeholder="slug-do-artigo (será usado em /noticia/slug-do-artigo)" />
              <p className="text-xs text-gray-500 mt-1">O slug da notícia que será exibida ao clicar na foto. Crie primeiro a notícia e copie o slug aqui.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Biografia (opcional)</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Breve descrição do articulista" />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Ativo
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Carregando...</div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-xl border border-red-100">
          <p className="text-red-500 font-semibold">Erro ao carregar articulistas</p>
          <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde</p>
        </div>
      ) : !columnists?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <GripVertical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Nenhum articulista cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Novo Articulista" para adicionar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Foto</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Artigo</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {columnists.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                      {c.photoUrl ? (
                        <img src={getImageUrl(c.photoUrl)} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-primary/40">{c.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    {c.bio && <p className="text-xs text-gray-500 line-clamp-1">{c.bio}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.articleSlug ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-mono">{c.articleSlug}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMut.mutate({ id: c.id, isActive: !c.isActive }, { onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }) })}
                      title={c.isActive ? "Desativar" : "Ativar"}
                    >
                      {c.isActive ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Editar"><Pencil className="h-4 w-4 text-gray-600" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
