import { NextRequest, NextResponse } from 'next/server';
import { updateBatch, deleteBatch, getBatchById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = getBatchById(id);
  if (!batch) {
    return NextResponse.json(
      { success: false, error: 'Batch tidak ditemukan' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: batch });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateBatch(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Batch tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteBatch(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Batch tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Batch berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
