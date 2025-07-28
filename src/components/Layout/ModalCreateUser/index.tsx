import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { createUserSchema, type CreateUserInput } from "./schema";
import { Form } from "@/components/ui/form";
import { ControlledInput } from "@/components/ControlledInput";
import { ControlledSelect } from "@/components/ControlledSelect";
import { EUserRole } from "@/enums/user.enum";
import { Button } from "@/components/ui/button";
import { useUserService } from "@/service/user.service";
import { useEffect, useState } from "react";
import { useFairService } from "@/service/fair.service";

export const CreateUserModal = () => {
  const [open, onOpenChange] = useState(false);
  const { createUser, loading } = useUserService();
  const { fairs, getFairs } = useFairService();

  const fairsOptions = fairs.map((fair) => ({
    value: fair.id,
    label: fair.name,
  }));

  const form = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const handleSubmit = async (data: CreateUserInput) => {
    const response = await createUser(data);
    if (!response) {
      form.reset();
    }
  };

  useEffect(() => {
    getFairs();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer">
        <p className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer">
          <PlusIcon size={16} /> Criar Usuário
        </p>
      </DialogTrigger>
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ControlledInput
              control={form.control}
              name="name"
              label="Nome"
              placeholder="Digite o nome do usuário"
            />
            <ControlledInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="Digite o email do usuário"
            />
            <ControlledInput
              control={form.control}
              name="password"
              label="Senha"
              type="password"
              placeholder="Digite a senha do usuário"
            />
            <ControlledSelect
              control={form.control}
              name="role"
              label="Cargo"
              options={Object.entries(EUserRole).map(([key, value]) => ({
                value: value.toLowerCase(),
                label: key.charAt(0).toUpperCase() + key.slice(1),
              }))}
            />

            <ControlledSelect
              control={form.control}
              name="fairId"
              label="Feira"
              options={fairsOptions}
            />
            <Button type="submit" className="mt-4">
              {loading ? <Loader2 className="animate-spin" /> : <PlusIcon />}
              Criar Usuário
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
