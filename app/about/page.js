'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-6 text-5xl font-bold text-pink-400">About Otaku-m</h1>
          <p className="text-xl text-gray-300">
            Your ultimate destination for anime and gaming culture
          </p>
        </motion.div>

        {/* Creator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-2xl bg-gray-800/50 p-8 backdrop-blur-lg"
        >
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="relative h-48 w-48 overflow-hidden rounded-full">
              <Image src="/images/creator.jpg" alt="Creator" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="mb-4 text-3xl font-bold text-pink-400">Meet the Creator</h2>
              <p className="mb-4 text-gray-300">
                Hi! I'm [Your Name], a passionate anime and gaming enthusiast. I created Otaku-m to
                bring together fellow fans and provide a unique space for celebrating our shared
                interests.
              </p>
              <p className="text-gray-300">
                With years of experience in the anime and gaming community, I curate high-quality
                merchandise and create engaging content that resonates with fans worldwide.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 rounded-2xl bg-gray-800/50 p-8 backdrop-blur-lg"
        >
          <h2 className="mb-6 text-3xl font-bold text-pink-400">Our Mission</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-pink-300">Quality Merchandise</h3>
              <p className="text-gray-300">
                We partner with Printify to bring you high-quality, officially licensed merchandise
                featuring your favorite anime and gaming characters.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold text-pink-300">Community Focus</h3>
              <p className="text-gray-300">
                Our platform is designed to foster a vibrant community where fans can connect, share
                experiences, and celebrate their passion.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold text-pink-300">Interactive Experience</h3>
              <p className="text-gray-300">
                Through mini-games and rewards, we create an engaging experience that makes every
                visit to Otaku-m special.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold text-pink-300">Continuous Growth</h3>
              <p className="text-gray-300">
                We're constantly expanding our collection and adding new features to enhance your
                experience.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-gray-800/50 p-8 backdrop-blur-lg"
        >
          <h2 className="mb-6 text-3xl font-bold text-pink-400">Our Values</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/20">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-pink-300">Authenticity</h3>
                <p className="text-gray-300">
                  We stay true to the essence of anime and gaming culture, ensuring that everything
                  we offer resonates with fans.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/20">
                <span className="text-2xl">🌟</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-pink-300">Quality</h3>
                <p className="text-gray-300">
                  We maintain high standards in our merchandise and content, ensuring that fans
                  receive the best experience possible.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/20">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-pink-300">Community</h3>
                <p className="text-gray-300">
                  We foster a welcoming and inclusive environment where fans can connect and share
                  their passion.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
