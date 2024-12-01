'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import interviewProcess from '../../public/interview-process.svg';
import aiInterviewer from '../../public/ai-interviewer.svg';
import humanAi from '../../public/human-ai.svg';
import evaluation from '../../public/evaluation.svg';

const CoreFeatures = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  });

  const features = [
    {
      title: "Carefully Crafted Interview Process",
      description: "We've carefully crafted our problems and interview process to deliver a unique, optimized user experience that sets us apart.",
      image: interviewProcess
    },
    {
      title: "Real-Time Adaptive AI Interviewer",
      description: "The AI adjusts questions in real time and offers subtle hints, creating a true-to-life interview flow that balances challenge and support.",
      image: aiInterviewer
    },
    {
      title: "AI that feels human",
      description: "Realistic, low-latency, seamless conversations to prepare you for the real interview experience.",
      image: humanAi
    },
    {
      title: "Technical & Behavioral Personalized Evaluation",
      description: "Personalized feedback that adapts to your growth, providing detailed insights to refine both your technical and soft skills",
      image: evaluation
    },
  ];

  return (
    <div ref={ref} className="py-24 bg-gradient-to-b from-black to-blue-900">
      <div className="container mx-auto px-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`flex flex-col ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } items-center gap-12 mb-32 last:mb-0`}
          >
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-6 text-blue-300">{feature.title}</h3>
              <p className="text-xl text-blue-200 mb-8">{feature.description}</p>
              <button className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
                Read more <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="flex-1">
              <motion.div 
                className="bg-blue-900/30 rounded-xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-colors"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Image 
                  src={feature.image}
                  alt={feature.title}
                  width={500}
                  height={300}
                  className="w-full h-auto rounded-lg"
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoreFeatures;