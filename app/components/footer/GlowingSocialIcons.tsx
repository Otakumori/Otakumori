'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

interface SocialIcon {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const socialIcons: SocialIcon[] = [
  { name: 'Github', icon: Github, href: '#', color: '#ffffff' },
  { name: 'Twitter', icon: Twitter, href: '#', color: '#1DA1F2' },
  { name: 'Instagram', icon: Instagram, href: '#', color: '#E4405F' },
  { name: 'Youtube', icon: Youtube, href: '#', color: '#FF0000' },
];

export function GlowingSocialIcons() {
  return (
    <div className="flex gap-4">
      {socialIcons.map((social, index) => {
        const Icon = social.icon;
        return (
          <motion.a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-lg group"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: social.color }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            <Icon className="relative z-10 w-6 h-6 text-white group-hover:text-pink-300 transition-colors" />
          </motion.a>
        );
      })}
    </div>
  );
}

