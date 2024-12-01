'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Brain, Clock, Target } from 'lucide-react';

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personalized Evaluation",
      description: "Deep, actionable insights that fuel rapid development and real interview readiness.",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Cultivate a Good Habit",
      description: "Internalize good coding habits and muscle memory so that you can excel in real interviews.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Flexible & Effective",
      description: "Tailored, well-crafted AI, anytime, anywhere, at your own pace. No scheduling, no waiting.",
    },
  ];

  return (
    <div className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="p-8 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-cyan-400 mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">{feature.title}</h3>
              <p className="text-lg text-blue-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;