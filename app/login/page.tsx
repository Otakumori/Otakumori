'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CherryBlossom from '@/components/animations/CherryBlossom';

const MovingFingers = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/20"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default function LoginPage() {
  return (
    <main className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-10"
      >
        <Link href="/">
          <Image
            src="/assets/logo.png"
            alt="Otaku-mori Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
        </Link>
      </motion.div>

      {/* Cherry Blossom Animation */}
      <CherryBlossom />

      {/* Moving Fingers Animation */}
      <MovingFingers />

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h1>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
                Login
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{' '}
                <Link href="/register" className="text-pink-400 hover:text-pink-300">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
} 