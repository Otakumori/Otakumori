// components/layout/SiteFooter.tsx
import SoapstoneComposer from '@/components/soapstones/SoapstoneComposer';
import SoapstoneWall from '@/components/soapstones/SoapstoneWall';

export default function SiteFooter() {
  return (
    <footer className="relative z-40 mt-16 border-t border-white/10 bg-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <div className="text-pink-100 font-semibold">Otaku-mori</div>
            <p className="mt-2 text-pink-200/70 text-sm">
              A living, dark-glass anime commerce experience.
            </p>
          </div>

          <nav className="text-sm">
            <div className="text-pink-200 font-medium mb-2">Company</div>
            <ul className="space-y-2 text-pink-200/80">
              <li>
                <a href="/about" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="hover:underline">
                  Privacy
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="hover:underline">
                  Terms
                </a>
              </li>
            </ul>
          </nav>

          <nav className="text-sm">
            <div className="text-pink-200 font-medium mb-2">Social</div>
            <ul className="space-y-2 text-pink-200/80">
              <li>
                <a
                  href="https://x.com/..."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/..."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@..."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  TikTok
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <div className="text-pink-200 font-medium mb-2">Soapstones</div>
            <SoapstoneComposer />
          </div>
        </div>

        <div className="mt-10">
          <SoapstoneWall />
        </div>
      </div>
    </footer>
  );
}
