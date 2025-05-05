'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/minigames', label: 'Mini-Games' },
  { href: '/profile', label: 'My Account' },
  { href: '/community', label: 'Community' },
]

export default function Header() {
  const { data: session } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 shadow-lg bg-black transition-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center space-x-3 min-w-[180px]">
            <Link href="/" className="flex items-center">
              <Image src="/assets/logo.png" alt="Otaku-mori Logo" width={44} height={44} className="rounded-full bg-pink-100" />
              <span className="ml-2 text-2xl font-bold text-pink-200 drop-shadow">Otaku-mori</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-pink-100 hover:text-pink-300 transition font-semibold ${pathname === link.href ? 'text-pink-400 underline underline-offset-4' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center min-w-[120px] justify-end">
            <input
              type="text"
              placeholder="What're ya buyin'"
              className="w-32 px-2 py-1 rounded-lg bg-gray-800 text-white placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm text-base"
              style={{ height: '2.25rem' }}
            />
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-pink-100 hover:text-pink-300 focus:outline-none ml-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-pink-100 hover:text-pink-300"
            >
              <span className="sr-only">Search</span>
            </button>
            {session ? (
              <Link href="/profile" className="text-pink-100 hover:text-pink-300">
                <span className="sr-only">Profile</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-pink-100 hover:text-pink-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute left-0 right-0 bg-gray-900 shadow-lg rounded-b-2xl z-40 flex flex-col items-center py-6 space-y-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-pink-100 hover:text-pink-300 text-lg font-semibold ${pathname === link.href ? 'text-pink-400 underline underline-offset-4' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-4"
          >
            <input
              type="text"
              placeholder="Whattrya buying?"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-lg"
            />
          </motion.div>
        )}
      </div>
    </header>
  )
} 