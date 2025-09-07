// DEPRECATED: This component is a duplicate. Use components\layout\Footer.tsx instead.
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/mini-games', label: 'Mini-Games' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
  { href: '/admin', label: 'Admin' },
];

const socials = [
  {
    href: 'https://www.instagram.com/otakumoriii',
    icon: '/icons/instagram.svg',
    label: 'Instagram',
  },
  { href: 'https://www.facebook.com/Otakumorii', icon: '/icons/facebook.svg', label: 'Facebook' },
  { href: '#', icon: '/icons/discord.svg', label: 'Discord' },
  { href: '#', icon: '/icons/twitter.svg', label: 'Twitter/X' },
  { href: '#', icon: '/icons/tiktok.svg', label: 'TikTok' },
  { href: '#', icon: '/icons/youtube.svg', label: 'YouTube' },
];

export function BottomLogoAndSocials() {
  return (
    <div className="flex w-full flex-col items-center justify-center bg-black py-8">
      <div className="flex flex-col items-center">
        <img
          src="/assets/logo.png"
          alt="Otakumori Logo"
          width={48}
          height={48}
          className="mb-2 rounded-full border-2 border-pink-400"
        />
        <ul className="mt-2 flex space-x-4" aria-label="Social media links" role="list">
          <li role="listitem">
            <a
              href="https://www.facebook.com/Otakumorii"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                className="text-gray-200 transition hover:text-pink-400"
              >
                <text
                  x="7"
                  y="23"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontWeight="bold"
                  fontSize="24"
                  fill="currentColor"
                >
                  f
                </text>
              </svg>
            </a>
          </li>
          <li role="listitem">
            <a
              href="https://www.instagram.com/otakumoriii"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-gray-200 transition hover:text-pink-400"
              >
                <rect
                  width="18"
                  height="18"
                  x="3"
                  y="3"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.5" fill="currentColor" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function FooterNewsletterForm() {
  const router = useRouter();
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim();
    if (email) {
      router.push(`/join-the-blossom?email=${encodeURIComponent(email)}`);
    }
  }
  return (
    <form
      className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 shadow-inner"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        name="email"
        placeholder="Join the Blossom..."
        className="w-40 bg-transparent px-2 py-1 text-white placeholder-blue-200 outline-none md:w-56"
        required
      />
      <button
        type="submit"
        className="rounded-full bg-blue-500 px-4 py-1 font-semibold text-white transition hover:bg-blue-600"
      >
        Unleash
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-16 w-full overflow-hidden bg-gradient-to-br from-slate-900/90 to-gray-900/90 px-4 py-12 text-white">
      {/* Animated Space Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          width="100%"
          height="100%"
          className="animate-blossom-move absolute"
          style={{ left: '-10%', top: '10%' }}
        >
          <circle cx="60" cy="60" r="18" fill="#4A90E2" opacity="0.3" />
        </svg>
        <svg
          width="100%"
          height="100%"
          className="animate-blossom-move2 absolute"
          style={{ right: '-10%', bottom: '10%' }}
        >
          <circle cx="60" cy="60" r="12" fill="#7B68EE" opacity="0.2" />
        </svg>
      </div>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 md:flex-row md:justify-between">
        {/* Left: Logo & Tagline */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <div className="text-xl font-bold tracking-wide">Otaku-mori</div>
          <div className="max-w-xs text-center text-sm italic text-blue-200 md:text-left">
            Stay a while. Let's explore the cosmos together.
          </div>
        </div>
        {/* Center: Newsletter & Nav */}
        <div className="flex flex-col items-center gap-4">
          <FooterNewsletterForm />
          <nav className="mt-2 flex flex-wrap justify-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition hover:text-blue-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Right: Socials & Contact */}
        <div className="flex flex-col items-center gap-3 md:items-end">
          <Link href="#" className="text-sm text-blue-200 hover:text-blue-100">
            Contact Us
          </Link>
          <div className="mt-2 text-xs text-blue-300">
            &copy; {new Date().getFullYear()} Otaku-mori. Made with{' '}
            <span className="animate-pulse text-blue-400">♥</span>
          </div>
        </div>
      </div>
      {/* Blossom Animations */}
      <style jsx>{`
        .animate-blossom-move {
          animation: blossomMove 18s linear infinite alternate;
        }
        .animate-blossom-move2 {
          animation: blossomMove2 22s linear infinite alternate;
        }
        @keyframes blossomMove {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(40px) scale(1.2);
          }
        }
        @keyframes blossomMove2 {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-30px) scale(1.1);
          }
        }
      `}</style>
    </footer>
  );
}
