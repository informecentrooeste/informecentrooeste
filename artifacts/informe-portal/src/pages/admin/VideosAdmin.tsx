import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminVideos, useCreateVideo, useUpdateVideo, useDeleteVideo, useToggleVideoStatus } from "@/hooks/use-admin";
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SOURCE_TYPES = [
  { value: "YOUTUBE", label: "YouTube" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "INTERNAL", label: "Interno" },
] as const;

type VideoForm = {
  title: string;
  description: string;
  sourceType: string;
  videoUrl: string;
  thumbnailUrl: string;
  redirectUrl: string;
  isActive: boolean;
};

const emptyForm: VideoForm = { title: "", description: "", sourceType: "INSTAGRAM", videoUrl: "", thumbnailUrl: "", redirectUrl: "", isActive: true };

export default function VideosAdmin() {
  const { data: videos, isLoading, isError } = useAdminVideos();
  const createMut = useCreateVideo();
  const updateMut = useUpdateVideo();
  const deleteMut = useDeleteVideo();
  const toggleMut = useToggleVideoStatus();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (v: any) => {
    setForm({ title: v.title, description: v.description || "", sourceType: v.sourceType, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl || "", redirectUrl: v.redirectUrl || "", isActive: v.isActive });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: form.title,
      description: form.description || undefined,
      sourceType: form.sourceType,
      videoUrl: form.videoUrl,
      thumbnailUrl: form.thumbnailUrl || undefined,
      redirectUrl: form.redirectUrl || undefined,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Vídeo atualizado!" });
      } else {
        await createMut.mutateAsync({ data: payload });
        toast({ title: "Vídeo criado!" });
      }
      setShowForm(false);
    } catch {
      toast({ title: "Erro ao salvar vídeo", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este vídeo?")) return;
    try {
      await deleteMut.mutateAsync({ id });
      toast({ title: "Vídeo excluído!" });
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
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar vídeos. Tente recarregar a página.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Vídeos</h1>
          <p className="text-gray-500 text-sm">Gerencie os vídeos do portal.</p>
        </div>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Vídeo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Vídeo" : "Novo Vídeo"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Ex: PM prende suspeito em flagrante" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Texto que aparece abaixo do vídeo no portal" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Fonte</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sourceType} onChange={e => setForm({ ...form, sourceType: e.target.value })}>
                {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL do Vídeo</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} required placeholder="Link do vídeo (YouTube, upload, etc.)" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Thumbnail (Capa)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="Link da imagem de capa do vídeo" />
              <p className="text-xs text-gray-500 mt-1">Para YouTube, a capa é extraída automaticamente. Para Instagram/Interno, cole o link de uma imagem.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link de Redirecionamento (Post no Instagram)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.redirectUrl} onChange={e => setForm({ ...form, redirectUrl: e.target.value })} placeholder="https://www.instagram.com/p/... (ao clicar, redireciona para este link)" />
              <p className="text-xs text-gray-500 mt-1">Quando o visitante clicar no vídeo, será direcionado para este link. Se vazio, abre o link do vídeo.</p>
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
              <th className="text-left px-4 py-3 font-bold text-gray-600">Fonte</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Data</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(videos as any[])?.map((v: any) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{v.title}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                    {SOURCE_TYPES.find(s => s.value === v.sourceType)?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {v.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggle(v.id, v.isActive)} className="p-1.5 rounded hover:bg-gray-100" title={v.isActive ? "Desativar" : "Ativar"}>
                      {v.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    </button>
                    <a href={v.videoUrl} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-gray-100"><Play className="h-4 w-4 text-blue-500" /></a>
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="h-4 w-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {(videos as any[])?.map((v: any) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{v.title}</h3>
                <p className="text-xs text-gray-500">{SOURCE_TYPES.find(s => s.value === v.sourceType)?.label}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {v.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleToggle(v.id, v.isActive)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">
                {v.isActive ? "Desativar" : "Ativar"}
              </button>
              <button onClick={() => openEdit(v)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">Editar</button>
              <button onClick={() => handleDelete(v.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded font-semibold hover:bg-red-50">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
