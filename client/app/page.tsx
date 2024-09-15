"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { FiCode, FiMic, FiBarChart2 } from "react-icons/fi"; // Importing icons
import { FaQuoteLeft } from "react-icons/fa"; // For testimonials

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-96 h-96 bg-purple-700 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-pink-700 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="text-3xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            LeetMock
          </span>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-lg">
            Login
          </Button>
          <Button className="text-lg">Sign Up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI-Powered Mock Interviews
          </span>
          <br />
          Elevate Your Coding Skills
        </h1>
        <p className="text-xl max-w-2xl mb-12">
          Practice coding interviews with advanced AI. Get instant feedback and detailed analysis to
          improve your interview performance.
        </p>
        <Button className="px-12 py-4 text-xl">Get Started</Button>
      </section>

      {/* Companies Section */}
      <section className="relative z-10 py-12 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Trusted by Candidates From</h2>
          <div className="flex overflow-x-auto space-x-8 py-4 px-2 justify-center items-center">
            {/* Company Logos */}
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 1"
              className="h-12 object-contain"
            />
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 2"
              className="h-12 object-contain"
            />
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 3"
              className="h-12 object-contain"
            />
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 4"
              className="h-12 object-contain"
            />
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 5"
              className="h-12 object-contain"
            />
            <img
              src="https://via.placeholder.com/150x50"
              alt="Company 6"
              className="h-12 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Our Cutting-Edge Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <Card className="p-8 bg-transparent hover:bg-gray-800 transition duration-300 rounded-lg shadow-lg">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <FiMic className="text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">AI Voice Assistant</h3>
              <p className="text-center text-gray-300">
                Engage in realistic interviews with AI-powered voice assistants using GPT-4, Claude,
                and LLaMA models.
              </p>
            </Card>
            {/* Feature 2 */}
            <Card className="p-8 bg-transparent hover:bg-gray-800 transition duration-300 rounded-lg shadow-lg">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full">
                  <FiCode className="text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Diverse Interview Types</h3>
              <p className="text-center text-gray-300">
                Practice behavioral, system design, coding interviews, and general coding with
                guided assistance.
              </p>
            </Card>
            {/* Feature 3 */}
            <Card className="p-8 bg-transparent hover:bg-gray-800 transition duration-300 rounded-lg shadow-lg">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full">
                  <FiBarChart2 className="text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Detailed Feedback</h3>
              <p className="text-center text-gray-300">
                Receive comprehensive analysis reports covering communication, problem-solving, and
                technical skills.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Product Demo</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Product Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            centeredSlides
            loop
            autoplay={{ delay: 5000 }}
            className="max-w-4xl mx-auto"
          >
            {/* Testimonial 1 */}
            <SwiperSlide>
              <Card className="p-12 bg-gray-800 bg-opacity-80 rounded-xl shadow-xl">
                <div className="mb-6 flex justify-center">
                  <FaQuoteLeft className="text-6xl text-purple-500 opacity-50" />
                </div>
                <p className="mb-8 text-lg italic text-center">
                  &quot;LeetMock helped me land my dream job! The AI interviews felt real, and the
                  feedback was invaluable.&quot;
                </p>
                <div className="flex items-center justify-center">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="User 1"
                    className="h-16 w-16 rounded-full mr-4"
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl">Jane Doe</p>
                    <p className="text-sm text-gray-400">Software Engineer at TechCorp</p>
                  </div>
                </div>
              </Card>
            </SwiperSlide>
            {/* Additional testimonials... */}
          </Swiper>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Pricing Plans</h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:space-x-12">
            {/* Free Plan */}
            <Card className="p-12 bg-gray-800 bg-opacity-60 text-center mb-8 md:mb-0 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-3xl font-bold mb-4">Free Plan</h3>
              <p className="text-2xl mb-6">Free</p>
              <ul className="mb-8 space-y-2 text-left">
                <li>✔️ 3 Interviews per Month</li>
                <li>✔️ Access to Basic Features</li>
              </ul>
              <Button className="px-12 py-4 text-xl">Sign Up for Free</Button>
            </Card>
            {/* Pro Plan */}
            <Card className="p-12 bg-gradient-to-br from-purple-600 to-pink-600 text-center rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-3xl font-bold mb-4 text-white">Pro Plan</h3>
              <p className="text-2xl mb-6 text-white">$0.10 per Minute</p>
              <ul className="mb-8 space-y-2 text-left text-white">
                <li>✔️ Unlimited Interviews</li>
                <li>✔️ Advanced AI Models</li>
                <li>✔️ Detailed Analytics</li>
                <li>✔️ Priority Support</li>
              </ul>
              <Button className="px-12 py-4 text-xl bg-white text-purple-600">
                Upgrade to Pro
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 bg-gray-900 text-center">
        <p>&copy; {new Date().getFullYear()} LeetMock. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
