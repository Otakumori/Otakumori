// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';
import PetalLayer from '@/app/components/PetalLayer';

export default function AboutMe() {
  return (
    <>
      <PetalLayer />
      <main className="relative mx-auto max-w-6xl px-6 py-16 text-pink-100">
        {/* Hero Section */}
        <section className="relative z-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-pink-300 drop-shadow-sm">
              About Otaku-mori
            </h1>
            <p className="text-xl text-pink-200/90 max-w-3xl mx-auto leading-relaxed">
              Where anime culture meets community, creativity, and endless possibilities. Built by
              otaku, for otaku.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <GlassCard className="p-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-pink-300 mb-6">Our Mission</h2>
              <p className="text-lg text-pink-100/95 leading-relaxed max-w-4xl mx-auto">
                To create a vibrant, inclusive space where anime fans can connect, create, and
                celebrate their passion. We believe in the power of community, the joy of discovery,
                and the magic that happens when creativity meets technology.
              </p>
            </motion.div>
          </GlassCard>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 mb-16">
          <motion.h2
            className="text-3xl font-bold text-pink-300 text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            What Makes Us Special
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎮',
                title: 'Mini-Games Hub',
                description: 'Engaging anime-themed games with petal economy and leaderboards',
              },
              {
                icon: '👥',
                title: 'Community Features',
                description:
                  'Connect with fellow otaku through friends, chat, and shared experiences',
              },
              {
                icon: '🏆',
                title: 'Achievement System',
                description: 'Unlock rewards, climb leaderboards, and showcase your progress',
              },
              {
                icon: '🛍️',
                title: 'Anime Merchandise',
                description: 'Curated collection of anime-inspired products and exclusive items',
              },
              {
                icon: '📝',
                title: 'Blog & Content',
                description: 'Thoughtful articles, reviews, and insights from the anime community',
              },
              {
                icon: '🌸',
                title: 'Beautiful Design',
                description: 'Immersive sakura-themed experience with attention to every detail',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <GlassCard className="p-6 h-full text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-pink-300 mb-3">{feature.title}</h3>
                  <p className="text-pink-100/90 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="relative z-10 mb-16">
          <GlassCard className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <h2 className="text-3xl font-bold text-pink-300 mb-6 text-center">
                The Story Behind Otaku-mori
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-pink-100/95 leading-relaxed">
                <p>
                  Otaku-mori began as a passion project born from late-night anime marathons and the
                  desire to create something truly special for the anime community. What started as
                  a simple idea has evolved into a comprehensive platform that celebrates everything
                  we love about anime culture.
                </p>
                <p>
                  We believe that being an otaku isn�t just about watching anime � it�s about the
                  connections we make, the creativity we express, and the community we build
                  together. Every feature, every design choice, and every line of code is crafted
                  with this philosophy in mind.
                </p>
                <p>
                  From the sakura petals that dance across your screen to the mini-games that
                  challenge your skills, every element is designed to create an immersive, joyful
                  experience that feels authentically anime.
                </p>
              </div>
            </motion.div>
          </GlassCard>
        </section>

        {/* Values Section */}
        <section className="relative z-10 mb-16">
          <motion.h2
            className="text-3xl font-bold text-pink-300 text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Our Values
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Inclusivity',
                description:
                  'Everyone is welcome here, regardless of their anime knowledge level or background.',
              },
              {
                title: 'Creativity',
                description:
                  'We encourage self-expression and celebrate the unique ways people engage with anime culture.',
              },
              {
                title: 'Community',
                description:
                  'Building meaningful connections between fans is at the heart of everything we do.',
              },
              {
                title: 'Quality',
                description:
                  'We strive for excellence in every feature, design choice, and user experience.',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-pink-300 mb-3">{value.title}</h3>
                  <p className="text-pink-100/90 leading-relaxed">{value.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-center"
          >
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold text-pink-300 mb-6">Join Our Community</h2>
              <p className="text-lg text-pink-100/95 mb-8 max-w-2xl mx-auto">
                Ready to dive into the world of Otaku-mori? Start your journey today and discover
                what makes our community special.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlassButton href="/mini-games" variant="primary" className="text-lg px-8 py-3">
                  Explore Mini-Games
                </GlassButton>
                <GlassButton href="/community" variant="secondary" className="text-lg px-8 py-3">
                  Join Community
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 mt-20 border-t border-pink-300/20 pt-6 text-sm text-pink-300/60">
          <div className="text-center space-y-2">
            <p>Built with passion, creativity, and endless anime marathons.</p>
            <p>
              Questions? Reach out:{' '}
              <a href="mailto:adi@otaku-mori.com" className="underline hover:text-pink-200">
                adi@otaku-mori.com
              </a>
            </p>
            <p className="mt-4">
              <a href="/privacy" className="underline hover:text-pink-200 mr-4">
                Privacy Policy
              </a>
              <a href="/terms" className="underline hover:text-pink-200 mr-4">
                Terms of Service
              </a>
              <a href="/cookies" className="underline hover:text-pink-200">
                Cookie Policy
              </a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

