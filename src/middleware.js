import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;
  const payload = sessionCookie ? await verifyToken(sessionCookie) : null;

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
      return NextResponse.redirect(new URL('/member/dashboard', req.url));
    }
    if (payload.role === 'Staf') {
      return NextResponse.redirect(new URL('/staff/dashboard', req.url));
    }
  }

  if (isMemberRoute && payload.role !== 'Member') {
    return NextResponse.redirect(new URL('/staff/dashboard', req.url));
  }

  if (isStaffRoute && payload.role !== 'Staf') {
    return NextResponse.redirect(new URL('/member/dashboard', req.url));
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