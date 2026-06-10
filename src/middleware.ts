import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// 1. Definisikan interface untuk payload token agar role-based access aman
interface JWTPayload {
  email: string;
  role: 'Member' | 'Staf';
  // tambahkan field lain jika ada dalam token Anda
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const sessionCookie = req.cookies.get('session')?.value;
  
  const payload = sessionCookie ? await verifyToken(sessionCookie) as JWTPayload : null;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isMemberRoute = pathname.startsWith('/member');
  const isStaffRoute = pathname.startsWith('/staff');
  const isProfileRoute = pathname.startsWith('/profile');

  if (!payload) {
    if (isMemberRoute || isStaffRoute || isProfileRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (payload.role === 'Member') {
      return NextResponse.redirect(new URL('/member', req.url));
    }
    if (payload.role === 'Staf') {
      return NextResponse.redirect(new URL('/staff', req.url));
    }
  }

  // Cross-role protection
  if (isMemberRoute && payload.role !== 'Member') {
    return NextResponse.redirect(new URL('/staff', req.url));
  }

  if (isStaffRoute && payload.role !== 'Staf') {
    return NextResponse.redirect(new URL('/member', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register/:path*',
    '/member/:path*',
    '/staff/:path*',
    '/profile/:path*'
  ],
};