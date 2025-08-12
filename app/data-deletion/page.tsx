export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-pink-400 mb-8">Data Deletion Instructions</h1>
        
        <div className="prose prose-invert prose-pink max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">How to Delete Your Data</h2>
            <p className="text-neutral-300 mb-4">
              We respect your right to control your personal data. This page explains how you can request the deletion of your data from Otakumori.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">1. Automatic Account Deletion</h2>
            <p className="text-neutral-300 mb-4">
              The easiest way to delete your data is to delete your account through your profile settings:
            </p>
            <ol className="list-decimal list-inside text-neutral-300 ml-6 mb-4">
              <li>Sign in to your Otakumori account</li>
              <li>Go to your Profile page</li>
              <li>Click on "Account Settings"</li>
              <li>Scroll down to "Delete Account"</li>
              <li>Follow the confirmation process</li>
            </ol>
            <p className="text-neutral-300 mb-4">
              <strong>Note:</strong> Account deletion is permanent and cannot be undone.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">2. Manual Data Deletion Request</h2>
            <p className="text-neutral-300 mb-4">
              If you cannot access your account or prefer to make a manual request, you can contact us directly:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-neutral-300 mb-2">
                <strong>Email:</strong> privacy@otaku-mori.com
              </p>
              <p className="text-neutral-300 mb-2">
                <strong>Subject Line:</strong> "Data Deletion Request"
              </p>
              <p className="text-neutral-300">
                <strong>Required Information:</strong> Your email address, username (if known), and reason for deletion
              </p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">3. What Gets Deleted</h2>
            <p className="text-neutral-300 mb-4">When you delete your account, we will remove:</p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Personal profile information</li>
              <li>Account credentials and authentication data</li>
              <li>Order history and purchase records</li>
              <li>Community posts and comments</li>
              <li>Game scores and achievements</li>
              <li>Friend connections and social data</li>
              <li>Preferences and settings</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">4. Data Retention Exceptions</h2>
            <p className="text-neutral-300 mb-4">
              Some data may be retained for legal or business purposes, even after account deletion:
            </p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Transaction records required for tax purposes</li>
              <li>Data necessary for legal compliance</li>
              <li>Aggregated, anonymized data for analytics</li>
              <li>Backup data for a limited period</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">5. Processing Time</h2>
            <p className="text-neutral-300 mb-4">
              We will process your data deletion request within 30 days of receipt. You will receive a confirmation email once the process is complete.
            </p>
            <p className="text-neutral-300 mb-4">
              <strong>Note:</strong> Some data may take longer to remove from backup systems and third-party services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">6. Third-Party Data</h2>
            <p className="text-neutral-300 mb-4">
              If you signed up using Facebook or Google, you may also need to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Revoke access to Otakumori in your Facebook/Google account settings</li>
              <li>Contact Facebook/Google directly if you want to delete data they may have collected</li>
              <li>Review their respective privacy policies for data deletion procedures</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">7. Reinstatement</h2>
            <p className="text-neutral-300 mb-4">
              Once your account is deleted, it cannot be restored. If you wish to use Otakumori again in the future, you will need to create a new account.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">8. Contact Information</h2>
            <p className="text-neutral-300 mb-4">
              For questions about data deletion or to make a request, contact us at:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-neutral-300 mb-2">
                <strong>Privacy Team:</strong> privacy@otaku-mori.com
              </p>
              <p className="text-neutral-300 mb-2">
                <strong>Support Team:</strong> support@otaku-mori.com
              </p>
              <p className="text-neutral-300">
                <strong>Response Time:</strong> Within 48 hours during business days
              </p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-300 mb-4">9. Additional Rights</h2>
            <p className="text-neutral-300 mb-4">
              Depending on your location, you may have additional rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-neutral-300 ml-6 mb-4">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="text-neutral-300 mb-4">
              Contact us if you would like to exercise any of these rights.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
