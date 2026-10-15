import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = getOrders({ batchId, status, search });
    return NextResponse.json(
      { success: true, data: orders },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      batchId,
      customerName,
      customerPhone,
      deliveryAddress,
      customerNotes,
      items,
      paymentProofUrl,
    } = body;

    if (!batchId || !customerName || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { success: false, error: 'Mohon lengkapi data pemesan dan alamat' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pilih minimal satu varian dessert' },
        { status: 400 }
      );
    }

    const result = createOrder({
      batchId,
      customerName,
      customerPhone,
      deliveryAddress,
      customerNotes,
      items,
      paymentProofUrl,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
