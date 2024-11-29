import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';

const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "5 mock interviews per month",
        "Basic AI feedback",
        "Access to community forum",
        "Standard problem set",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited mock interviews",
        "Advanced AI feedback",
        "Custom learning paths",
        "Premium problem set",
        "Interview performance analytics",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Team",
      price: "$99",
      period: "/month",
      features: [
        "Everything in Pro",
        "Team dashboard",
        "Progress tracking",
        "Custom company problems",
        "Dedicated support",
        "Team analytics",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`
                rounded-2xl p-8
                ${plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl'
                  : 'bg-white shadow-lg'
                }
              `}
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className={`w-5 h-5 mr-2 ${plan.highlighted ? 'text-blue-200' : 'text-blue-500'}`} />
                    <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-colors
                  ${plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;