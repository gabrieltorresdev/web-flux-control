import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <div className="relative h-36 lg:h-auto lg:w-1/2 bg-white overflow-hidden lg:bg-gradient-to-br lg:from-primary/90 lg:to-primary/40">
        {/* Forma geométrica com gradiente */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-gradient-to-br from-primary/90 to-primary/40 rounded-[100%]" />
        </div>

        <div className="absolute inset-0 bg-pattern opacity-10 hidden lg:block" />
        <div className="relative z-10 flex flex-col justify-center h-full px-4 lg:px-16 w-full">
          <div className="flex items-center gap-2 justify-center lg:justify-start mb-4 lg:mb-16">
            <Image
              src="/logo.png"
              alt="Flux Control Logo"
              width={32}
              height={32}
              className="w-8 h-8 lg:w-10 lg:h-10"
            />
            <span className="text-white text-xl lg:text-2xl font-bold">
              Flux Control
            </span>
          </div>
          <div className="space-y-6 hidden lg:block">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Transforme sua <br />
              <span className="text-primary-foreground">gestão financeira</span>
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Uma plataforma moderna e intuitiva para você ter total controle
              das suas finanças pessoais
            </p>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white text-3xl font-bold">10k+</h3>
                <p className="text-white/70 text-sm">Usuários ativos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white text-3xl font-bold">99%</h3>
                <p className="text-white/70 text-sm">Satisfação xD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 px-4 py-6 sm:px-16 flex items-center justify-center bg-white relative rounded-t-3xl lg:rounded-none -mt-6">
        <div className="w-full max-w-[400px]">
          <LoginForm />
          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-xs lg:text-sm text-gray-500">
              Precisa de ajuda?{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
