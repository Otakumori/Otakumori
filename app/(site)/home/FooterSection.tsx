import { safeFetch, isSuccess } from '@/lib/safeFetch';
import { env } from '@/env.mjs';
import SoapstoneComposer from '@/components/soapstone/SoapstoneComposer';
import SoapstoneWall from '@/components/soapstone/SoapstoneWall';
import { transformApiUserToComponent, type ApiSoapstoneUser } from '@/app/lib/soapstone-user-utils';

interface SoapstoneMessage {
  id: string;
  text: string;
  score: number;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ApiSoapstoneMessage {
  id: string;
  text?: string;
  body?: string;
  appraises?: number;
  createdAt: string;
  user?: ApiSoapstoneUser | null;
}

interface SoapstoneApiResponse {
  ok: boolean;
  data?: {
    items?: ApiSoapstoneMessage[];
  };
  error?: string;
}

interface FooterSectionProps {
  showSoapstones: boolean;
}

export default async function FooterSection({ showSoapstones }: FooterSectionProps) {
  let soapstoneMessages: SoapstoneMessage[] = [];
  let isSoapstoneBlocked = true;

  if (showSoapstones) {
    // Fetch soapstone messages from v1 API
    const result = await safeFetch<SoapstoneApiResponse>('/api/v1/soapstone?limit=10', {
      allowLive: true,
    });

    if (isSuccess(result) && result.data?.ok && result.data.data?.items) {
      // Transform API response to component format using shared utility
      soapstoneMessages = result.data.data.items.map((msg): SoapstoneMessage => ({
        id: msg.id,
        text: msg.text || msg.body || '',
        score: msg.appraises || 0,
        createdAt: msg.createdAt,
        user: transformApiUserToComponent(msg.user || undefined),
      }));
      isSoapstoneBlocked = false;
    }
  }

  const isLiveDataEnabled = env.NEXT_PUBLIC_LIVE_DATA === '1';

  return (
    <footer className= "relative z-40 mt-16 bg-[rgba(57,5,40,0.8)]" >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Soapstones Section */}
        {showSoapstones && (
          <div className="mb-12">
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-pink-200 mb-6">
                Leave a sign for fellow travelers
              </h3>

              {/* Soapstone Composer */}
              <div className="mb-8">
                <SoapstoneComposer
                  disabled={!isLiveDataEnabled}
                  disabledMessage={
                    !isLiveDataEnabled
                      ? 'Live data is disabled. Soapstone posting is temporarily unavailable.'
                      : undefined
                  }
                />
              </div>

              {/* Soapstone Wall */}
              {!isSoapstoneBlocked && soapstoneMessages.length > 0 ? (
                <SoapstoneWall messages={soapstoneMessages} />
              ) : isSoapstoneBlocked ? (
                <div className="text-center py-8">
                  <p className="text-pink-200/70 mb-4">
                    Soapstone messages are temporarily unavailable.
                  </p>
                  <p className="text-pink-200/50 text-sm">
                    Check back later to see messages from fellow travelers.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-pink-200/70 mb-4">
                    No messages yet. Be the first to leave a sign!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-pink-200 mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <a href="/shop" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/mini-games"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Mini-Games
                </a>
              </li>
              <li>
                <a href="/blog" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/about" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-pink-200 mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/community"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="/events"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/discord"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="/twitter"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-pink-200 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/status"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-pink-200 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-pink-200/70 hover:text-pink-200 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-pink-200/70 hover:text-pink-200 transition-colors"
                >
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-pink-200/20">
          <div className="text-center">
            <p className="text-pink-200/50 text-sm">Otakumori ™ made with ♡</p>
            <p className="text-pink-200/50 text-xs mt-2">
              © {new Date().getFullYear()} Otaku-mori. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
