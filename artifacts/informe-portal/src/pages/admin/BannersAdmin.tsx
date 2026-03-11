import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useToggleBannerStatus } from "@/hooks/use-admin";
import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const POSITIONS = [
  { value: "TOP", label: "Topo" },
  { value: "BELOW_PLAYER", label: "Abaixo do Player" },
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "BETWEEN_SECTIONS", label: "Entre Seções" },
  { value: "FOOTER", label: "Rodapé" },
] as const;

type BannerForm = {
  title: string;
  position: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: BannerForm = { title: "", position: "TOP", imageUrl: "", targetUrl: "", isActive: true, startsAt: "", endsAt: "" };

export default function BannersAdmin() {
  const { data: banners, isLoading, isError } = useAdminBanners();
  const createMut = useCreateBanner();
  const updateMut = useUpdateBanner();
  const deleteMut = useDeleteBanner();
  const toggleMut = useToggleBannerStatus();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (b: any) => {
    setForm({
      title: b.title,
      position: b.position,
      imageUrl: b.imageUrl,
      targetUrl: b.targetUrl || "",
      isActive: b.isActive,
      startsAt: b.startsAt ? b.startsAt.substring(0, 16) : "",
      endsAt: b.endsAt ? b.endsAt.substring(0, 16) : "",
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: form.title,
      position: form.position,
      imageUrl: form.imageUrl,
      targetUrl: form.targetUrl || undefined,
      isActive: form.isActive,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    };
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Banner atualizado!" });
      } else {
        await createMut.mutateAsync({ data: payload });
        toast({ title: "Banner criado!" });
      }
      setShowForm(false);
    } catch {
      toast({ title: "Erro ao salvar banner", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este banner?")) return;
    try {
      await deleteMut.mutateAsync({ id });
      toast({ title: "Banner excluído!" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await toggleMut.mutateAsync({ id, data: { isActive: !isActive } });
    } catch {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar banners. Tente recarregar a página.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm">Gerencie os banners publicitários do portal.</p>
        </div>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Banner" : "Novo Banner"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Posição</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Imagem</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL de Destino</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.targetUrl} onChange={e => setForm({ ...form, targetUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Início</label>
              <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fim</label>
              <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} />
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

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Título</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Posição</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Período</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(banners as any[])?.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3">{POSITIONS.find(p => p.value === b.position)?.label}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {b.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {b.startsAt ? new Date(b.startsAt).toLocaleDateString("pt-BR") : "—"} até {b.endsAt ? new Date(b.endsAt).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggle(b.id, b.isActive)} className="p-1.5 rounded hover:bg-gray-100" title={b.isActive ? "Desativar" : "Ativar"}>
                      {b.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    </button>
                    {b.targetUrl && (
                      <a href={b.targetUrl} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-gray-100"><ExternalLink className="h-4 w-4 text-blue-500" /></a>
                    )}
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="h-4 w-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {(banners as any[])?.map((b: any) => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{b.title}</h3>
                <p className="text-xs text-gray-500">{POSITIONS.find(p => p.value === b.position)?.label}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {b.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleToggle(b.id, b.isActive)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">
                {b.isActive ? "Desativar" : "Ativar"}
              </button>
              <button onClick={() => openEdit(b)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">Editar</button>
              <button onClick={() => handleDelete(b.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded font-semibold hover:bg-red-50">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
