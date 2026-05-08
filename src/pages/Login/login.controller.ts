import { useAuth } from "@/hooks/useAuth";
import type { ILoginFormPost } from "@/interfaces/logint";
import { useAuthService } from "@/service/auth.service";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const useLoginController = () => {
  const { create, loading } = useAuthService();
  const form = useForm<ILoginFormPost>({
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
