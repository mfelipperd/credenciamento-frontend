import { ControlledInput } from "@/components/ControlledInput";
import { useLoginController } from "../../login.controller";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";

export const LoginForm = () => {
  const controller = useLoginController();
  return (
    <form
      action=""
      className="w-full"
      onSubmit={controller.form.handleSubmit(controller.handleSubmit)}
    >
      <ControlledInput
        control={controller.form.control}
        name="email"
        placeholder="Digite seu Email"
      />
      <ControlledInput
        control={controller.form.control}
        name="password"
        placeholder="Digite sua Senha"
        className="w-full"
        type="password"
      />
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          className="bg-pink-600 rounded-full w-[80%] hover:bg-pink-700 text-white"
        >
          {controller.loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogIn />
          )}
          Entrar
        </Button>
      </div>
    </form>
  );
};
