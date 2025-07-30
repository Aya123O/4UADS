// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle product routes
  if (pathname.startsWith('/products/')) {
    const slug = pathname.split('/products/')[1];
    
    // Verify the product exists
    try {
      const res = await fetch(`https://new.4youad.com/api/products/${slug}`);
      if (!res.ok) {
        return NextResponse.rewrite(new URL('/404', request.url));
      }
    } catch (error) {
      console.error('Product verification failed:', error);
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/products/:path*',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};