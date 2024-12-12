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
      title: "Interview & Evaluation with AI",
      description: "Get personalized feedback and strategic insights to master coding interviews and accelerate your technical growth.",
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
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-6 glow-text">
            Supercharge Your Interview Prep
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Master technical interviews with our AI-powered platform designed for your success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group p-8 rounded-2xl border border-blue-500/20 
                bg-blue-950/10 backdrop-blur-sm
                hover:border-blue-400/40 transition-all duration-300
                hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="text-blue-400 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">{feature.title}</h3>
              <p className="text-blue-200 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;