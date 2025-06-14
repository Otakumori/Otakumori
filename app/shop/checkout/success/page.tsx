'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the success page is loaded
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 p-8 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
          <p className="text-pink-200 mb-8">
            Thank you for your purchase. We've sent a confirmation email with your order details.
            You can track your order status in your account dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button variant="outline" className="border-pink-500/30 text-pink-200 hover:bg-pink-500/10 w-full sm:w-auto">
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
} 