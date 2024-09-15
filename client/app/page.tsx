"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiMic, FiBarChart2 } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const HomePage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-sans">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-90"></div>
        {/* Abstract Shapes */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full opacity-10"
          >
            <circle cx="400" cy="400" r="300" fill="url(#paint0_radial)" />
            <defs>
              <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(400 400) rotate(90) scale(300)"
              >
                <stop stopColor="#FF00CC" />
                <stop offset="1" stopColor="#333399" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="text-4xl font-bold tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            LeetMock
          </span>
        </div>
        <div className="flex space-x-6">
          <button className="text-lg font-medium text-white hover:text-pink-500 transition duration-300">
            Login
          </button>
          <button className="px-6 py-2 text-lg font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:shadow-pink-500/50 transition duration-300">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Transform Your Coding Interviews
          </span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl max-w-3xl mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Experience AI-powered mock interviews like never before. Enhance your skills with instant
          feedback and personalized analysis.
        </motion.p>
        <motion.button
          className="px-10 py-4 text-lg font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:shadow-pink-500/50 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>

        {/* Animated Illustration */}
        <motion.div
          className="mt-16 w-full max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <img
            src="https://via.placeholder.com/800x400"
            alt="AI Interview Illustration"
            className="w-full h-auto"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-black bg-opacity-80">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-pink-500">LeetMock</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <motion.div
              className="p-8 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl shadow-xl hover:shadow-2xl transition duration-500"
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-6 flex justify-center">
                <FiMic className="text-6xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Voice-Powered AI Interviews</h3>
              <p className="text-center text-white">
                Interact with advanced AI voice assistants for a realistic interview experience.
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              className="p-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl shadow-xl hover:shadow-2xl transition duration-500"
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-6 flex justify-center">
                <FiCode className="text-6xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Diverse Practice Modes</h3>
              <p className="text-center text-white">
                From behavioral to system design, practice all interview types with guided
                assistance.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              className="p-8 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl shadow-xl hover:shadow-2xl transition duration-500"
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-6 flex justify-center">
                <FiBarChart2 className="text-6xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Comprehensive Feedback</h3>
              <p className="text-center text-white">
                Get detailed reports on your performance to pinpoint areas for improvement.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl opacity-50"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-50"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Hear from Our <span className="text-pink-500">Success Stories</span>
          </h2>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            centeredSlides
            loop
            autoplay={{ delay: 6000 }}
            className="max-w-3xl mx-auto"
          >
            {/* Testimonial 1 */}
            <SwiperSlide>
              <motion.div
                className="p-12 bg-gradient-to-br from-indigo-800 to-purple-800 rounded-2xl shadow-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 flex justify-center">
                  <FaQuoteLeft className="text-5xl text-pink-500 opacity-70" />
                </div>
                <p className="mb-8 text-lg italic text-center">
                  "LeetMock revolutionized my interview preparation. The AI feedback was spot-on!"
                </p>
                <div className="flex items-center justify-center">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="User 1"
                    className="h-16 w-16 rounded-full mr-4"
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl">Alex Turner</p>
                    <p className="text-sm text-gray-400">Software Engineer at InnovateX</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
            {/* Additional testimonials... */}
          </Swiper>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-purple-900 to-black">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">
            Ready to <span className="text-pink-500">Ace</span> Your Next Interview?
          </h2>
          <p className="text-xl mb-12">
            Join thousands of successful candidates. Start your journey with LeetMock today.
          </p>
          <button className="px-12 py-4 text-xl font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:shadow-pink-500/50 transition duration-300">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-8 py-6 bg-black text-center">
        <p>&copy; {new Date().getFullYear()} LeetMock. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
