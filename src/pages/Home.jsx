import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import ContactForm from '../../app/components/ContactForm';  // Adjust based on actual location
export default function Home() {
  return (
    <Layout>
      <section className="relative overflow-hidden flex flex-col justify-center items-center min-h-screen text-center">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/cherry-blossom-loop.mp4" type="video/mp4"/>
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-6xl text-pink-300 font-bold">
            Welcome to Otakumori
          </motion.h1>
          <motion.p 
            className="text-gray-200 my-4 text-center max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Dive into an otaku experience—shop exclusive drops, unlock seductive achievements, and indulge your nostalgia.
          </motion.p>
          <motion.a href="/shop" 
            whileHover={{ scale: 1.1 }}
            className="mt-4 bg-pink-500 px-6 py-3 rounded-lg text-white hover:bg-pink-600 transition"
          >
            Enter the Arena
          </motion.a>
        </div>
      </section>
    </Layout>
  );
}
