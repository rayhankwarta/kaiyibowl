import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByPhoneOrId } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Masukkan ID Pesanan atau Nomor WhatsApp' },
        { status: 400 }
      );
    }

    const orders = getOrdersByPhoneOrId(query);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        count: orders.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
