import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'Login admin berhasil',
        token: 'kaiyi-authenticated-session',
      });

      // Set cookie for session persistence
      response.cookies.set('kaiyi_admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Password admin salah' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('kaiyi_admin_auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete('kaiyi_admin_auth');
  return response;
}
