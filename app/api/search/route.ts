/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Mock search results
    const mockProducts = [
      {
        id: '1',
        name: 'Anime Figure',
        description: 'Beautiful anime figure',
        price: 29.99,
        image: '/images/products/figure1.jpg',
      },
      {
        id: '2',
        name: 'Cosplay Costume',
        description: 'High quality cosplay costume',
        price: 89.99,
        image: '/images/products/cosplay1.jpg',
      },
    ];

    const results = mockProducts.filter(
      product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
