/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Collaboration - Otakumori',
  description:
    'Join our creator collaboration program. Get custom assets, build your audience, and be part of the Otakumori community.',
  openGraph: {
    title: 'Creator Collaboration - Otakumori',
    description:
      'Join our creator collaboration program. Get custom assets, build your audience, and be part of the Otakumori community.',
    type: 'website',
  },
};

export default function CollabPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cube-900 via-cube-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 text-6xl">🤝</div>
          <h1 className="text-5xl md:text-6xl font-bold text-slatey-200 mb-6">
            Creator Collaboration
          </h1>
          <p className="text-xl text-slatey-300 max-w-3xl mx-auto leading-relaxed">
            Let's build something amazing together. We provide custom assets, you create incredible
            content, and we both grow our communities.
          </p>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slatey-200 mb-12 text-center">What We Provide</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-slatey-200 mb-3">Custom Assets</h3>
              <p className="text-slatey-400">
                Get 1-2 custom assets tailored to your style. UI elements, character portraits, or
                whatever fits your content.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-slatey-200 mb-3">Social Promotion</h3>
              <p className="text-slatey-400">
                We'll share your content across our channels, helping you reach new audiences and
                grow your following.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-slatey-200 mb-3">Exclusive Access</h3>
              <p className="text-slatey-400">
                Early access to new collections, beta testing opportunities, and special
                creator-only discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Do */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slatey-200 mb-12 text-center">What You Do</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-slatey-200 mb-4">Create Amazing Content</h3>
              <ul className="space-y-3 text-slatey-400">
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Use our assets in your games, videos, or streams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Share your creations on social media</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Tag us and mention the collaboration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Engage with our community</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-slatey-200 mb-4">Build Together</h3>
              <ul className="space-y-3 text-slatey-400">
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Provide feedback on new collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Suggest asset ideas and improvements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Help other creators in the community</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-400 mt-1">•</span>
                  <span>Be part of our growth story</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slatey-200 mb-12 text-center">
            Creator Success Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl">
                  🎮
                </div>
                <div>
                  <h4 className="text-slatey-200 font-semibold">PixelPunk Dev</h4>
                  <p className="text-slatey-400 text-sm">Indie Game Developer</p>
                </div>
              </div>
              <p className="text-slatey-300 italic">
                "The custom UI elements Otakumori created for my game completely transformed the
                player experience. Sales increased 40% after the visual upgrade!"
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl">
                  📺
                </div>
                <div>
                  <h4 className="text-slatey-200 font-semibold">RetroGamerTV</h4>
                  <p className="text-slatey-400 text-sm">YouTube Creator</p>
                </div>
              </div>
              <p className="text-slatey-300 italic">
                "Using Otakumori assets in my thumbnails and videos gave them that authentic retro
                feel. My channel grew from 1K to 50K subscribers in 6 months!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-slatey-200 mb-4">Ready to Collaborate?</h2>
            <p className="text-slatey-300 mb-6 text-lg">
              Fill out our simple application form and let's start creating amazing things together.
              We review applications weekly and respond to everyone.
            </p>

            <div className="space-y-4">
              <a
                href="https://forms.gle/your-form-id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-8 py-4 rounded-xl hover:bg-sakura-500/30 transition-colors font-medium text-lg"
              >
                Apply Now
              </a>

              <p className="text-sm text-slatey-400">
                Takes about 5 minutes • No commitment required
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slatey-200 mb-3">What Happens Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slatey-400">
                <div>
                  <span className="text-sakura-400 font-medium">1.</span> Submit application
                </div>
                <div>
                  <span className="text-sakura-400 font-medium">2.</span> We'll review & reach out
                </div>
                <div>
                  <span className="text-sakura-400 font-medium">3.</span> Start creating together
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slatey-200 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slatey-200 mb-3">
                Do I need a large following to apply?
              </h3>
              <p className="text-slatey-400">
                Not at all! We value creativity and passion over follower count. Whether you have
                100 or 100K followers, if you create quality content, we want to work with you.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slatey-200 mb-3">
                What types of content creators do you work with?
              </h3>
              <p className="text-slatey-400">
                Game developers, YouTubers, streamers, artists, educators, and anyone creating
                content that could benefit from retro gaming assets. We're open to all creative
                fields!
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slatey-200 mb-3">
                Is there a minimum commitment period?
              </h3>
              <p className="text-slatey-400">
                No long-term contracts or commitments. We believe in building genuine relationships.
                If it's not working for either of us, we can part ways amicably.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slatey-200 mb-3">
                Can I use the custom assets commercially?
              </h3>
              <p className="text-slatey-400">
                Absolutely! All assets we create for you are yours to use in any commercial project.
                No royalties, no restrictions - just pure creative freedom.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
