/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import SoapstoneComposer from '../SoapstoneComposer';

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-pink-500/30 bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/assets/images/logo.png"
                alt="Otakumori"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <h2 className="text-2xl font-bold text-white">Otakumori</h2>
            </div>
            <p className="mb-6 text-gray-400">
              Where anime meets Dark Souls in a world of cherry blossoms and mystery. Join our
              community and become part of the legend.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/otakumori"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-pink-500"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/otakumori"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-pink-500"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/otakumori"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-pink-500"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-gray-400 transition-colors hover:text-pink-500">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 transition-colors hover:text-pink-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-gray-400 transition-colors hover:text-pink-500"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/achievements"
                  className="text-gray-400 transition-colors hover:text-pink-500"
                >
                  Achievements
                </Link>
              </li>
            </ul>
          </div>

          {/* Soapstone Message */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Leave a Soapstone Message</h3>
            {isAuthenticated ? (
              <SoapstoneComposer />
            ) : (
              <p className="text-gray-400">
                Please{' '}
                <Link href="/login" className="text-pink-500 transition-colors hover:text-pink-400">
                  log in
                </Link>{' '}
                to leave a message.
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-pink-500/30 pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Otakumori. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
