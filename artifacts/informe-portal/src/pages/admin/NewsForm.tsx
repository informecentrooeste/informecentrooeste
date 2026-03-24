import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminNews, useCreateNews, useUpdateNews, useAdminCategories, useUploadFile } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Upload, X, FileText, Video, Link2, ImagePlus, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { getAuthHeaders } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: newsData } = useAdminNews();
  const article = isEdit ? newsData?.data.find(n => n.id === Number(id)) : null;
  const { data: categories } = useAdminCategories();
  
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const uploadMutation = useUploadFile();

  const { data: cities = [] } = useQuery<{ id: number; name: string; slug: string; categoryId: number; isActive: boolean }[]>({
    queryKey: ["/api/admin/cities"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/cities`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    isFeatured: false,
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    redirectUrl: "",
    videoUrl: "",
    galleryImages: [] as string[],
    attachmentUrl: "",
    attachmentName: "",
    cityId: "",
  });

  const filteredCities = cities.filter(c => c.isActive && c.categoryId === Number(formData.categoryId));

  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (article) {
      let gallery: string[] = [];
      try {
        if ((article as any).galleryImages) gallery = JSON.parse((article as any).galleryImages);
      } catch {}
      setFormData({
        title: article.title,
        slug: article.slug,
        summary: article.summary || "",
        content: article.content,
        featuredImage: article.featuredImage || "",
        categoryId: article.categoryId.toString(),
        isFeatured: article.isFeatured,
        status: article.status,
        redirectUrl: (article as any).redirectUrl || "",
        videoUrl: (article as any).videoUrl || "",
        galleryImages: gallery,
        attachmentUrl: (article as any).attachmentUrl || "",
        attachmentName: (article as any).attachmentName || "",
        cityId: (article as any).cityId ? (article as any).cityId.toString() : "",
      });
    }
  }, [article]);

  const generateSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'title' && !isEdit ? { slug: generateSlug(value) } : {}),
      ...(name === 'categoryId' ? { cityId: "" } : {}),
    }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_BASE}/admin/cloudinary/image`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("informe_access_token") || ""}` },
          body: fd,
        });
        if (!res.ok) throw new Error("Erro ao enviar imagem");
        const data = await res.json();
        newUrls.push(data.url);
      }
      setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newUrls] }));
      toast({ title: `${newUrls.length} imagem(ns) adicionada(s)` });
    } catch {
      toast({ title: "Erro ao enviar imagens", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: fd,
      });
      if (!res.ok) throw new Error("Erro ao enviar arquivo");
      const data = await res.json();
      setFormData(prev => ({ ...prev, attachmentUrl: data.url, attachmentName: file.name }));
      toast({ title: "Arquivo anexado!" });
    } catch {
      toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        cityId: formData.cityId ? Number(formData.cityId) : null,
        galleryImages: formData.galleryImages.length > 0 ? JSON.stringify(formData.galleryImages) : "",
        redirectUrl: formData.redirectUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        attachmentUrl: formData.attachmentUrl || undefined,
        attachmentName: formData.attachmentName || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast({ title: "Notícia atualizada!" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "Notícia criada!" });
      }
      setLocation("/admin/noticias");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
  };

  const getImageSrc = (url: string) => url.startsWith('/uploads') ? `/api${url}` : url;

  return (
    <AdminLayout>
      <div className="mb-5 sm:mb-8 flex items-center gap-3 sm:gap-4">
        <Link href="/admin/noticias" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{isEdit ? 'Editar Notícia' : 'Nova Notícia'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        <div className="w-full lg:w-2/3 flex flex-col gap-5 sm:gap-6">
          <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título da Notícia</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-lg font-semibold" placeholder="Ex: Nova lei é aprovada na câmara..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Resumo / Subtítulo</label>
              <textarea name="summary" value={formData.summary} onChange={handleChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary resize-none text-gray-600" placeholder="Breve resumo que aparecerá nos cards..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo</label>
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
              />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sm:gap-6">
            <h3 className="font-black text-lg border-b border-gray-100 pb-3 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" /> Links e Mídia
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Link de Redirecionamento</label>
              <input name="redirectUrl" value={formData.redirectUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-sm" placeholder="https://... (link externo, edital, site, etc.)" />
              <p className="text-xs text-gray-500 mt-1">Se preenchido, ao clicar na notícia o leitor será redirecionado para este link.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Vídeo
              </label>
              <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-sm mb-2" placeholder="https://www.instagram.com/reel/... ou https://youtube.com/watch?v=..." />
              <p className="text-xs text-gray-500 mb-3">Cole um link (Instagram, YouTube) ou faça upload de um vídeo direto:</p>
              <CloudinaryUpload
                type="video"
                onSuccess={(data) => setFormData(prev => ({ ...prev, videoUrl: data.url }))}
                maxSize={100}
              />
              {formData.videoUrl && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <Video className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700 truncate flex-1">{formData.videoUrl}</p>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, videoUrl: "" }))} className="p-1 hover:bg-red-50 rounded">
                    <X className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" /> Anexo (Edital, PDF, Documento)
              </label>
              {formData.attachmentUrl ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{formData.attachmentName || "Arquivo anexado"}</p>
                    <p className="text-xs text-gray-500 truncate">{formData.attachmentUrl}</p>
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: "", attachmentName: "" }))} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-colors">
                  {uploadingAttachment ? (
                    <span className="text-sm text-primary font-bold animate-pulse">Enviando...</span>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-sm font-bold text-gray-600">Clique para anexar um arquivo</span>
                      <span className="text-xs text-gray-400">PDF, DOC, XLS (máx. 10MB)</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleAttachmentUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sm:gap-6">
            <h3 className="font-black text-lg border-b border-gray-100 pb-3 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" /> Galeria de Imagens
            </h3>
            <p className="text-sm text-gray-500 -mt-3">Imagens adicionais que aparecem no corpo da notícia (além da imagem de capa).</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.galleryImages.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-video border border-gray-200 group">
                  <img src={getImageSrc(img)} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{i + 1}</div>
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-colors">
                {uploadingGallery ? (
                  <span className="text-xs text-primary font-bold animate-pulse">Enviando...</span>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-gray-500">Adicionar</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-5 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sm:gap-6">
            <h3 className="font-black text-lg border-b border-gray-100 pb-3">Publicação</h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-white font-semibold">
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
              <select required name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-white font-semibold">
                <option value="" disabled>Selecione uma categoria...</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {filteredCities.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cidade (opcional)</label>
                <select name="cityId" value={formData.cityId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-white font-semibold">
                  <option value="">Nenhuma cidade</option>
                  {filteredCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug da URL</label>
              <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 font-mono text-xs" />
            </div>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 text-primary rounded focus:ring-primary" />
              <div>
                <span className="block font-bold text-gray-900 text-sm">Destaque na Página Inicial</span>
                <span className="text-xs text-gray-500">Exibir no carrossel principal</span>
              </div>
            </label>

            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2">
              <Save className="h-5 w-5" /> {isEdit ? 'Salvar Alterações' : 'Publicar Notícia'}
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sm:gap-6">
            <h3 className="font-black text-lg border-b border-gray-100 pb-3">Imagem de Capa</h3>
            <CloudinaryUpload
              type="image"
              onSuccess={(data) => setFormData(prev => ({ ...prev, featuredImage: data.url }))}
            />
            {formData.featuredImage && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Prévia:</p>
                <img src={formData.featuredImage} alt="featured" className="w-full h-auto max-h-[200px] object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
