import { useAuth } from "@/hooks/useAuth";
import type { ILoginFormPost } from "@/interfaces/logint";
import { useAuthService } from "@/service/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
  remember: z.boolean().optional(),
});

export const useLoginController = () => {
  const { create, loading } = useAuthService();
  const form = useForm<ILoginFormPost>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem("remembered_email") || "",
      password: "",
      remember: localStorage.getItem("remember_me") === "true",
    }
  });
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const handleSubmit = async (data: ILoginFormPost) => {
    const { email, password, remember } = data;
    
    if (remember) {
      localStorage.setItem("remembered_email", email);
      localStorage.setItem("remember_me", "true");
    } else {
      localStorage.removeItem("remembered_email");
      localStorage.setItem("remember_me", "false");
    }

    const result = await create({ email, password });
    if (!result) return;
    navigate("/");
    signIn(result);
  };

  return {
    handleSubmit,
    form,
    loading,
  };
};
