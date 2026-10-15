import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { Product } from '@/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(
      { success: true, data: products },
      { headers: NO_CACHE_HEADERS }
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
    const { name, description, price, image, category, toppings, isPopular } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Nama dessert, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Harga harus berupa nominal angka valid' },
        { status: 400 }
      );
    }

    const validCategories = ['Cold', 'Hot', 'Special'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Kategori harus Cold, Hot, atau Special' },
        { status: 400 }
      );
    }

    const toppingsList = Array.isArray(toppings)
      ? toppings
      : typeof toppings === 'string'
      ? toppings
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    const defaultImage =
      category === 'Hot'
        ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80';

    const newProduct = createProduct({
      name: name.trim(),
      description: (description || '').trim(),
      price: numericPrice,
      image: (image || '').trim() || defaultImage,
      category,
      toppings: toppingsList.length > 0 ? toppingsList : ['QQ Ball', 'Fresh Milk'],
      isPopular: Boolean(isPopular),
    });

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
