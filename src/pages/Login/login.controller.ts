import { useAuth } from "@/auth/AuthProvider";
import type { ILoginFormPost } from "@/interfaces/logint";
import { useAuthService } from "@/service/auth.service";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const useLoginController = () => {
  const { create, loading } = useAuthService();
  const form = useForm<ILoginFormPost>();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const handleSubmit = async (data: ILoginFormPost) => {
    const result = await create(data);
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
