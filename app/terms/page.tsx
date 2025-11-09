'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <GlassCard className="p-6 md:p-8 bg-white/5 backdrop-blur-md border border-pink-500/20 shadow-lg">
    <h2 className="text-xl md:text-2xl font-bold text-pink-300 mb-3 md:mb-4 tracking-tight">
      {title}
    </h2>
    <div className="space-y-3 text-pink-100/95 leading-relaxed">{children}</div>
  </GlassCard>
);

export default function TermsOfService() {
  return (
    <main
      data-plaintext="1"
      className="relative mx-auto max-w-4xl px-6 py-14 text-pink-100 selection:bg-pink-500/30"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-pink-300 drop-shadow-sm tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm md:text-base text-pink-200/90">
          <span className="font-semibold">Last updated:</span> November 8, 2025
        </p>
      </motion.header>

      <div className="grid gap-6 md:gap-8">
        <Section title="1. Introduction">
          <p>
            Welcome to Otaku-mori (the “Service”, “we”, “us”, or “our”). By
            accessing or using our website, app, or related services
            (collectively, the “Platform”), you agree to be bound by these
            Terms of Service (“Terms”). If you do not agree, please do not use
            the Service.
          </p>
        </Section>

        <Section title="2. Definitions">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Content</strong>: Any text, images, audio, video, graphics, data, or materials on the Platform.</li>
            <li><strong>User Content (UGC)</strong>: Content submitted or posted by users.</li>
            <li><strong>Merchandise</strong>: Physical or digital goods sold via the Platform.</li>
            <li><strong>Account</strong>: Your registered profile and credentials.</li>
          </ul>
        </Section>

        <Section title="3. Description of the Service">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Anime-themed mini-games, achievements, and leaderboards</li>
            <li>Community features (profiles, comments, “soapstone” messages, chats)</li>
            <li>E-commerce for anime merchandise and digital items</li>
            <li>Blog/editorial and educational content</li>
            <li>Profile customization, progress tracking, and rewards</li>
          </ul>
        </Section>

        <Section title="4. Eligibility & Account Registration">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>You must be at least 13 years old to create an account. If you’re under the age of majority where you live, you need parent/guardian permission.</li>
            <li>Provide accurate, complete, and up-to-date information.</li>
            <li>You are responsible for account security and all activity under your account.</li>
            <li>Notify us promptly of unauthorized use or security incidents.</li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use">
          <p>When using the Service, you agree not to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Violate laws or third-party rights (including IP and privacy rights).</li>
            <li>Upload illegal, harmful, obscene, hateful, or harassing content.</li>
            <li>Spam, phish, distribute malware, or attempt to compromise security.</li>
            <li>Attempt unauthorized access to the Platform, servers, or networks.</li>
            <li>Create multiple accounts to evade restrictions or enforcement.</li>
            <li>Use the Platform for unsolicited advertising without consent.</li>
          </ul>
        </Section>

        <Section title="6. User Content & Intellectual Property">
          <p><strong>Your Content.</strong> You retain ownership of your UGC. By submitting UGC, you grant us a non-exclusive, worldwide, royalty-free, transferable license to host, store, reproduce, modify, display, perform, translate, distribute, and create derivative works of your UGC solely to operate, promote, and improve the Service.</p>
          <p><strong>Our Content.</strong> Site content, features, and functionality (including designs, code, graphics, and logos) are owned by us or our licensors and protected by IP laws. You may not copy, reverse engineer, or create derivative works except where permitted by law.</p>
          <p><strong>Moderation.</strong> We may review, remove, or restrict UGC at our discretion, with or without notice, especially if it violates these Terms or our Community Guidelines.</p>
        </Section>

        <Section title="7. User-Generated Content: Soapstone Messages & Community Posts">
          <p>
            The Platform may allow short “soapstone”-style messages, comments,
            screenshots, ratings, or other UGC visible to others. You are
            solely responsible for the UGC you post.
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>No abusive, defamatory, obscene, hateful, harassing, misleading, or illegal content.</li>
            <li>We may monitor, filter, remove, or modify UGC without notice.</li>
            <li>We are not liable for other users’ UGC or their actions.</li>
            <li>Repeat violators may be suspended or banned.</li>
          </ul>
        </Section>

        <Section title="8. Data Persistence, Backups & Deletions">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Deleted items (UGC, messages, accounts) may persist temporarily in backups, caches, logs, or moderation records.</li>
            <li>We may preserve content where legally required, for security, fraud prevention, or to enforce these Terms.</li>
            <li>We do not guarantee permanent storage of any UGC. Make your own backups.</li>
          </ul>
        </Section>

        <Section title="9. Merchandise, Payments & Delivery">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Payments are processed securely (e.g., via Stripe). You agree to provide valid payment information.</li>
            <li>Prices, taxes, and shipping are shown at checkout and may change without notice.</li>
            <li>Digital items are typically delivered immediately after payment; physical items ship per stated timelines.</li>
            <li>We may cancel orders for suspected fraud, unauthorized card use, or obvious errors.</li>
          </ul>
        </Section>

        <Section title="10. Shipping, Returns, Refunds & Chargebacks">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Shipping times are estimates; delays can occur outside our control.</li>
            <li>Returns and refunds follow our posted Returns Policy. Unless required by law, digital goods are non-returnable.</li>
            <li>Physical returns may require inspection and can incur restocking/return shipping fees when applicable.</li>
            <li>Unresolved payment disputes or chargebacks may result in account suspension, loss of access to digital items, and referral to collections where permitted by law.</li>
          </ul>
        </Section>

        <Section title="11. Promotions, Coupons & Credits">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Promos, coupons, and credits are subject to their own terms, may expire, and are non-transferable.</li>
            <li>We may modify or discontinue promotions at any time.</li>
          </ul>
        </Section>

        <Section title="12. Subscriptions & Renewals (if offered)">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Subscriptions auto-renew until canceled. You can cancel anytime; access continues until the end of the current period.</li>
            <li>We may change pricing at renewal; we’ll provide notice where required by law.</li>
          </ul>
        </Section>

        <Section title="13. Privacy & Data Protection">
          <p>
            Please review our <a href="/privacy" className="underline hover:text-pink-200">Privacy Policy</a> to learn how we collect, use, store, and protect your information.
          </p>
        </Section>

        <Section title="14. Safety, Content Ratings & Sensitive Themes">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Some content may contain fantasy violence, stylized combat, suggestive themes, or community language. Discretion is advised.</li>
            <li>We may implement content ratings, filters, or parental controls over time; however, you are responsible for your viewing and interactions.</li>
          </ul>
        </Section>

        <Section title="15. Accessibility">
          <p>
            We aim to provide an accessible experience and welcome feedback at{' '}
            <a href="mailto:adi@otaku-mori.com" className="underline hover:text-pink-200">adi@otaku-mori.com</a>.
          </p>
        </Section>

        <Section title="16. Feedback; Beta Features; Experiments">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Feedback you provide may be used without restriction or compensation.</li>
            <li>Beta or experimental features may be offered “as is,” can change, and may be discontinued without notice.</li>
          </ul>
        </Section>

        <Section title="17. Third-Party Links & Services">
          <p>
            We may link to or embed third-party services (e.g., payment processors, social widgets).
            We do not control third-party content and disclaim liability for their actions or policies.
          </p>
        </Section>

        <Section title="18. Intellectual-Property Complaints (DMCA/Trademark)">
          <p>
            If you believe your rights are infringed, contact{' '}
            <a href="mailto:legal@otaku-mori.com" className="underline hover:text-pink-200">legal@otaku-mori.com</a>{' '}
            with sufficient detail (work identified, allegedly infringing material, your contact info, and a sworn statement).
          </p>
        </Section>

        <Section title="19. Disclaimers & Limitation of Liability">
          <p><strong>As-Is.</strong> The Service is provided “as is” and “as available,” without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, non-infringement, accuracy, availability, or security.</p>
          <p><strong>No Indirect Damages.</strong> To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, punitive, or consequential damages arising from your use of the Service.</p>
          <p><strong>Cap.</strong> Where permitted by law, our total liability will not exceed the greater of USD $100 or the amounts you paid to us during the 12 months preceding the claim.</p>
        </Section>

        <Section title="20. Uptime, Maintenance & Force Majeure">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>We may suspend the Service for maintenance, updates, or emergencies.</li>
            <li>We are not responsible for delays or failures caused by events beyond our reasonable control (e.g., natural disasters, internet outages, labor disputes, governmental actions).</li>
          </ul>
        </Section>

        <Section title="21. Termination & Suspension">
          <p>
            We may suspend or terminate your account or access at any time, with
            or without notice, for any reason, including violations of these
            Terms. You may close your account via settings or by contacting us.
            Sections that should survive termination (e.g., ownership, disclaimers, limitations, governing law) will continue.
          </p>
        </Section>

        <Section title="22. Changes to These Terms">
          <p>
            We may update these Terms from time to time. The “Last updated” date
            reflects the most recent changes. Continued use after changes
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="23. Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of the Commonwealth of Massachusetts, USA, without regard to conflict-of-law principles. You agree to the exclusive jurisdiction and venue of the state or federal courts located in Plymouth County, Massachusetts, unless otherwise required by law.
          </p>
        </Section>

        <Section title="24. Miscellaneous">
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>No waiver:</strong> Failure to enforce a provision is not a waiver.</li>
            <li><strong>Severability:</strong> If any part is invalid, the rest remains effective.</li>
            <li><strong>Assignment:</strong> We may assign our rights/obligations with notice; you may not assign without our consent.</li>
            <li><strong>Entire agreement:</strong> These Terms plus linked policies (Privacy Policy, Community Guidelines, Returns Policy) are the entire agreement between you and us regarding the Service.</li>
          </ul>
        </Section>

        <Section title="25. Contact">
          <p>
            Questions about these Terms? Reach out:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Legal: <a href="mailto:legal@otaku-mori.com" className="underline hover:text-pink-200">legal@otaku-mori.com</a></li>
            <li>General: <a href="mailto:adi@otaku-mori.com" className="underline hover:text-pink-200">adi@otaku-mori.com</a></li>
          </ul>
        </Section>

        <div className="text-center">
          <GlassButton
            href="/"
            className="rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/30 px-5 py-2.5 font-medium text-pink-100 transition"
          >
            Back to Home
          </GlassButton>
        </div>
      </div>
    </main>
  );
}
