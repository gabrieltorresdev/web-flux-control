import { auth, signOut } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname === "/";

  // Se estiver autenticado e tentar acessar rotas de auth, redireciona para o dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se não estiver autenticado ou tiver erro de refresh token, redireciona para o login
  if (
    (!session || session.error === "RefreshAccessTokenError") &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.endsWith("/"))
  ) {
    // Se houver erro de refresh token, limpa a sessão antes de redirecionar
    if (session?.error === "RefreshAccessTokenError") {
      await signOut({ redirect: false });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
