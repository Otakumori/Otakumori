'use client';
import Image from 'next/image';
import Link from 'next/link';
import NavAuth from './NavAuth';

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-black/80 shadow-lg backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex cursor-pointer items-center space-x-3">
            <Image
              src="/assets/circlelogo.png"
              alt="Otakumori Logo"
              width={50}
              height={50}
              className="rounded-full border-2 border-white"
            />
            <span className="text-2xl font-bold text-white">{<><span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span></>}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden space-x-8 text-lg text-white md:flex" aria-label="Main navigation">
          <Link href="/" className="hover:text-purple-400 transition-colors">{<>''
            <span role='img' aria-label='emoji'>H</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>
            ''</>}</Link>

          {/* Shop Dropdown */}
          <div className="group relative">
            <button
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black hover:text-purple-400 transition-colors"
              aria-expanded="false"
              aria-haspopup="true"
              aria-label="Shop menu"
            >{<>''
              <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span>
              ''</>}</button>
            <div
              className="absolute left-0 mt-2 hidden w-52 rounded-lg bg-black/90 p-2 shadow-lg group-hover:block"
              role="menu"
              aria-label="Shop submenu"
            >
              <Link
                href="/shop"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >{<>''
                <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span>' '<span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>l</span>
                ''</>}</Link>
              <div className="my-1 border-b border-gray-600" role="separator"></div>
              <Link
                href="/shop/apparel"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >{<>''
                <span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>l</span>
                ''</>}</Link>
              <Link
                href="/shop/homedecor"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >{<>''
                <span role='img' aria-label='emoji'>H</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>D</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>
                ''</>}</Link>
              <Link
                href="/shop/accessories"
                className="block px-3 py-1 hover:bg-gray-800 transition-colors"
                role="menuitem"
              >{<>''
                <span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span>
                ''</>}</Link>
              <Link
                href="/shop/theabyss"
                className="block px-3 py-1 text-red-500 hover:bg-red-700 transition-colors"
                role="menuitem"
                aria-label="The Abyss - Adult content"
              >{<>''
                <span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span></>}{' '}
                <span role="img" aria-label="Adult content warning">
                  🔞
                </span>
              </Link>
            </div>
          </div>

          <Link href="/blog" className="hover:text-purple-400 transition-colors">{<>''
            <span role='img' aria-label='emoji'>B</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span>
            ''</>}</Link>
          <Link href="/mini-games" className="hover:text-purple-400 transition-colors">{<>''
            <span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>i</span>' '<span role='img' aria-label='emoji'>G</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span>
            ''</>}</Link>

          {/* Search Bar */}
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">{<>''
              <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>h</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span>
              ''</>}</label>
            <input
              id="search-input"
              type="text"
              placeholder="Whattrya buying?"
              className="w-48 rounded-lg bg-gray-900 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Search products"
            />
          </div>

          {/* Auth Component */}
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
