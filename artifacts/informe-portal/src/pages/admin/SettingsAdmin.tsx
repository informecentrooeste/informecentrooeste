import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-admin";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SETTING_LABELS: Record<string, string> = {
  site_name: "Nome do Site",
  site_description: "Descrição do Site",
  contact_email: "E-mail de Contato",
  contact_phone: "Telefone de Contato",
  whatsapp_number: "WhatsApp",
  facebook_url: "Facebook URL",
  instagram_url: "Instagram URL",
  youtube_url: "YouTube URL",
  twitter_url: "Twitter/X URL",
  meta_title: "Meta Title (SEO)",
  meta_description: "Meta Description (SEO)",
  google_analytics_id: "Google Analytics ID",
  footer_text: "Texto do Rodapé",
};

export default function SettingsAdmin() {
  const { data: settings, isLoading, isError } = useAdminSettings();
  const updateMut = useUpdateSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setForm(settings as Record<string, string>);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({ data: form });
      toast({ title: "Configurações salvas!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addSetting = () => {
    const key = prompt("Nome da chave (ex: nova_configuracao):");
    if (key && key.trim()) {
      setForm(prev => ({ ...prev, [key.trim()]: "" }));
    }
  };

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar configurações. Tente recarregar a página.</div></AdminLayout>;

  const keys = Object.keys(form);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Configurações</h1>
          <p className="text-gray-500 text-sm">Configurações gerais do portal.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            {keys.map(key => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {SETTING_LABELS[key] || key}
                </label>
                {key.includes("description") || key.includes("text") ? (
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    rows={3}
                    value={form[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {keys.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhuma configuração encontrada.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={updateMut.isPending} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> Salvar Configurações
          </button>
          <button type="button" onClick={addSetting} className="border px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">
            + Nova Configuração
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
