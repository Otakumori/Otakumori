import type { Metadata } from "next";
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PetalLayer from '@/app/components/PetalLayer';
import TreeAligner from '@/app/components/TreeAligner';
import { CartProvider } from '@/app/components/cart/CartProvider';

export const metadata: Metadata = { 
  title: "Otakumori", 
  description: "Your anime-inspired digital sanctuary" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="bg-black text-gray-100">
          <CartProvider>
            <TreeAligner />
            <div className="stars-bg" aria-hidden="true" />
            <Header />
            <main id="content" className="relative z-10">
              {children}
            </main>
            <Footer />
            <PetalLayer />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
