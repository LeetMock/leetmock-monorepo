'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import interviewProcess from '../../public/feature1.png';
import aiInterviewer from '../../public/ai-interviewer.svg';
import humanAi from '../../public/feature2.png';
import evaluation from '../../public/feature3.png';
import Link from 'next/link';

const CoreFeatures = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      title: "Carefully Crafted Interview Process",
      description: "We've meticulously designed our interview problems and process to deliver an exceptional experience. Our platform combines industry-standard questions with innovative scenarios, ensuring you're well-prepared for both traditional and modern interview approaches.",
      image: interviewProcess,
      href: "/features/interview-process"
    },
    {
      title: "AI that feels human",
      description: "Our advanced AI technology delivers natural, engaging conversations with minimal latency. You'll interact with an interviewer that understands context, asks relevant follow-up questions, and provides meaningful feedback – creating an experience so authentic, you'll forget you're practicing with AI.",
      image: humanAi,
      href: "/features/ai-interviewer"
    },
    {
      title: "Technical & Behavioral Personalized Evaluation",
      description: "Receive comprehensive feedback that goes beyond basic code assessment. Our AI evaluates your technical proficiency, problem-solving approach, communication skills, and behavioral competencies. Each session generates detailed insights and actionable recommendations to help you improve across all dimensions of interview performance.",
      image: evaluation,
      href: "/features/evaluation"
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-6 glow-text">
            Our Core Advantages
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Experience the next generation of interview preparation
          </p>
        </motion.div>

        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-16 mb-40 last:mb-0`}
          >
            <div className="flex-1 text-left">
              <h3 className="text-3xl font-bold mb-6 text-blue-400">{feature.title}</h3>
              <p className="text-xl text-blue-200 mb-8 leading-relaxed">{feature.description}</p>
              <div className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-not-allowed transition-colors">
                <span>Read more</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                <span className="text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="flex-1">
              <motion.div
                className="bg-blue-950/10 rounded-2xl p-8 border border-blue-500/20 
                  hover:border-blue-400/40 transition-all duration-300
                  hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10
                  backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={500}
                  height={300}
                  className="w-full h-auto rounded-xl"
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CoreFeatures;