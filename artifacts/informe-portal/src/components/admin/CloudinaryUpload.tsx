import { useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

interface CloudinaryUploadProps {
  type: "image" | "video";
  onSuccess: (data: { url: string; publicId: string; width?: number; height?: number; duration?: number }) => void;
  accept?: string;
  maxSize?: number;
}

export function CloudinaryUpload({ type, onSuccess, accept, maxSize = 50 }: CloudinaryUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const acceptType = accept || (type === "video" ? "video/*" : "image/*");
  const endpoint = type === "image" ? "/api/admin/cloudinary/image" : "/api/admin/cloudinary/video";

  const handleFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({ title: `Arquivo muito grande. Máximo: ${maxSize}MB`, variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setPreview(data.url);
          onSuccess(data);
          toast({ title: type === "image" ? "Imagem enviada!" : "Vídeo enviado!" });
        } else {
          const error = JSON.parse(xhr.responseText);
          toast({ title: error.error, variant: "destructive" });
        }
        setUploading(false);
        setProgress(0);
      });

      xhr.addEventListener("error", () => {
        toast({ title: "Erro no upload", variant: "destructive" });
        setUploading(false);
      });

      xhr.open("POST", endpoint);
      xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("informe_access_token") || ""}`);
      xhr.send(formData);
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
        <input
          type="file"
          accept={acceptType}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={uploading}
          className="hidden"
        />
        <Upload className="h-5 w-5 text-gray-400" />
        <div className="text-sm font-semibold text-gray-600">
          {uploading ? `Enviando... ${progress}%` : `Clique para enviar ${type === "video" ? "vídeo" : "imagem"}`}
        </div>
      </label>

      {preview && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          {type === "image" ? (
            <img src={preview} alt="preview" className="w-full h-auto max-h-[200px] object-cover" />
          ) : (
            <video src={preview} className="w-full h-auto max-h-[200px] object-cover" />
          )}
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
