import { generateSEO } from '@/app/lib/seo';
import { type Metadata } from 'next';
import { sanitizeContent } from '../lib/content-sanitizer';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/help',
  });
}
export default function HelpCenter() {
  const faqs = [
    {
      question: 'How do I earn petals?',
      answer:
        'Petals are earned by playing mini-games, completing achievements, and participating in community activities. Check your petal balance in the top right corner.',
    },
    {
      question: 'What are runes and how do I use them?',
      answer:
        'Runes are special currency for exclusive items and upgrades. Collect them through high scores and special events.',
    },
    {
      question: 'How do I save my game progress?',
      answer:
        'Game progress is automatically saved when you are signed in. Each game supports multiple save slots for different playthroughs.',
    },
    {
      question: 'Can I play games without an account?',
      answer:
        'Some games are available as guests, but signing in unlocks save data, achievements, and community features.',
    },
    {
      question: 'How do I customize my profile?',
      answer:
        'Visit your profile page to update your avatar, display name, and visibility settings. Unlock more customization options through gameplay.',
    },
    {
      question: 'What is the GameCube interface?',
      answer:
        'Our retro-inspired game hub featuring authentic boot sequences and memory card aesthetics. Access all mini-games through this nostalgic interface.',
    },
    {
      question: 'How do wishlists work?',
      answer:
        'Heart items in the shop to add them to your wishlist. Track prices and get notified of sales on your favorite products.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'Use the contact form or email us directly. We typically respond within 24 hours during business days.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {sanitizeContent('Help Center')}
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              {sanitizeContent(
                'Find answers to common questions about your journey through Otaku-mori.',
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
              <p className="text-zinc-300 text-sm">
                New to Otaku-mori? Learn the basics of gaming, shopping, and earning petals.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">Account & Profile</h3>
              <p className="text-zinc-300 text-sm">
                Manage your account settings, privacy, and profile customization options.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">Mini-Games</h3>
              <p className="text-zinc-300 text-sm">
                Learn game controls, save systems, and how to master each mini-game.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-white/10 last:border-b-0 pb-6 last:pb-0"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {sanitizeContent(faq.question)}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{sanitizeContent(faq.answer)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl border border-pink-500/30 p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Still need help?</h3>
              <p className="text-zinc-300 mb-6">
                {sanitizeContent(
                  "Can't find what you're looking for? Our support team is here to help.",
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:help@otaku-mori.com"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
