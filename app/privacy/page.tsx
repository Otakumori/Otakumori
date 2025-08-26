/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-pink-400 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-pink max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">1. Information We Collect</h2>
            <p className="text-neutral-300 mb-4">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Personal Information:</strong> Name, email address, shipping address, payment information, and profile preferences.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Usage Information:</strong> How you interact with our platform, including pages visited, features used, and time spent on the site.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">2. How We Use Your Information</h2>
            <p className="text-neutral-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Personalize your experience and deliver relevant content</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">3. Information Sharing</h2>
            <p className="text-neutral-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">4. Data Security</h2>
            <p className="text-neutral-300 mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-neutral-300 mb-4">
              However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">5. Cookies and Tracking</h2>
            <p className="text-neutral-300 mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content.
            </p>
            <p className="text-neutral-300 mb-4">
              You can control cookie settings through your browser preferences, though disabling cookies may affect some functionality.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">6. Third-Party Services</h2>
            <p className="text-neutral-300 mb-4">
              Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for their privacy practices.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Social Login:</strong> When you sign in through Facebook or Google, they may collect and share certain information with us as described in their privacy policies.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">7. Data Retention</h2>
            <p className="text-neutral-300 mb-4">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.
            </p>
            <p className="text-neutral-300 mb-4">
              You may request deletion of your account and associated data at any time through your account settings or by contacting us.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">8. Your Rights</h2>
            <p className="text-neutral-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">9. Children's Privacy</h2>
            <p className="text-neutral-300 mb-4">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">10. Changes to This Policy</h2>
            <p className="text-neutral-300 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">11. Contact Us</h2>
            <p className="text-neutral-300 mb-4">
              If you have questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="text-neutral-300">
              Email: privacy@otaku-mori.com<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
