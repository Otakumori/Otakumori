// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

// Force dynamic rendering to avoid static generation issues with context providers
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

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
  const { items: cart, clearCart, total } = useCart();
  const { isSignedIn, userId } = useAuth();
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError('Please sign in to complete your purchase');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Transform cart items for the API
      const orderItems = cart.map((item) => ({
        productId: item.id,
        variantId: item.selectedVariant?.id || item.id,
        name: item.name,
        quantity: item.quantity,
        priceCents: Math.round(item.price * 100),
        sku: `SKU-${item.id}`,
        description: item.name,
        images: item.image ? [item.image] : [],
        printifyProductId: item.id, // This would come from the product data
        printifyVariantId: item.selectedVariant?.id || 1, // This would come from the variant data
      }));

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo,
          successUrl: `${window.location.origin}/shop/checkout/success`,
          cancelUrl: `${window.location.origin}/shop/cart`,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Redirect to Stripe checkout
        window.location.href = data.data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('An error occurred while processing your order');
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Sign In Required</h1>
            <p className="mb-8 text-pink-200">Please sign in to complete your purchase</p>
            <Link href="/sign-in">
              <Button className="bg-pink-500 hover:bg-pink-600">Sign In</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
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
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">Last Name</label>
                    <Input
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Address</label>
                  <Input
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">City</label>
                    <Input
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">State</label>
                    <Input
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">ZIP Code</label>
                    <Input
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                      placeholder="ZIP"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Country</label>
                  <Input
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50"
                    placeholder="Country"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      {item.selectedVariant && (
                        <p className="text-sm text-pink-200">{item.selectedVariant.title}</p>
                      )}
                      <p className="text-pink-200">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-pink-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-pink-500/30 pt-4 space-y-2">
                  <div className="flex justify-between text-pink-200">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-pink-200">
                    <span>Shipping</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between text-pink-200">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-t border-pink-500/30 pt-2 font-semibold text-white">
                    <span>Total</span>
                    <span>${(total + 5).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
