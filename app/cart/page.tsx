'use client';

import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-pink-200">Add some items to your cart to see them here!</p>
            <Link href="/shop">
              <Button className="bg-pink-500 hover:bg-pink-600">Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <Link href="/shop" className="flex items-center text-pink-200 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map(item => (
              <Card key={item.id} className="border-pink-500/30 bg-white/10 p-4 backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="text-pink-200">${item.price}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center rounded-lg border border-pink-500/30">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-pink-200 hover:text-white"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-2 text-white">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-pink-200 hover:text-white"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-pink-200 hover:text-white"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-pink-200">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-pink-200">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-pink-200">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="mb-6 border-t border-pink-500/30 pt-4">
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full bg-pink-500 hover:bg-pink-600">Proceed to Checkout</Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
