import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders as getAuth } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function getAuthHeaders() {
  return { "Content-Type": "application/json", ...getAuth() };
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...getAuthHeaders(), ...opts?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Request failed"); }
  return res.json();
}

const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\/?/;

type VideoForm = {
  title: string;
  description: string;
  instagramUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
};

const emptyForm: VideoForm = { title: "", description: "", instagramUrl: "", thumbnailUrl: "", isActive: true };

function getEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed` : "";
}

export default function InstagramVideosAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);

  const { data: videos, isLoading, isError } = useQuery({ queryKey: ["/api/admin/instagram-videos"], queryFn: () => apiFetch("/admin/instagram-videos") });

  const createMut = useMutation({ mutationFn: (data: any) => apiFetch("/admin/instagram-videos", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/instagram-videos"] }) });
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => apiFetch(`/admin/instagram-videos/${id}`, { method: "PUT", body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/instagram-videos"] }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => apiFetch(`/admin/instagram-videos/${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/instagram-videos"] }) });
  const toggleMut = useMutation({ mutationFn: ({ id, isActive }: any) => apiFetch(`/admin/instagram-videos/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/instagram-videos"] }) });

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (v: any) => {
    setForm({ title: v.title, description: v.description || "", instagramUrl: v.instagramUrl, thumbnailUrl: v.thumbnailUrl || "", isActive: v.isActive });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!INSTAGRAM_URL_REGEX.test(form.instagramUrl)) {
      toast({ title: "URL inválida", description: "Use links no formato instagram.com/p/... ou instagram.com/reel/...", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title,
      description: form.description || undefined,
      instagramUrl: form.instagramUrl,
      thumbnailUrl: form.thumbnailUrl || undefined,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Vídeo atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Vídeo adicionado!" });
      }
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este vídeo?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Vídeo excluído!" });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaInstagram className="h-7 w-7 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Instagram Videos</h1>
        </div>
        <button onClick={openNew} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 flex items-center gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Novo Vídeo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Vídeo" : "Novo Vídeo do Instagram"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Ex: Flagrante na região centro-oeste" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Texto que aparece abaixo do vídeo no portal" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL do Instagram</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })} required placeholder="https://www.instagram.com/p/... ou https://www.instagram.com/reel/..." />
              <p className="text-xs text-gray-500 mt-1">Cole o link do post ou reel do Instagram</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Thumbnail (opcional)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="Link de uma imagem de capa (opcional)" />
            </div>
            {form.instagramUrl && INSTAGRAM_URL_REGEX.test(form.instagramUrl) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preview</label>
                <div className="border rounded-lg overflow-hidden max-w-sm">
                  <iframe src={getEmbedUrl(form.instagramUrl)} className="w-full h-[450px] border-0" loading="lazy" />
                </div>
              </div>
            )}
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
          <p className="text-red-500 font-semibold">Erro ao carregar vídeos</p>
          <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde</p>
        </div>
      ) : !videos?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FaInstagram className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Nenhum vídeo do Instagram cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Novo Vídeo" para adicionar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">URL</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v: any) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FaInstagram className="h-4 w-4 text-pink-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">{v.title}</p>
                        {v.description && <p className="text-xs text-gray-500 line-clamp-1">{v.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={v.instagramUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" /> Abrir
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleMut.mutate({ id: v.id, isActive: !v.isActive }, { onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }) })} title={v.isActive ? "Desativar" : "Ativar"}>
                      {v.isActive ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Editar"><Pencil className="h-4 w-4 text-gray-600" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="h-4 w-4 text-red-500" /></button>
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
