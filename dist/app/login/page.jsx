'use strict';
'use client';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = LoginPage;
const framer_motion_1 = require('framer-motion');
const image_1 = __importDefault(require('next/image'));
const link_1 = __importDefault(require('next/link'));
const button_1 = require('@/components/ui/button');
const card_1 = require('@/components/ui/card');
const CherryBlossom_1 = __importDefault(require('@/components/animations/CherryBlossom'));
const MovingFingers = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...Array(5)].map((_, i) => (
        <framer_motion_1.motion.div
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
        </framer_motion_1.motion.div>
      ))}
    </div>
  );
};
function LoginPage() {
  return (
    <main className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <image_1.default
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Logo */}
      <framer_motion_1.motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute left-4 top-4 z-10"
      >
        <link_1.default href="/">
          <image_1.default
            src="/assets/logo.png"
            alt="Otaku-mori Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
        </link_1.default>
      </framer_motion_1.motion.div>

      {/* Cherry Blossom Animation */}
      <CherryBlossom_1.default />

      {/* Moving Fingers Animation */}
      <MovingFingers />

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <card_1.Card className="border-white/20 bg-white/10 p-8 backdrop-blur-lg">
            <h1 className="mb-6 text-center text-3xl font-bold text-white">Welcome Back</h1>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:border-pink-500 focus:outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:border-pink-500 focus:outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button_1.Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
                Login
              </button_1.Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{' '}
                <link_1.default href="/register" className="text-pink-400 hover:text-pink-300">
                  Sign up
                </link_1.default>
              </p>
            </div>
          </card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </main>
  );
}
