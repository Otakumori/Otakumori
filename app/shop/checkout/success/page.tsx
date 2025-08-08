'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the success page is loaded
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-pink-500" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">Order Confirmed!</h1>
          <p className="mb-8 text-pink-200">
            Thank you for your purchase. We've sent a confirmation email with your order details.
            You can track your order status in your account dashboard.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/shop">
              <Button className="w-full bg-pink-500 hover:bg-pink-600 sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button
                variant="outline"
                className="w-full border-pink-500/30 text-pink-200 hover:bg-pink-500/10 sm:w-auto"
              >
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
