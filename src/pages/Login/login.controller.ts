import type { ILoginFormPost } from "@/interfaces/logint";
import { useAuthService } from "@/service/auth.service";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const { create } = useAuthService();
  const form = useForm<ILoginFormPost>();
  const navigate = useNavigate();
  const handleSubmit = async (data: ILoginFormPost) => {
    const result = create(data);
    if (!result) return;
    navigate("/");
  };

  return {
    handleSubmit,
    form,
  };
};
