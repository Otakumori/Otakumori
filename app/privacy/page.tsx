// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';

export default function PrivacyPolicy() {
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
          Privacy Policy
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Personal Information</h3>
                <p>We collect information you provide directly to us, such as:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Account information (username, email address, display name)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication data when you contact us</li>
                  <li>Payment information for purchases (processed securely through Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-200 mb-2">Usage Information</h3>
                <p>We automatically collect certain information about your use of our services:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Game scores, achievements, and progress</li>
                  <li>Social interactions and friend connections</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Personalize your experience and content</li>
                <li>Detect, investigate, and prevent security incidents</li>
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">3. Information Sharing</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third
                parties except:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist us in operating our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Some information, such as your username and public profile,
                may be visible to other users as part of our community features.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">4. Data Security</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing through Stripe</li>
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">5. Your Rights</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of certain communications</li>
                <li>Request a copy of your data</li>
                <li>Object to certain processing activities</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@otaku-mori.com" className="underline hover:text-pink-200">
                  privacy@otaku-mori.com
                </a>
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage
                patterns, and provide personalized content. You can control cookie settings through
                your browser, but disabling cookies may affect some functionality.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">7. Children's Privacy</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                Our services are not directed to children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have collected
                information from a child under 13, please contact us immediately.
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">8. Changes to This Policy</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the "Last
                updated" date.
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
            <h2 className="text-2xl font-bold text-pink-300 mb-4">9. Contact Us</h2>
            <div className="space-y-4 text-pink-100/95 leading-relaxed">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
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
        transition={{ duration: 0.8, delay: 2.0 }}
        className="text-center mt-12"
      >
        <GlassButton href="/" variant="secondary">
          Back to Home
        </GlassButton>
      </motion.div>
    </main>
  );
}
