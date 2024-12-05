'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const CallToAction = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="py-24 bg-black relative overflow-hidden">
      {/* Neural network visualization */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            animate={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="h-2 w-2 bg-blue-400/30 rounded-full shadow-[0_0_30px_rgba(0,195,255,0.5)]" />
            {[...Array(3)].map((_, j) => (
              <motion.div
                key={j}
                className="absolute h-px w-32 origin-left"
                style={{
                  background: 'linear-gradient(90deg, rgba(0,195,255,0.3) 0%, transparent 100%)',
                  transform: `rotate(${j * 120}deg)`,
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-blue-400 mb-6 glow-text"
          >
            Enter the Future of Technical Interviews
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-blue-200 mb-10"
          >
            Join the next generation of developers mastering their technical interviews with AI
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-[0_0_20px_rgba(0,195,255,0.5)] flex items-center justify-center"
            >
              Initialize System <ArrowRight className="ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;