'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/minigames', label: 'Mini-Games' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
  { href: '/admin', label: 'Admin' },
]

const socials = [
  { href: 'https://www.instagram.com/otakumoriii', icon: '/icons/instagram.svg', label: 'Instagram' },
  { href: 'https://www.facebook.com/Otakumorii', icon: '/icons/facebook.svg', label: 'Facebook' },
  { href: '#', icon: '/icons/discord.svg', label: 'Discord' },
  { href: '#', icon: '/icons/twitter.svg', label: 'Twitter/X' },
  { href: '#', icon: '/icons/tiktok.svg', label: 'TikTok' },
  { href: '#', icon: '/icons/youtube.svg', label: 'YouTube' },
]

export function BottomLogoAndSocials() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 bg-black">
      <div className="flex flex-col items-center">
        <img src="/assets/logo.png" alt="Otakumori Logo" width={48} height={48} className="mb-2 rounded-full border-2 border-pink-400" />
        <div className="flex space-x-4 mt-2">
          <a href="https://www.facebook.com/Otakumorii" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-gray-200 hover:text-pink-400 transition"><text x="7" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="24" fill="currentColor">f</text></svg>
          </a>
          <a href="https://www.instagram.com/otakumoriii" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-200 hover:text-pink-400 transition"><rect width="18" height="18" x="3" y="3" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17" cy="7" r="1.5" fill="currentColor"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export function FooterNewsletterForm() {
  const router = useRouter()
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim()
    if (email) {
      router.push(`/join-the-blossom?email=${encodeURIComponent(email)}`)
    }
  }
  return (
    <form className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 shadow-inner" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Join the Blossom..."
        className="bg-transparent outline-none text-white placeholder-pink-200 px-2 py-1 w-40 md:w-56"
        required
      />
      <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-1 font-semibold transition">Unleash</button>
    </form>
  )
}

export default function Footer() {
  return (
    <footer className="relative w-full bg-gradient-to-br from-pink-700/80 to-purple-900/80 text-white py-12 px-4 mt-16 overflow-hidden">
      {/* Animated Blossom Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute animate-blossom-move" style={{ left: '-10%', top: '10%' }}>
          <circle cx="60" cy="60" r="18" fill="#FFB6C1" opacity="0.3" />
        </svg>
        <svg width="100%" height="100%" className="absolute animate-blossom-move2" style={{ right: '-10%', bottom: '10%' }}>
          <circle cx="60" cy="60" r="12" fill="#FF69B4" opacity="0.2" />
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-8">
        {/* Left: Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="text-xl font-bold tracking-wide">Otaku-mori</div>
          <div className="text-pink-200 italic text-sm max-w-xs text-center md:text-left">Stay a while. Let's blossom together. 🌸</div>
        </div>
        {/* Center: Newsletter & Nav */}
        <div className="flex flex-col items-center gap-4">
          <FooterNewsletterForm />
          <nav className="flex flex-wrap gap-4 justify-center mt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-pink-300 transition text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Right: Socials & Contact */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <Link href="#" className="text-pink-200 hover:text-pink-100 text-sm">Contact Us</Link>
          <div className="text-xs text-pink-300 mt-2">&copy; {new Date().getFullYear()} Otaku-mori. Made with <span className="animate-pulse text-pink-400">♥</span></div>
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
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(40px) scale(1.2); }
        }
        @keyframes blossomMove2 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.1); }
        }
      `}</style>
    </footer>
  )
} 