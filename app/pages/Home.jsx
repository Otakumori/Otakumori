import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import ContactForm from '../../app/components/ContactForm'; // Adjust based on actual location
export default function Home() {
  return (
    <Layout>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
        <video autoPlay loop muted className="absolute inset-0 h-full w-full object-cover">
          <source src="/videos/cherry-blossom-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-6xl font-bold text-pink-300"
          >
            Welcome to Otakumori
          </motion.h1>
          <motion.p
            className="my-4 max-w-xl text-center text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Dive into an otaku experience—shop exclusive drops, unlock seductive achievements, and
            indulge your nostalgia.
          </motion.p>
          <motion.a
            href="/shop"
            whileHover={{ scale: 1.1 }}
            className="mt-4 rounded-lg bg-pink-500 px-6 py-3 text-white transition hover:bg-pink-600"
          >
            Enter the Arena
          </motion.a>
        </div>
      </section>
    </Layout>
  );
}
