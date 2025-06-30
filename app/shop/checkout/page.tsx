'use client';

import { useState } from 'react';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '../../components/ui/button';
import { Card } from '../../../components/ui/card';
import Input from '../../../components/ui/input';
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
    setShippingInfo(prev => ({ ...prev, [name]: value }));
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
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-pink-200">Add some items to your cart to proceed to checkout</p>
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
          <Link href="/cart" className="flex items-center text-pink-200 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Shipping Form */}
          <div>
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Address</label>
                  <Input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">City</label>
                    <Input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">State</label>
                    <Input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">ZIP Code</label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">Country</label>
                    <Input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
                    <Lock className="mr-2 h-4 w-4" />
                    Pay ${total.toFixed(2)}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-pink-200">Quantity: {item.quantity}</p>
                      <p className="text-pink-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-pink-500/30 pt-6">
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
                <div className="flex justify-between border-t border-pink-500/30 pt-2 font-semibold text-white">
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
