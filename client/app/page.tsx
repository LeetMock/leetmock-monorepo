// pages/index.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiMic, FiBarChart2 } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-red-900 opacity-90"></div>
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
                <stop stopColor="#FF4500" />
                <stop offset="1" stopColor="#1E90FF" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-red-500 to-blue-500 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0%", "100%", "0%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          ></motion.div>
        ))}
        {/* Moving Gradient Blobs */}
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-500 to-blue-500 rounded-full filter blur-3xl opacity-50"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-red-500 rounded-full filter blur-3xl opacity-50"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
      </motion.div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="text-4xl font-bold tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
            LeetMock
          </span>
        </div>
        <div className="flex space-x-6">
          <button className="text-lg font-medium text-white hover:text-red-500 transition duration-300">
            Login
          </button>
          <button className="px-6 py-2 text-lg font-medium text-white bg-gradient-to-r from-red-500 to-blue-500 rounded-full shadow-lg hover:shadow-red-500/50 transition duration-300">
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
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
          className="px-10 py-4 text-lg font-medium text-white bg-gradient-to-r from-red-500 to-blue-500 rounded-full shadow-lg hover:shadow-red-500/50 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>

        {/* Interactive Workspace Demo */}
        <motion.div
          className="mt-16 w-full max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {/* Replace this iframe src with your interactive demo URL */}
          <iframe
            src="https://your-interactive-workspace-demo.com"
            title="LeetMock Interactive Demo"
            className="w-full h-96 rounded-lg shadow-xl"
          ></iframe>
        </motion.div>
      </section>

      {/* Companies Using LeetMock */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Trusted by Candidates from Top Companies
          </h2>
          <div className="flex flex-wrap justify-center items-center space-x-8">
            {/* Company Logos */}
            <Image
              src="/logos/google.png"
              alt="Google"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
            <Image
              src="/logos/amazon.png"
              alt="Amazon"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
            <Image
              src="/logos/facebook.png"
              alt="Facebook"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
            <Image
              src="/logos/microsoft.png"
              alt="Microsoft"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
            <Image
              src="/logos/apple.png"
              alt="Apple"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
            <Image
              src="/logos/tesla.png"
              alt="Tesla"
              className="h-12 object-contain m-4"
              width={150}
              height={50}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-black bg-opacity-80">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-red-500">LeetMock</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <motion.div
              className="p-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition duration-500"
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

      {/* Testimonials Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Hear from Our <span className="text-red-500">Success Stories</span>
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
                  <FaQuoteLeft className="text-5xl text-red-500 opacity-70" />
                </div>
                <p className="mb-8 text-lg italic text-center">
                  &quot;LeetMock revolutionized my interview preparation. The AI feedback was
                  spot-on!&quot;
                </p>
                <div className="flex items-center justify-center">
                  <Image
                    src="/testimonials/user1.jpg"
                    alt="Alex Turner"
                    className="h-16 w-16 rounded-full mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl">Alex Turner</p>
                    <p className="text-sm text-gray-400">Software Engineer at InnovateX</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
            {/* Testimonial 2 */}
            <SwiperSlide>
              <motion.div
                className="p-12 bg-gradient-to-br from-indigo-800 to-purple-800 rounded-2xl shadow-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 flex justify-center">
                  <FaQuoteLeft className="text-5xl text-red-500 opacity-70" />
                </div>
                <p className="mb-8 text-lg italic text-center">
                  &quot;The interactive AI interviews were incredibly realistic. I felt fully
                  prepared for my real interviews.&quot;
                </p>
                <div className="flex items-center justify-center">
                  <Image
                    src="/testimonials/user2.jpg"
                    alt="Samantha Lee"
                    className="h-16 w-16 rounded-full mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl">Samantha Lee</p>
                    <p className="text-sm text-gray-400">Data Scientist at DataCorp</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
            {/* Testimonial 3 */}
            <SwiperSlide>
              <motion.div
                className="p-12 bg-gradient-to-br from-indigo-800 to-purple-800 rounded-2xl shadow-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 flex justify-center">
                  <FaQuoteLeft className="text-5xl text-red-500 opacity-70" />
                </div>
                <p className="mb-8 text-lg italic text-center">
                  &quot;LeetMock&apos;s feedback helped me identify my weaknesses. I secured a job
                  offer within weeks!&quot;
                </p>
                <div className="flex items-center justify-center">
                  <Image
                    src="/testimonials/user3.jpg"
                    alt="Michael Chen"
                    className="h-16 w-16 rounded-full mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl">Michael Chen</p>
                    <p className="text-sm text-gray-400">Full-Stack Developer at WebWorks</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-blue-900 to-black">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">
            Ready to <span className="text-red-500">Ace</span> Your Next Interview?
          </h2>
          <p className="text-xl mb-12">
            Join thousands of successful candidates. Start your journey with LeetMock today.
          </p>
          <button className="px-12 py-4 text-xl font-medium text-white bg-gradient-to-r from-red-500 to-blue-500 rounded-full shadow-lg hover:shadow-red-500/50 transition duration-300">
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
