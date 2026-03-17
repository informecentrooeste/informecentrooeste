import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

interface City {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CitiesAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", categoryId: "", isActive: true });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/admin/cities"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/cities`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/public/categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/categories`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const url = editingId ? `${API_BASE}/admin/cities/${editingId}` : `${API_BASE}/admin/cities`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/cities"] });
      toast({ title: editingId ? "Cidade atualizada!" : "Cidade cadastrada!" });
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", categoryId: "", isActive: true });
    },
    onError: () => toast({ title: "Erro ao salvar cidade", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/admin/cities/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erro ao excluir");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/cities"] });
      toast({ title: "Cidade excluída!" });
    },
    onError: () => toast({ title: "Erro ao excluir cidade", variant: "destructive" }),
  });

  const openEdit = (city: City) => {
    setEditingId(city.id);
    setForm({ name: city.name, categoryId: city.categoryId.toString(), isActive: city.isActive });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    const regional = categories.find(c => c.slug === "regional");
    setForm({ name: "", categoryId: regional ? regional.id.toString() : "", isActive: true });
    setShowForm(true);
  };

  const getCategoryName = (catId: number) => categories.find(c => c.id === catId)?.name || "-";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <MapPin className="h-7 w-7 text-primary" /> Cidades Regionais
          </h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre cidades para vincular às notícias regionais</p>
        </div>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Cidade
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-lg mb-4">{editingId ? "Editar Cidade" : "Nova Cidade"}</h3>
          <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Cidade</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Córrego Fundo" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria Vinculada</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="" disabled>Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Ativa
              </label>
              <button type="submit" disabled={saveMut.isPending} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-gray-700">Cidade</th>
              <th className="text-left px-4 py-3 font-bold text-gray-700">Categoria</th>
              <th className="text-left px-4 py-3 font-bold text-gray-700">Status</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhuma cidade cadastrada</td></tr>
            ) : cities.map(city => (
              <tr key={city.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {city.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{getCategoryName(city.categoryId)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${city.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {city.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(city)} className="p-1.5 hover:bg-gray-100 rounded-lg mr-1"><Pencil className="h-4 w-4 text-gray-500" /></button>
                  <button onClick={() => { if (confirm("Excluir esta cidade?")) deleteMut.mutate(city.id); }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
