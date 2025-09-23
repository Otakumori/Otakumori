'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const GA_TRACKING_ID = 'G-GEKT6PWNXL';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// GA4 Event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Specific event tracking functions for Otaku-mori
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
  });
};

export const trackHomepageView = () => {
  trackEvent('view_homepage', {
    page_title: 'Home',
    page_location: window.location.href,
  });
};

export const trackSearchUsed = (query: string) => {
  trackEvent('search_used', {
    search_term: query,
    search_length: query.length,
  });
};

export const trackSoapstonePlace = () => {
  trackEvent('soapstone_place', {
    event_category: 'community',
  });
};

export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
  });
};

export const trackCTAClick = (ctaName: string) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    event_category: 'engagement',
  });
};

export const track404Puzzle = (phase: 'p1' | 'p2' | 'p3' | 'complete') => {
  trackEvent(`404_${phase}`, {
    event_category: 'puzzle',
  });
};

export const trackPraiseSent = () => {
  trackEvent('praise_sent', {
    event_category: 'community',
  });
};

export const trackWishlistToggle = (action: 'add' | 'remove') => {
  trackEvent('wishlist_toggle', {
    action,
    event_category: 'engagement',
  });
};

export const trackGameStart = (gameName: string) => {
  trackEvent('game_start', {
    game_name: gameName,
    event_category: 'games',
  });
};

export const trackGameComplete = (gameName: string, score?: number) => {
  trackEvent('game_complete', {
    game_name: gameName,
    score,
    event_category: 'games',
  });
};

// gtag is already declared in lib/ga.ts
