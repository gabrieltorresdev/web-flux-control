import { verifySession } from "@/features/auth/actions/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/login", "/register", "/"];
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se não for nem pública nem protegida, permite o acesso
  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Se for uma rota pública, não verifica a sessão para evitar loops
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    const response = await verifySession();

    // Se houver erro de token expirado, redireciona para o login
    if (
      response?.error &&
      ["TokenExpiredError", "RefreshAccessTokenError"].includes(response.error)
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se não estiver autenticado e tentar acessar rota protegida, redireciona para o login
    if (!response?.isAuthenticated && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Em caso de erro na verificação da sessão, redireciona para o login apenas se estiver em uma rota protegida
    console.error("Error verifying session:", error);
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
