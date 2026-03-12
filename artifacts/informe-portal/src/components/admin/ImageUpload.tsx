import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/image-url";
import { getAuthHeaders } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  shape?: "square" | "circle";
  previewSize?: string;
}

export function ImageUpload({ value, onChange, label = "Imagem", hint, shape = "square", previewSize = "w-20 h-20" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao enviar imagem");
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleUpload(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />

      {value ? (
        <div className="flex items-center gap-4">
          <div className={`${previewSize} ${shape === "circle" ? "rounded-full" : "rounded-lg"} overflow-hidden border-2 border-primary/20 relative group`}>
            <img src={getImageUrl(value)} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ""; }} />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-primary hover:underline font-semibold"
          >
            Trocar imagem
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-sm text-gray-500">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Clique ou arraste uma imagem aqui</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP ou GIF (máx. 5MB)</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
