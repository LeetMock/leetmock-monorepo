'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    name: "Jassica Wu",
    role: "Software Engineer",
    content: "I love practicing coding interviews with LeetMock. Its personalized feedback helps me sharpen my skills in ways no other platform has before.",
  },
  {
    name: "Alex G.",
    role: "Backend Engineer",
    content: "A game changer! The feedback and practice have been invaluable. It gave me so much confidence for my real interviews. Honestly, it's the closest I've felt to the real deal.",
  },
  {
    name: "Taylor R.",
    role: "Career Switcher",
    content: "I was surprised by how challenging and supportive the AI was. It felt like I had a genuine interview experience that pushed me to do better each time.",
  },
  {
    name: "Kyle H.",
    role: "Data Engineer",
    content: "The hints during interviews were great—it felt like I had a coach pushing me, but not too much. This balance kept me motivated and helped me improve steadily.",
  },
  {
    name: "Jake S.",
    role: "Student",
    content: "The AI felt so natural that I forgot I was talking to a bot most of the time. The real-time interaction made the whole experience much more effective.",
  },
  {
    name: "Xuchen P.",
    role: "Full-Stack Developer",
    content: "I liked that I could practice whenever I wanted without needing to find someone to do a mock interview with. It made interview prep so much more convenient and consistent.",
  },
];

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-blue-300">
            We have some fans.
          </h2>
          <p className="text-xl text-blue-200">
            95% of users say LeetMock.AI is more effective than other tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-blue-900/20 p-8 rounded-xl border border-blue-500/30"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/30 mr-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-300">{testimonial.name}</h3>
                  <p className="text-blue-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-blue-200">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;