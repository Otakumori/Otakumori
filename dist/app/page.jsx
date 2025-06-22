'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Home;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const link_1 = __importDefault(require('next/link'));
const CherryBlossomTree_1 = require('@/app/components/games/CherryBlossomTree');
const FeaturedProducts_1 = require('@/app/components/shop/FeaturedProducts');
const BlogPreview_1 = require('@/app/components/blog/BlogPreview');
const CommunityGallery_1 = require('@/app/components/community/CommunityGallery');
const Footer_1 = require('@/app/components/layout/Footer');
function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section with Cherry Blossom Tree */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <CherryBlossomTree_1.CherryBlossomTree />
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
        >
          <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">Welcome to Otakumori</h1>
          <p className="mb-8 max-w-2xl text-xl text-pink-300 md:text-2xl">
            Where anime meets Dark Souls in a world of cherry blossoms and mystery
          </p>
          <div className="flex gap-4">
            <link_1.default
              href="/shop"
              className="transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
            >
              Explore Shop
            </link_1.default>
            <link_1.default
              href="/blog"
              className="transform rounded-full border-2 border-pink-600 bg-transparent px-8 py-3 text-pink-600 transition-colors duration-300 hover:scale-105 hover:bg-pink-600/10"
            >
              Read Blog
            </link_1.default>
          </div>
        </framer_motion_1.motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Featured Items</h2>
            <FeaturedProducts_1.FeaturedProducts />
            <div className="mt-12 text-center">
              <link_1.default
                href="/shop"
                className="inline-block transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
              >
                View All Products
              </link_1.default>
            </div>
          </framer_motion_1.motion.div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="bg-gray-900/50 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Latest Stories</h2>
            <BlogPreview_1.BlogPreview />
            <div className="mt-12 text-center">
              <link_1.default
                href="/blog"
                className="inline-block transform rounded-full border-2 border-pink-600 bg-transparent px-8 py-3 text-pink-600 transition-colors duration-300 hover:scale-105 hover:bg-pink-600/10"
              >
                Read More
              </link_1.default>
            </div>
          </framer_motion_1.motion.div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Community Showcase</h2>
            <CommunityGallery_1.CommunityGallery />
            <div className="mt-12 text-center">
              <link_1.default
                href="/community"
                className="inline-block transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
              >
                Join Community
              </link_1.default>
            </div>
          </framer_motion_1.motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer_1.Footer />
    </main>
  );
}
