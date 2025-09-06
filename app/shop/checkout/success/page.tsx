// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

// Force dynamic rendering to avoid static generation issues with context providers
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useCart } from '../../../components/cart/CartProvider';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card className="mx-auto max-w-2xl border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <motion.div 
              className="mb-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-pink-500" />
            </motion.div>
            <motion.h1 
              className="mb-4 text-3xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Order Confirmed!
            </motion.h1>
            <motion.p 
              className="mb-8 text-pink-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Thank you for your purchase. We've sent a confirmation email with your order details.
              You can track your order status in your account dashboard.
            </motion.p>
            <motion.div 
              className="flex flex-col justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
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
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
