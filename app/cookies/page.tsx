'use client';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { useState, useEffect } from 'react';

);
}
export default function CookieSettings() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('otm-cookie-preferences');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setAnalytics(prefs.analytics || false);
      } catch {
        logger.warn('Failed to parse cookie preferences');
      }
    }
  }, []);

  const handleSave = () => {
    const preferences = { analytics };
    localStorage.setItem('otm-cookie-preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Cookie Settings</h1>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Necessary Cookies</h3>
                  <p className="text-zinc-300 text-sm">Required for basic functionality</p>
                </div>
                <span className="text-green-400 text-sm">Always Active</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Analytics Cookies</h3>
                  <p className="text-zinc-300 text-sm">Help us understand site usage</p>
                </div>
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  aria-label="Analytics cookies"
                >
                  <span className="sr-only">Analytics cookies</span>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Save Preferences
            </button>
            {saved && <p className="text-green-400 mt-4">Preferences saved successfully!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
