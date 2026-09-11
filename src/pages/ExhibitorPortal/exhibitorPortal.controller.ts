import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useExhibitorAuth } from "@/hooks/useExhibitorAuth";
import { useExhibitorAuthService } from "@/service/exhibitorAuth.service";

const loginSchema = z.object({
  email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const firstAccessSchema = z.object({
  email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  code: z.string().trim().length(6, "O código tem 6 dígitos"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type FirstAccessFormValues = z.infer<typeof firstAccessSchema>;

export const useExhibitorPortalController = () => {
  const [mode, setMode] = useState<"first-access" | "login">("first-access");
  const [loading, setLoading] = useState(false);
  const { signIn } = useExhibitorAuth();
  const { login, firstAccess } = useExhibitorAuthService();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const firstAccessForm = useForm<FirstAccessFormValues>({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { email: "", code: "", password: "" },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await login(data);
      if (!result) return;
      signIn(result);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccess = async (data: FirstAccessFormValues) => {
    setLoading(true);
    try {
      const result = await firstAccess(data);
      if (!result) return;
      signIn(result);
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    loading,
    loginForm,
    firstAccessForm,
    handleLogin,
    handleFirstAccess,
  };
};
