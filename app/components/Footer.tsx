import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Otakumori</h3>
            <p className="text-gray-300 text-sm">Discover treasures from the digital abyss</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-300 hover:text-white text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-300 hover:text-white text-sm">
                  Returns
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-300 hover:text-white text-sm">
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="/community" className="text-gray-300 hover:text-white text-sm">
                  Community
                </a>
              </li>
              <li>
                <a href="/glossary" className="text-gray-300 hover:text-white text-sm">
                  Glossary
                </a>
              </li>
              <li>
                <a href="/#leave-a-sign" className="text-gray-300 hover:text-white text-sm">
                  Leave a sign
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="text-gray-300 text-sm text-center space-y-2">
            <p>
              © {new Date().getFullYear()} Otaku-mori. All petals accounted for. Don't go hollow.
            </p>
            <p>Otakumori ™ made with </p>
            <p>
              <a href="/#leave-a-sign" className="hover:text-white transition-colors">
                Leave a sign
              </a>
              {' • '}
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookie Settings
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
