import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useToggleBannerStatus } from "@/hooks/use-admin";
import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

const POSITIONS = [
  { value: "TOP", label: "Banner Topo (Desktop)", description: "Banner no topo do site, acima do menu — visível em telas maiores (desktop/tablet)", size: "1920×250" },
  { value: "TOP_MOBILE", label: "Banner Topo (Mobile)", description: "Banner no topo do site, acima do menu — visível apenas em celulares", size: "750×150" },
  { value: "ABOVE_DESTAQUE", label: "Banner Acima do Destaque", description: "Entre o player de TV e a seção de destaque", size: "970×120" },
  { value: "BELOW_DESTAQUE", label: "Banner Abaixo do Destaque", description: "Logo abaixo do carrossel de destaque", size: "970×120" },
  { value: "BELOW_ARTICULISTAS", label: "Banner Abaixo dos Articulistas", description: "Após a seção de articulistas", size: "970×120" },
  { value: "ABOVE_POLITICA", label: "Banner Acima do Política", description: "Antes da seção Política", size: "970×120" },
  { value: "ABOVE_PROGRAMAS", label: "Banner Acima do Programas", description: "Na sidebar, acima da seção Programas", size: "300×250" },
  { value: "ABOVE_ULTIMAS_NOTICIAS_NEW", label: "Banner Acima das Últimas Notícias", description: "Na sidebar, entre Programas e Últimas Notícias", size: "300×250" },
  { value: "BELOW_MAIS_LIDAS", label: "Banner Abaixo das Mais Lidas", description: "Na sidebar, abaixo da seção Mais Lidas", size: "300×250" },
  { value: "ABOVE_NAVEGAR", label: "Banner Acima do Navegar", description: "Na sidebar, acima da seção Navegar", size: "300×250" },
  { value: "MID_NEWS", label: "Banner Meio Notícia", description: "No meio do conteúdo da notícia", size: "970×120" },
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
  const [expandedPos, setExpandedPos] = useState<string | null>(null);

  const openNew = (position?: string) => {
    setForm({ ...emptyForm, position: position || "TOP" });
    setEditId(null);
    setShowForm(true);
  };
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

  const allBanners = (banners as any[]) || [];
  const getBannersByPosition = (pos: string) => allBanners.filter((b: any) => b.position === pos);

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar banners.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm">Cada posição suporta até 5 banners em carrossel (rotação a cada 5s).</p>
        </div>
        <button onClick={() => openNew()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
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
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label} ({p.size})</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem do Banner</label>
              <CloudinaryUpload
                type="image"
                onSuccess={(data) => setForm({ ...form, imageUrl: data.url })}
              />
              {form.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Prévia:</p>
                  <img src={form.imageUrl} alt="preview" className="w-full h-auto max-h-[150px] object-cover rounded-lg" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link de Direcionamento</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.targetUrl} onChange={e => setForm({ ...form, targetUrl: e.target.value })} placeholder="https://... (para onde o banner direciona ao clicar)" />
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

      <div className="flex flex-col gap-3">
        {POSITIONS.map(pos => {
          const posBanners = getBannersByPosition(pos.value);
          const isExpanded = expandedPos === pos.value;
          const activeCount = posBanners.filter((b: any) => b.isActive).length;
          return (
            <div key={pos.value} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedPos(isExpanded ? null : pos.value)}
                className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{pos.label}</h3>
                    <p className="text-xs text-gray-500">{pos.description} — <span className="font-mono">{pos.size}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {activeCount}/{posBanners.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 sm:px-6 py-4">
                  {posBanners.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm mb-3">Nenhum banner nesta posição</p>
                      <button onClick={() => openNew(pos.value)} className="text-primary text-sm font-bold hover:underline flex items-center gap-1 mx-auto">
                        <Plus className="h-3 w-3" /> Adicionar banner
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        {posBanners.map((b: any) => (
                          <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{b.title}</p>
                              {b.targetUrl && (
                                <a href={b.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate">
                                  <ExternalLink className="h-3 w-3 shrink-0" /> {b.targetUrl}
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => handleToggle(b.id, b.isActive)} title={b.isActive ? "Desativar" : "Ativar"}>
                                {b.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                              </button>
                              <button onClick={() => openEdit(b)} className="p-1 hover:bg-gray-100 rounded"><Pencil className="h-3.5 w-3.5 text-gray-500" /></button>
                              <button onClick={() => handleDelete(b.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {posBanners.length < 5 && (
                        <button onClick={() => openNew(pos.value)} className="text-primary text-sm font-bold hover:underline flex items-center gap-1 mt-3">
                          <Plus className="h-3 w-3" /> Adicionar mais um banner ({5 - posBanners.length} vagas)
                        </button>
                      )}
                      {posBanners.length >= 5 && (
                        <p className="text-xs text-orange-500 font-semibold mt-3">Limite de 5 banners atingido nesta posição.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
