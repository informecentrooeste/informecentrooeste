import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { X } from "lucide-react";

type LightboxContextType = {
  open: (src: string, alt?: string) => void;
};

const LightboxContext = createContext<LightboxContextType>({ open: () => {} });

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);

  const open = useCallback((src: string, alt = "") => {
    setImage({ src, alt });
  }, []);

  const close = useCallback(() => {
    setImage(null);
  }, []);

  useEffect(() => {
    if (!image) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [image, close]);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {image && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
          >
            <X className="h-7 w-7" />
          </button>
          <img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </LightboxContext.Provider>
  );
}
