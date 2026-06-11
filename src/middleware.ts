// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface JWTPayload {
  email: string;
  role: string; // Ubah ke string biasa agar lebih fleksibel saat dicek
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

  const userRole = payload.role.toLowerCase();

  if (isAuthRoute) {
    if (userRole === 'member') {
      return NextResponse.redirect(new URL('/member', req.url));
    }
    if (userRole === 'staf' || userRole === 'staff') {
      return NextResponse.redirect(new URL('/staff', req.url));
    }
  }

  // Cross-role protection
  if (isMemberRoute && userRole !== 'member') {
    return NextResponse.redirect(new URL('/staff', req.url));
  }

  if (isStaffRoute && (userRole !== 'staf' && userRole !== 'staff')) {
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