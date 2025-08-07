import { ControlledInput } from "@/components/ControlledInput";
import { ControlledSelect } from "@/components/ControlledSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Visitor, VisitorEdit } from "@/interfaces/visitors";
import { useFairService } from "@/service/fair.service";
import { useVisitorsService } from "@/service/visitors.service";
import { Loader2, PencilLine } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export interface EditVisitorModalProps {
  open: boolean;
  onOpenChange: () => void;
  visitor: Visitor;
  reload?: () => void;
}

export const EditVisitorModal = ({ ...props }: EditVisitorModalProps) => {
  const { fairs, getFairs } = useFairService();
  const { updateVisitor, loading } = useVisitorsService();
  const form = useForm<Partial<VisitorEdit>>({
    defaultValues: {
      name: "",
      fairIds: [""],
    },
  });

  const handleSubmitEdit = async (data: Partial<VisitorEdit>) => {
    console.log("data", data);
    const result = await updateVisitor({
      ...data,
      fairIds: [
        (Array.isArray(data.fairIds) ? data.fairIds[0] : data.fairIds) ||
          props.visitor.fair_visitor?.[0]?.id ||
          "",
      ],
      registrationCode: props.visitor.registrationCode,
    });
    if (!result) return;
    props.reload?.();
    props.onOpenChange();
  };

  useEffect(() => {
    getFairs();
  }, []);

  useEffect(() => {
    form.reset({
      name: props.visitor.name,
      fairIds: [props.visitor.fair_visitor?.[0]?.id || ""],
    });
  }, [props.visitor, form]);

  return (
    <Dialog {...props}>
      <DialogContent className="">
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(handleSubmitEdit)}
        >
          <ControlledInput
            control={form.control}
            name="name"
            placeholder="Nome completo"
            defaultValue={props.visitor.name}
            label="Nome"
          />

          <ControlledSelect
            options={fairs.map((fair) => ({
              value: fair.id,
              label: fair.name,
            }))}
            control={form.control}
            name="fairIds"
            label="Feira"
            placeholder="Selecione uma feira"
          />

          <div className="w-full flex justify-end items-center">
            <Button
              type="submit"
              variant="ghost"
              className="w-fit px-6 flex items-center rounded-full bg-blue-900 text-white"
            >
              {loading ? (
                <span className="animate-spin mr-2">
                  <Loader2 size={13} className="animate-spin" />
                </span>
              ) : (
                <PencilLine size={13} />
              )}
              Editar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
