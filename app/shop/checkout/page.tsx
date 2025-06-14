'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariant?: {
    id: string;
    title: string;
  };
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement payment processing and order creation
    console.log('Processing order...', { items, shippingInfo });
    // clearCart();
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-pink-200 mb-8">Add some items to your cart to proceed to checkout</p>
            <Link href="/shop">
              <Button className="bg-pink-500 hover:bg-pink-600">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center mb-8">
          <Link href="/cart" className="text-pink-200 hover:text-white flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div>
            <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-pink-200 text-sm mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/10 border-pink-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-pink-200 text-sm mb-2">Address</label>
                  <Input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="bg-white/10 border-pink-500/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">City</label>
                    <Input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">State</label>
                    <Input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">ZIP Code</label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 text-sm mb-2">Country</label>
                    <Input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-pink-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Pay ${total.toFixed(2)}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-white/10 backdrop-blur-lg border-pink-500/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-pink-200">Quantity: {item.quantity}</p>
                      <p className="text-pink-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-pink-500/30 mt-6 pt-6 space-y-2">
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
                <div className="flex justify-between text-white font-semibold pt-2 border-t border-pink-500/30">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 