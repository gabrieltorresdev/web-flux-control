import { verifySession } from "@/app/actions/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { isAuthenticated, error } = await verifySession();
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname === "/";

  // Se estiver autenticado e tentar acessar rotas de auth, redireciona para o dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se não estiver autenticado ou tiver erro de refresh token, redireciona para o login
  if (
    (!isAuthenticated || error === "RefreshAccessTokenError") &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
