"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { InlineAlert } from "@/components/ui/inline-alert";
import { FcGoogle } from "react-icons/fc";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("keycloak", {
        username: data.email.trim(),
        password: data.password,
        redirect: false,
      });

      if (result?.error === "CredentialsSignin") {
        setError(
          "Email/username ou senha incorretos. Por favor, verifique suas credenciais e tente novamente."
        );
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        setError(
          "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente."
        );
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Unexpected login error:", error);
      setError(
        "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
      );
      setIsLoading(false);
    }
  };

  const handleKeycloakSignIn = () => {
    signIn("keycloak", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 lg:mb-8 text-center lg:text-left">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
          Bem-vindo de volta
        </h2>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Entre com suas credenciais para acessar
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
          {error && <InlineAlert message={error} />}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Email ou username"
                    className="w-full h-12 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="w-full h-12 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 pr-12"
                      disabled={isLoading}
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          <div className="space-y-6 pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-primary-500">
                  ou continue com
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 border-primary-100 hover:bg-primary-50 text-primary-700 transition-colors opacity-50 cursor-not-allowed"
              onClick={handleKeycloakSignIn}
              disabled={true}
              title="Login com SSO ainda não está disponível"
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              Entrar com SSO
            </Button>

            <p className="text-center text-base text-primary-600">
              Ainda não tem uma conta?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-700 hover:text-primary-800 transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
