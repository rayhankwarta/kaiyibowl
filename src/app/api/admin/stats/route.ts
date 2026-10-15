import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
