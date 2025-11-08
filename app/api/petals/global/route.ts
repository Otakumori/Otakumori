import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: GlobalPetals model doesn't exist in schema - add it or use different approach
    // For now, return inactive status
    return NextResponse.json({ active: false });
  } catch (error) {
    console.error('Error fetching global petals:', error);
    return NextResponse.json({ active: false });
  }
}
