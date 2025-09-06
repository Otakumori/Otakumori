// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';

export default function TermsOfService() {
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
          Terms of Service
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                By accessing and using Otaku-mori ("the Service"), you accept and agree to be bound
                by the terms and provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">2. Description of Service</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>Otaku-mori is an anime community platform that provides:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Mini-games and entertainment content</li>
                <li>Social features and community interactions</li>
                <li>E-commerce services for anime merchandise</li>
                <li>Blog content and educational resources</li>
                <li>User profiles and achievement systems</li>
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 13 years old to create an account</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">4. Acceptable Use</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Distribute spam, malware, or harmful content</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>
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
              5. Content and Intellectual Property
            </h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Your Content</h3>
                <p>
                  You retain ownership of content you create and share on our platform. By posting
                  content, you grant us a license to use, display, and distribute it as necessary to
                  provide our services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Our Content</h3>
                <p>
                  All content, features, and functionality of Otaku-mori are owned by us and are
                  protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">6. Purchases and Payments</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>For purchases made through our platform:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>All sales are final unless otherwise specified</li>
                <li>Prices are subject to change without notice</li>
                <li>We use Stripe for secure payment processing</li>
                <li>Digital items are delivered immediately upon purchase</li>
                <li>Physical items are subject to shipping terms</li>
                <li>Refunds are handled on a case-by-case basis</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">
              7. Privacy and Data Protection
            </h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which explains
                how we collect, use, and protect your information when you use our Service.
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">
              8. Disclaimers and Limitations
            </h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                The Service is provided "as is" without warranties of any kind. We disclaim all
                warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data transmission</li>
              </ul>
              <p className="mt-4">
                In no event shall we be liable for any indirect, incidental, special, or
                consequential damages arising from your use of the Service.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">9. Termination</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We may terminate or suspend your account and access to the Service at any time, with
                or without notice, for any reason, including violation of these Terms.
              </p>
              <p>
                You may terminate your account at any time by contacting us or using account
                deletion features in your profile settings.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">10. Changes to Terms</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of
                material changes by posting the updated Terms on this page and updating the "Last
                updated" date.
              </p>
              <p>
                Your continued use of the Service after changes constitutes acceptance of the new
                Terms.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">11. Governing Law</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law principles.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">12. Contact Information</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <div className="bg-pink-900/20 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> legal@otaku-mori.com
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
        transition={{ duration: 0.8, delay: 2.6 }}
        className="text-center mt-12"
      >
        <GlassButton href="/" variant="secondary">
          Back to Home
        </GlassButton>
      </motion.div>
    </main>
  );
}
