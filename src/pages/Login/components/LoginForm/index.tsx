import { ControlledInput } from "@/components/ControlledInput";
import { useLoginController } from "../../login.controller";

export const LoginForm = () => {
  const controller = useLoginController();
  return (
    <div>
      <ControlledInput control={controller.form.control} name="email" />
      <ControlledInput control={controller.form.control} name="password" />
    </div>
  );
};
