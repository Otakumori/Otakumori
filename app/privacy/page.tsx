'use client';

import { generateSEO } from '@/app/lib/seo';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/privacy',
  });
}
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-pink-300 mb-2"
      >
        Privacy Policy
      </motion.h1>

      <p className="text-sm text-pink-100/80">
        Last updated: <time dateTime="2025-10-14">October 14, 2025</time>
      </p>

      <div className="space-y-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <GlassCard className="p-8">
            <p className="text-pink-100/95 leading-relaxed">
              This Privacy Policy explains how Otaku-mori ("we", "our", or "us") collects, uses, and
              shares information when you use our websites, apps, games, and related services (the
              "Services").
            </p>
          </GlassCard>
        </motion.div>

        {/* 1. Information We Collect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">1. Information We Collect</h2>

            <h3 className="text-lg font-semibold text-pink-200 mb-2">
              Personal Information you provide
            </h3>
            <p className="text-pink-100/95">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>Account information (username, email address, display name)</li>
              <li>Profile information and preferences</li>
              <li>Communication data when you contact us</li>
              <li>Payment information for purchases (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-lg font-semibold text-pink-200 mt-6 mb-2">Usage Information</h3>
            <p className="text-pink-100/95">
              We automatically collect certain information about your use of the Services,
              including:
            </p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>Game scores, achievements, and progress</li>
              <li>Social interactions and friend connections</li>
              <li>Device information and browser type</li>
              <li>IP address and general location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </GlassCard>
        </motion.div>

        {/* 2. How We Use Your Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-pink-100/95">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>Provide, maintain, and improve the Services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Personalize your experience and content</li>
              <li>Detect, investigate, and prevent security incidents and abuse</li>
            </ul>
          </GlassCard>
        </motion.div>

        {/* 3. Information Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">3. Information Sharing</h2>
            <p className="text-pink-100/95">
              We do not sell, trade, or otherwise transfer your personal information to third
              parties except:
            </p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist us in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
            <p className="mt-3 text-pink-100/80">
              <strong>Note:</strong> Some information—such as your username and public profile—may
              be visible to other users as part of our community features.
            </p>
          </GlassCard>
        </motion.div>

        {/* 4. Data Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">4. Data Security</h2>
            <p className="text-pink-100/95">
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure payment processing through Stripe</li>
            </ul>
          </GlassCard>
        </motion.div>

        {/* 5. Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">5. Your Rights</h2>
            <p className="text-pink-100/95">You may have the right to:</p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of certain communications</li>
              <li>Request a copy of your data</li>
              <li>Object to certain processing activities</li>
            </ul>
            <p className="mt-3 text-pink-100/95">
              To exercise these rights, please contact us at{' '}
              <a className="underline" href="mailto:privacy@otaku-mori.com">
                privacy@otaku-mori.com
              </a>
              .
            </p>
          </GlassCard>
        </motion.div>

        {/* 6. Cookies and Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">6. Cookies and Tracking</h2>
            <p className="text-pink-100/95">
              We use cookies and similar technologies to enhance your experience, analyze usage
              patterns, and provide personalized content. You can control cookie settings through
              your browser; disabling cookies may affect some functionality.
            </p>
          </GlassCard>
        </motion.div>

        {/* 7. Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">7. Children's Privacy</h2>
            <p className="text-pink-100/95">
              Our Services are not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>
          </GlassCard>
        </motion.div>

        {/* 8. Changes to This Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">8. Changes to This Policy</h2>
            <p className="text-pink-100/95">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last
              updated" date above.
            </p>
          </GlassCard>
        </motion.div>

        {/* 9. Contact Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-pink-300 mb-4">9. Contact Us</h2>
            <p className="text-pink-100/95">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-disc ml-6 mt-2 text-pink-100/95 space-y-1">
              <li>
                Email:{' '}
                <a className="underline" href="mailto:privacy@otaku-mori.com">
                  privacy@otaku-mori.com
                </a>
              </li>
              <li>
                General Contact:{' '}
                <a className="underline" href="mailto:adi@otaku-mori.com">
                  adi@otaku-mori.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <a href="/" aria-label="Back to Home">
                <GlassButton>⟵ Back to Home</GlassButton>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
