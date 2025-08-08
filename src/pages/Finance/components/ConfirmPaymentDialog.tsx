import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2, Upload } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const confirmPaymentSchema = z.object({
  paidAt: z.date({
    required_error: "Data do pagamento é obrigatória",
  }),
  proofFile: z.instanceof(File).optional(),
});

type ConfirmPaymentForm = z.infer<typeof confirmPaymentSchema>;

interface ConfirmPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paidAt: string, proofUrl?: string) => void;
  isLoading?: boolean;
}

export default function ConfirmPaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmPaymentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ConfirmPaymentForm>({
    resolver: zodResolver(confirmPaymentSchema),
    defaultValues: {
      paidAt: new Date(),
    },
  });

  const handleSubmit = async (data: ConfirmPaymentForm) => {
    try {
      let proofUrl: string | undefined;

      // Se há um arquivo, fazer upload (implementar depois)
      if (selectedFile) {
        // TODO: Implementar upload do comprovante
        // proofUrl = await uploadFile(selectedFile);
        console.log(
          "Upload de arquivo não implementado ainda:",
          selectedFile.name
        );
      }

      const paidAtISO = dayjs(data.paidAt).format("YYYY-MM-DD");
      onConfirm(paidAtISO, proofUrl);
    } catch (error) {
      console.error("Erro ao processar confirmação:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirmar Pagamento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Data do Pagamento */}
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-gray-900 dark:text-white">
                    Data do Pagamento *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("DD/MM/YYYY")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload do Comprovante */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                Comprovante (opcional)
              </label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Upload className="w-4 h-4" />
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
