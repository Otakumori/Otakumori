'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';

export default function CookiePolicy() {
  return (
    <main className="relative mx-auto max-w-4xl px-6 py-16 text-pink-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-pink-300 drop-shadow-sm">
          Cookie Policy
        </h1>
        <p className="text-lg text-pink-200/90">Last updated: {new Date().toLocaleDateString()}</p>
      </motion.div>

      {/* Content */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">What Are Cookies?</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                Cookies are small text files that are stored on your device when you visit our
                website. They help us provide you with a better experience by remembering your
                preferences and understanding how you use our site.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">How We Use Cookies</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>We use cookies for several purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>To remember your login status and preferences</li>
                <li>To analyze how you use our website and improve our services</li>
                <li>To provide personalized content and recommendations</li>
                <li>To ensure the security of our platform</li>
                <li>To remember your game progress and achievements</li>
                <li>To enable social features and friend connections</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">Types of Cookies We Use</h2>
            <div className="space-y-6 text-pink-100/95 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable
                  basic functions like page navigation, access to secure areas, and remembering your
                  login status.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Performance Cookies</h3>
                <p>
                  These cookies collect information about how you use our website, such as which
                  pages you visit most often. This helps us improve the performance of our site.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Functionality Cookies</h3>
                <p>
                  These cookies remember choices you make to improve your experience, such as your
                  language preference, theme settings, and game preferences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by
                  collecting and reporting information anonymously.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">Third-Party Cookies</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>We may also use third-party services that set their own cookies:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Stripe:</strong> For secure payment processing
                </li>
                <li>
                  <strong>Clerk:</strong> For user authentication and account management
                </li>
                <li>
                  <strong>Vercel:</strong> For website analytics and performance monitoring
                </li>
                <li>
                  <strong>Google Analytics:</strong> For website usage statistics
                </li>
              </ul>
              <p className="mt-4">
                These third-party services have their own privacy policies and cookie practices.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">
              Managing Your Cookie Preferences
            </h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>You can control and manage cookies in several ways:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use your browser settings to block or delete cookies</li>
                <li>Use our cookie consent banner when you first visit our site</li>
                <li>Adjust your preferences in your account settings</li>
                <li>Contact us to discuss your cookie preferences</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our
                website and your user experience.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">Browser-Specific Instructions</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Chrome</h3>
                <p>Settings → Privacy and security → Cookies and other site data</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Firefox</h3>
                <p>Options → Privacy & Security → Cookies and Site Data</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Safari</h3>
                <p>Preferences → Privacy → Manage Website Data</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Edge</h3>
                <p>Settings → Cookies and site permissions → Cookies and site data</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">Updates to This Policy</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons. We will notify you
                of any material changes by posting the updated policy on this page.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">Contact Us</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>If you have any questions about our use of cookies, please contact us at:</p>
              <div className="bg-pink-900/20 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> privacy@otaku-mori.com
                </p>
                <p>
                  <strong>General Contact:</strong> adi@otaku-mori.com
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="text-center mt-12"
      >
        <GlassButton href="/" variant="secondary">
          Back to Home
        </GlassButton>
      </motion.div>
    </main>
  );
}
