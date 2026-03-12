import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tv } from "lucide-react";
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

type ProgramForm = {
  name: string;
  description: string;
  coverUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: ProgramForm = { name: "", description: "", coverUrl: "", linkUrl: "", sortOrder: 0, isActive: true };

export default function ProgramsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProgramForm>(emptyForm);

  const { data: programs, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/programs"],
    queryFn: () => apiFetch("/admin/programs"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/admin/programs", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/programs"] }); qc.invalidateQueries({ queryKey: ["/api/public/programs"] }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => apiFetch(`/admin/programs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/programs"] }); qc.invalidateQueries({ queryKey: ["/api/public/programs"] }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/programs/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/programs"] }); qc.invalidateQueries({ queryKey: ["/api/public/programs"] }); },
  });

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description || "",
      coverUrl: p.coverUrl || "",
      linkUrl: p.linkUrl || "",
      sortOrder: p.sortOrder ?? 0,
      isActive: p.isActive,
    });
    setEditId(p.id);
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
      description: form.description.trim() || undefined,
      coverUrl: form.coverUrl.trim() || undefined,
      linkUrl: form.linkUrl.trim() || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Programa atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Programa adicionado!" });
      }
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este programa?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Programa excluído!" });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (p: any) => {
    try {
      await updateMut.mutateAsync({ id: p.id, data: { isActive: !p.isActive } });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programas</h1>
        <button onClick={openNew} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 flex items-center gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Novo Programa
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Programa" : "Novo Programa"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Nome do programa" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do programa" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Capa</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://... (link da imagem de capa)" />
              <p className="text-xs text-gray-500 mt-1">Imagem de capa que aparece ao lado do nome na sidebar. Tamanho ideal: 80×80px ou quadrado.</p>
            </div>
            {form.coverUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preview da Capa</label>
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img src={getImageUrl(form.coverUrl)} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link (opcional)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://... (link ao clicar no programa)" />
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
          <p className="text-red-500 font-semibold">Erro ao carregar programas</p>
          <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde</p>
        </div>
      ) : !programs?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Tv className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Nenhum programa cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Novo Programa" para adicionar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Capa</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                      {p.coverUrl ? (
                        <img src={getImageUrl(p.coverUrl)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Tv className="h-5 w-5 text-primary/40" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Link</a>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 line-clamp-1">{p.description || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(p)} title={p.isActive ? "Desativar" : "Ativar"}>
                      {p.isActive ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Editar"><Pencil className="h-4 w-4 text-gray-600" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="h-4 w-4 text-red-500" /></button>
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
