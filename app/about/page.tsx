'use client';

import React from "react";
import { motion } from "framer-motion";
import SiteLayout from "../../components/layout/SiteLayout";

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="py-10">
        <div className="mx-auto max-w-4xl px-3 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 grid place-items-center"
            >
              <div className="text-6xl">👑</div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-neutral-100 mb-4"
            >
              Meet <span className="text-pink-300">Adrianna</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-neutral-300 mb-6"
            >
              Founder • Designer • Lore-Architect
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 text-sm text-neutral-400"
            >
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300">INFJ-T</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">Aquarius ♒</span>
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300">Dark-Cute Evangelist</span>
            </motion.div>
          </div>

          {/* Story Sections */}
          <div className="space-y-12">
            {/* Vision */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur"
            >
              <h2 className="text-2xl font-bold text-pink-200 mb-4">The Vision</h2>
              <p className="text-neutral-300 leading-relaxed mb-4">
                Otakumori was born from a simple belief: anime fans deserve more than mass-produced merchandise. 
                We deserve pieces that carry meaning, tell stories, and reflect the depth of our connection to the medium we love.
              </p>
              <p className="text-neutral-300 leading-relaxed">
                Every design starts with lore. Every product carries intention. We're building a sanctuary 
                for fans who want their aesthetic choices to reflect their inner complexity—dark, cute, and unapologetically deep.
              </p>
            </motion.section>

            {/* Journey */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur"
            >
              <h2 className="text-2xl font-bold text-pink-200 mb-4">The Journey</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-neutral-200">2020: The Spark</h3>
                    <p className="text-neutral-400 text-sm">Started designing custom pins for friends in the anime community</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-neutral-200">2022: Dark-Cute Philosophy</h3>
                    <p className="text-neutral-400 text-sm">Developed the core aesthetic that balances shadow and light</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-neutral-200">2024: Otakumori Launch</h3>
                    <p className="text-neutral-400 text-sm">Bringing lore-driven commerce to the anime community</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Philosophy */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur"
            >
              <h2 className="text-2xl font-bold text-pink-200 mb-4">Design Philosophy</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🌸</div>
                  <h3 className="font-semibold text-neutral-200 mb-2">Minimal Maximalism</h3>
                  <p className="text-neutral-400 text-sm">Less is more, but make it deep. Every element serves both form and meaning.</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🌙</div>
                  <h3 className="font-semibold text-neutral-200 mb-2">Dark-Cute Balance</h3>
                  <p className="text-neutral-400 text-sm">Embracing the shadows while celebrating the light within.</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📖</div>
                  <h3 className="font-semibold text-neutral-200 mb-2">Lore-First Design</h3>
                  <p className="text-neutral-400 text-sm">Every piece tells a story that resonates with fan culture.</p>
                </div>
              </div>
            </motion.section>

            {/* Personal */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur"
            >
              <h2 className="text-2xl font-bold text-pink-200 mb-4">Beyond the Brand</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-neutral-200 mb-3">Current Obsessions</h3>
                  <ul className="space-y-2 text-neutral-400 text-sm">
                    <li>• Exploring the intersection of gaming and fashion</li>
                    <li>• Studying Japanese minimalist design principles</li>
                    <li>• Building community through shared aesthetics</li>
                    <li>• Seasonal storytelling and limited drops</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-200 mb-3">Favorite Anime</h3>
                  <ul className="space-y-2 text-neutral-400 text-sm">
                    <li>• Serial Experiments Lain</li>
                    <li>• Spirited Away</li>
                    <li>• Death Note</li>
                    <li>• Your Name</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Connect */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-8 rounded-3xl border border-pink-400/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur text-center"
            >
              <h2 className="text-2xl font-bold text-pink-200 mb-4">Let's Connect</h2>
              <p className="text-neutral-300 mb-6">
                Always excited to connect with fellow fans, creators, and anyone passionate about meaningful design.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-6 py-3 rounded-2xl border border-pink-400/50 bg-neutral-900/70 text-pink-200 hover:bg-pink-500/20 transition-colors">
                  📧 Email
                </button>
                <button className="px-6 py-3 rounded-2xl border border-purple-400/50 bg-neutral-900/70 text-purple-200 hover:bg-purple-500/20 transition-colors">
                  🐦 Twitter
                </button>
                <button className="px-6 py-3 rounded-2xl border border-blue-400/50 bg-neutral-900/70 text-blue-200 hover:bg-blue-500/20 transition-colors">
                  📸 Instagram
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
