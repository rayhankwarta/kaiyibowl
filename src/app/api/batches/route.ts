import { NextRequest, NextResponse } from 'next/server';
import { getBatches, createBatch } from '@/lib/db';

export async function GET() {
  try {
    const batches = getBatches();
    return NextResponse.json({ success: true, data: batches });
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
    const { name, deliveryDate, orderDeadline, quota, isOpen, notes } = body;

    if (!name || !deliveryDate || !orderDeadline || !quota) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const newBatch = createBatch({
      name,
      deliveryDate,
      orderDeadline,
      quota: Number(quota),
      isOpen: isOpen ?? true,
      notes: notes || '',
    });

    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
