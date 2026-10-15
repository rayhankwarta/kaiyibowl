import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: any = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.price !== undefined) {
      const num = Number(body.price);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { success: false, error: 'Harga harus berupa angka valid' },
          { status: 400 }
        );
      }
      updates.price = num;
    }
    if (body.category !== undefined) updates.category = body.category;
    if (body.image !== undefined) updates.image = String(body.image).trim();
    if (body.toppings !== undefined) {
      updates.toppings = Array.isArray(body.toppings)
        ? body.toppings
        : typeof body.toppings === 'string'
        ? body.toppings.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
    }
    if (body.isPopular !== undefined) updates.isPopular = Boolean(body.isPopular);

    const updated = updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { headers: NO_CACHE_HEADERS }
    );
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
    const success = deleteProduct(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Produk berhasil dihapus' },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
