import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecretKey() {
  const secret = process.env.JWT_SECRET || 'fallback-dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Allow API auth route
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, getSecretKey());
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin-token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
