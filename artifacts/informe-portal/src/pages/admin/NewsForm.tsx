import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminNews, useCreateNews, useUpdateNews, useAdminCategories, useUploadFile } from "@/hooks/use-admin";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    isFeatured: false,
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED"
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        summary: article.summary || "",
        content: article.content,
        featuredImage: article.featuredImage || "",
        categoryId: article.categoryId.toString(),
        isFeatured: article.isFeatured,
        status: article.status
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
      ...(name === 'title' && !isEdit ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({ data: { file } });
      setFormData(prev => ({ ...prev, featuredImage: res.url }));
      toast({ title: "Imagem carregada com sucesso" });
    } catch (err) {
      toast({ title: "Erro ao carregar imagem", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId)
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

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/noticias" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{isEdit ? 'Editar Notícia' : 'Nova Notícia'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título da Notícia</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-lg font-semibold" placeholder="Ex: Nova lei é aprovada na câmara..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Resumo / Subtítulo</label>
              <textarea name="summary" value={formData.summary} onChange={handleChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary resize-none text-gray-600" placeholder="Breve resumo que aparecerá nos cards..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo (HTML/Texto Livre)</label>
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Editor Simples</span>
                </div>
                <textarea 
                  required 
                  name="content" 
                  value={formData.content} 
                  onChange={handleChange} 
                  rows={20} 
                  className="w-full px-4 py-4 border-none focus:ring-0 resize-y font-mono text-sm leading-relaxed" 
                  placeholder="<p>Escreva o conteúdo da notícia aqui...</p>" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <h3 className="font-black text-lg border-b border-gray-100 pb-3">Imagem de Capa</h3>
            
            {formData.featuredImage ? (
              <div className="relative rounded-xl overflow-hidden aspect-video border border-gray-200 group">
                <img src={formData.featuredImage.startsWith('/uploads') ? `/api${formData.featuredImage}` : formData.featuredImage} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform">
                    Trocar Imagem
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-600">Clique para enviar foto</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG máx 2MB</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            )}
            {uploadMutation.isPending && <p className="text-sm text-center text-primary font-bold animate-pulse">Enviando...</p>}
            <input type="text" name="featuredImage" value={formData.featuredImage} onChange={handleChange} placeholder="Ou cole a URL da imagem aqui..." className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-primary focus:border-primary" />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
