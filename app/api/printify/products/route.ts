import { NextResponse } from "next/server";
import { getProducts } from "@/app/lib/printify/client";
import { PrintifyError } from "@/app/lib/printify/schema";

export const revalidate = 0;

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Printify API error:", error);
    const errorResponse = PrintifyError.parse({ 
      error: "Internal server error", 
      detail: error instanceof Error ? error.message : "Unknown error" 
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}