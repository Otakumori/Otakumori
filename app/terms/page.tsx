/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-pink-400 mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-pink max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-300 mb-4">
              By accessing and using Otakumori ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">2. Description of Service</h2>
            <p className="text-neutral-300 mb-4">
              Otakumori is an anime and manga community platform that provides merchandise shopping, community features, mini-games, and social interaction for otaku culture enthusiasts.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">3. User Accounts</h2>
            <p className="text-neutral-300 mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">4. User Conduct</h2>
            <p className="text-neutral-300 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">5. Intellectual Property</h2>
            <p className="text-neutral-300 mb-4">
              The Service and its original content, features, and functionality are owned by Otakumori and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">6. Privacy Policy</h2>
            <p className="text-neutral-300 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">7. Termination</h2>
            <p className="text-neutral-300 mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">8. Limitation of Liability</h2>
            <p className="text-neutral-300 mb-4">
              In no event shall Otakumori, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">9. Changes to Terms</h2>
            <p className="text-neutral-300 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">10. Contact Information</h2>
            <p className="text-neutral-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-neutral-300">
              Email: legal@otaku-mori.com<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
