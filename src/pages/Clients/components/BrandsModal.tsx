import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddBrand, useDeleteBrand } from "@/hooks/useFinance";
import { Trash2, ImagePlus } from "lucide-react";
import type { Client, Brand } from "@/interfaces/finance";

interface BrandsModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

export function BrandsModal({ client, open, onClose }: BrandsModalProps) {
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addBrandMutation = useAddBrand();
  const deleteBrandMutation = useDeleteBrand();

  const brands: Brand[] = client?.brands ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newFile || !client) return;
    addBrandMutation.mutate(
      { clientId: client.id, name: newName, logo: newFile },
      {
        onSuccess: () => {
          setNewName("");
          setNewFile(null);
          setPreview(null);
          if (fileRef.current) fileRef.current.value = "";
        },
      }
    );
  };

  const handleDelete = (brandId: string) => {
    setDeletingId(brandId);
    deleteBrandMutation.mutate(brandId, {
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tighter">
            Marcas — {client?.name}
          </DialogTitle>
        </DialogHeader>

        {/* Formulário de adição */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Adicionar marca
          </p>
          <div className="flex gap-3 items-end">
            {/* Preview clicável */}
            <div
              className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#00aacd] transition-colors overflow-hidden shrink-0"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-contain"
                  alt="preview"
                />
              ) : (
                <ImagePlus className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex-1 space-y-1">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nome *
              </Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Linha Premium"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || !newFile || addBrandMutation.isPending}
              className="shrink-0 bg-[#00aacd] hover:bg-[#00aacd]/90 text-white font-bold"
            >
              {addBrandMutation.isPending ? "..." : "+ Adicionar"}
            </Button>
          </div>
        </div>

        {/* Lista de marcas */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-sm text-center text-slate-400 py-6">
              Nenhuma marca cadastrada ainda.
            </p>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-12 h-12 object-contain rounded-lg border bg-white p-1 shrink-0"
                />
                <span className="flex-1 font-medium text-sm text-slate-800 dark:text-slate-200">
                  {brand.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={deletingId === brand.id}
                  onClick={() => handleDelete(brand.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
