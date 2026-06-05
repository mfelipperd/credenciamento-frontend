import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useClientImages,
  useUploadClientImages,
  useDeleteClientImage,
} from "@/hooks/useFinance";
import {
  ImagePlus,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  Images,
} from "lucide-react";
import type { Client } from "@/interfaces/finance";

interface ClientImagesModalProps {
  client: Client | null;
  open: boolean;
  fairId?: string;
  onClose: () => void;
}

export function ClientImagesModal({
  client,
  open,
  fairId,
  onClose,
}: ClientImagesModalProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useClientImages(
    client?.id ?? "",
    fairId
  );
  const uploadMutation = useUploadClientImages();
  const deleteMutation = useDeleteClientImage();

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPendingFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 10); // máx 10
    });
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
    if (!client || !fairId || pendingFiles.length === 0) return;
    uploadMutation.mutate(
      { clientId: client.id, fairId, files: pendingFiles, caption },
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
    if (!client) return;
    setDeletingId(imageId);
    deleteMutation.mutate(
      { imageId, clientId: client.id },
      { onSettled: () => setDeletingId(null) }
    );
  };

  const handleClose = () => {
    setPendingFiles([]);
    setCaption("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tighter flex items-center gap-2">
            <Images className="w-5 h-5 text-[#00aacd]" />
            Fotos — {client?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto flex-1 pr-1">
          {/* Upload zone */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enviar fotos
            </p>

            {!fairId && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Selecione uma feira para enviar fotos.
              </div>
            )}

            {/* Área de drag-and-drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`
                flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
                ${isDragging
                  ? "border-[#00aacd] bg-[#00aacd]/5"
                  : "border-slate-200 dark:border-white/15 hover:border-[#00aacd]/50 hover:bg-slate-50 dark:hover:bg-white/3"
                }
                ${!fairId ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              <ImagePlus className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">
                  Arraste fotos aqui ou clique para selecionar
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Até 10 imagens por vez · JPG, PNG, WEBP
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

            {/* Preview dos arquivos selecionados */}
            {pendingFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="relative group w-16 h-16">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-white/10"
                      />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                      Legenda (opcional)
                    </Label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Ex: Stand ExpoMultimix 2026"
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!fairId || uploadMutation.isPending}
                    className="bg-[#00aacd] hover:bg-[#00aacd]/90 text-white font-bold shrink-0"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending
                      ? "Enviando..."
                      : `Enviar ${pendingFiles.length} foto${pendingFiles.length > 1 ? "s" : ""}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Galeria */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fotos do expositor
                {fairId && " nesta feira"}
              </p>
              {images.length > 0 && (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 rounded-full px-2 py-0.5">
                  {images.length} foto{images.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300 dark:text-slate-600">
                <Images className="w-10 h-10" />
                <p className="text-sm text-slate-400">Nenhuma foto enviada ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/3"
                  >
                    <img
                      src={img.url}
                      alt={img.caption ?? "Foto do expositor"}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay com info + delete */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col justify-between p-2">
                      {img.caption && (
                        <p className="text-white text-[10px] font-medium leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                          {img.caption}
                        </p>
                      )}
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(img.id)}
                          disabled={deletingId === img.id}
                          className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          {deletingId === img.id ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/10">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
