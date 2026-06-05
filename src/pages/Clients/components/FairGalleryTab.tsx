import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useFairImages,
  useUploadFairImages,
  useDeleteFairImage,
} from "@/hooks/useFinance";
import {
  ImagePlus,
  Upload,
  Trash2,
  X,
  AlertTriangle,
  Images,
} from "lucide-react";

interface FairGalleryTabProps {
  fairId?: string;
}

export function FairGalleryTab({ fairId }: FairGalleryTabProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useFairImages(fairId);
  const uploadMutation = useUploadFairImages();
  const deleteMutation = useDeleteFairImage();

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPendingFiles((prev) => [...prev, ...valid].slice(0, 10));
  };

  const removeFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleUpload = () => {
    if (!fairId || pendingFiles.length === 0) return;
    uploadMutation.mutate(
      { fairId, files: pendingFiles, caption },
      {
        onSuccess: () => {
          setPendingFiles([]);
          setCaption("");
          if (fileRef.current) fileRef.current.value = "";
        },
      }
    );
  };

  const handleDelete = (imageId: string) => {
    if (!fairId) return;
    setDeletingId(imageId);
    deleteMutation.mutate(
      { imageId, fairId },
      { onSettled: () => setDeletingId(null) }
    );
  };

  if (!fairId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <AlertTriangle className="w-10 h-10 opacity-30" />
        <p className="font-medium text-slate-500">Selecione uma feira para ver a galeria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Área de upload */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5 bg-white dark:bg-white/3">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Enviar imagens para a feira
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Imagens disponíveis no site e nos e-mails de marketing.
          </p>
        </div>

        {/* Zona de drag-and-drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
            ${isDragging
              ? "border-[#00aacd] bg-[#00aacd]/5"
              : "border-slate-200 dark:border-white/15 hover:border-[#00aacd]/50 hover:bg-slate-50 dark:hover:bg-white/3"
            }
          `}
        >
          <ImagePlus className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div className="text-center">
            <p className="text-sm font-bold text-slate-500">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Até 10 imagens por envio · JPG, PNG, WEBP
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Preview + legenda + botão enviar */}
        {pendingFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((f, i) => (
                <div key={i} className="relative group w-16 h-16 shrink-0">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Legenda (opcional)
                </Label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Stand principal — ExpoMultimix 2026"
                  onKeyDown={(e) => e.key === "Enter" && handleUpload()}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white font-bold shrink-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending
                  ? "Enviando..."
                  : `Enviar ${pendingFiles.length} imagem${pendingFiles.length > 1 ? "ns" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Galeria */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Imagens da feira
            {images.length > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 rounded-full px-2 py-0.5 normal-case">
                {images.length} imagem{images.length > 1 ? "ns" : ""}
              </span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Images className="w-12 h-12 opacity-20" />
            <p className="font-medium text-slate-500">Nenhuma imagem enviada para esta feira ainda.</p>
            <p className="text-sm">Arraste imagens para a área acima para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/3"
              >
                <img
                  src={img.url}
                  alt={img.caption ?? "Imagem da feira"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all flex flex-col justify-between p-2.5">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.caption && (
                      <p className="text-white/90 text-[10px] leading-tight line-clamp-2 drop-shadow">
                        {img.caption}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg"
                    >
                      {deletingId === img.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
