'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

const Hero = () => {
  return (
    <div className="h-screen relative overflow-hidden bg-black flex items-center justify-center">
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>

      {/* Matrix-like falling characters */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-500/30 text-lg font-mono"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -100,
            }}
            animate={{
              y: window.innerHeight + 100,
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {String.fromCharCode(33 + Math.floor(Math.random() * 93))}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <Logo size="large" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="text-white text-4xl md:text-5xl block mt-4">
              AI Empowered Technical Mock Interviews Platform
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto">
            Leverage the latest AI to master your interviews and land your dream job with confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-[0_0_20px_rgba(0,195,255,0.5)] flex items-center"
            >
              Start Practicing Now <ArrowRight className="ml-2" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-500/10 transition-colors backdrop-blur-sm"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;