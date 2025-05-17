'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'What is Otaku-m?',
    answer:
      'Otaku-m is a premium destination for anime and gaming enthusiasts, offering high-quality merchandise, interactive experiences, and a vibrant community space. We combine curated products with engaging features like mini-games and rewards to create a unique platform for fans.',
  },
  {
    question: 'How do I earn rewards?',
    answer:
      'You can earn rewards by participating in our mini-games, completing daily tasks, and engaging with the community. The cherry blossom collection game is just one example - collect petals to earn points and unlock exclusive content and discounts.',
  },
  {
    question: 'Is the merchandise officially licensed?',
    answer:
      'Yes, all our merchandise is officially licensed and produced through our partnership with Printify. We ensure that all products meet high-quality standards and respect intellectual property rights.',
  },
  {
    question: 'How do I track my order?',
    answer:
      "Once your order is placed, you'll receive a confirmation email with tracking information. You can also check your order status in your account dashboard. We use reliable shipping partners to ensure your items arrive safely.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, PayPal, and other popular payment methods. All transactions are secure and encrypted. We also support various regional payment options to accommodate our international customers.',
  },
  {
    question: 'How do I participate in the community?',
    answer:
      'You can join our community by creating an account and participating in discussions, sharing your collections, and engaging with other members. We also have a Discord server where members can connect and share their experiences.',
  },
  {
    question: 'Are there age restrictions?',
    answer:
      'Some content, particularly in the Abyss section, is restricted to users 18 and older. We implement age verification to ensure appropriate access to content. The main platform is suitable for all ages, but parental guidance is recommended for younger users.',
  },
  {
    question: 'How often is new merchandise added?',
    answer:
      'We regularly update our collection with new merchandise, typically adding new items weekly. We also take into account seasonal releases and popular trends in anime and gaming to ensure our offerings remain fresh and relevant.',
  },
  {
    question: 'Can I return or exchange items?',
    answer:
      'Yes, we offer a 30-day return policy for most items. Products must be unused and in their original packaging. Custom or personalized items may have different return policies, which will be clearly stated on the product page.',
  },
  {
    question: 'How do I stay updated with new features?',
    answer:
      'You can stay updated by following our social media accounts, subscribing to our newsletter, or checking the blog section regularly. We also send notifications to registered users about new features, products, and events.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-6 text-5xl font-bold text-pink-400">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">Find answers to common questions about Otaku-m</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
              >
                <span className="text-lg font-semibold text-pink-300">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  className="text-pink-400"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-300">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-pink-400">Still have questions?</h2>
          <p className="mb-6 text-gray-300">Feel free to reach out to our support team</p>
          <a
            href="mailto:support@otaku-m.com"
            className="inline-block rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
