// app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Clock, ShieldCheck, Leaf, Smartphone, Quote } from "lucide-react";
import Link from "next/link";
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Heading */}
      <div className="text-center pt-10 sm:pt-12 mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
          About Us
        </h2>
      </div>

      {/* Hero Section */}
      <section
        className="pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 "
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#F1F1F4] dark:border-[#333333] rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 md:p-12 lg:p-16 ">
            
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6 ">
              <span className="text-lg sm:text-xl">🍽️</span>
              <p className="text-[#7B7B7B] dark:text-[#A0A0A0] text-sm sm:text-base lg:text-lg font-normal">
                Revolutionizing campus dining since 2023
              </p>
            </div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-black dark:text-white font-semibold leading-tight mb-3 sm:mb-4  "
              style={{ fontSize: "clamp(24px, 5vw, 64px)" }}
            >
              No more waiting,
             
              <br className="hidden sm:block" />
             
              Just Eating.
            </motion.h1>

            {/* Subheading */}
            <p className="text-[#7B7B7B] dark:text-[#A0A0A0] text-sm sm:text-base md:text-lg lg:text-xl">
              Where technology meets hunger, and students meet convenience
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left */}
          <div>
            <h2
              className="text-black dark:text-white font-bold leading-tight mb-6 sm:mb-8"
              style={{ fontSize: "clamp(24px, 4vw, 42px)" }}
            >
              Born from the everyday hustle of college life
            </h2>
            <div className="space-y-4 sm:space-y-6 text-[#666666] dark:text-[#A0A0A0] leading-relaxed">
              <p className="text-base sm:text-lg">
                At <span className="font-semibold text-black dark:text-white">Campus Bites</span>, we believe
                food should be quick, convenient, and student-friendly.
              </p>
              <p className="text-base sm:text-lg">
                Powered by <span className="font-semibold text-black dark:text-white">SMARTDESH TECHNOLOGIES LLP</span>, 
                Campus Bites is more than just a food ordering app — it’s a movement.
              </p>
              <p className="text-base sm:text-lg">
                No more standing in long queues — just smart, seamless food ordering.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#1a1a2e] dark:to-[#16213e] rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-64 sm:h-80 md:h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
              <img src="/Food & Beverage.gif" alt="Digital India GIF" className="w-100 h-100 object-contain rounded-lg" />
              </div>
              <p className="text-lg sm:text-xl font-semibold text-black dark:text-white">Digital India</p>
              <p className="text-xs sm:text-sm md:text-base text-[#666666] dark:text-[#A0A0A0] mt-2">
                Empowering technology for a smarter future
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-background text-foreground">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-center text-black dark:text-white font-bold mb-10 sm:mb-16"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Our mission drives our vision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <InfoCard
              icon="🎯"
              title="Our Mission"
              desc="To make campus dining faster, healthier, and smarter by bridging the gap between students and canteens with technology."
            />
            <InfoCard
              icon="🚀"
              title="Our Vision"
              desc="To become India’s most trusted student-focused food platform, bringing convenience, hygiene, and eco-friendly practices to every campus — all while moving forward under the vision of our Hon’ble Prime Minister Shri Narendra Modi’s Digital India initiative, which empowers the nation to embrace technology for a smarter and more connected future."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-black dark:text-white font-bold mb-6 text-2xl sm:text-3xl lg:text-4xl">
            Built by students, for students with ❤️ in India
          </h2>
          <p className="text-[#666666] dark:text-[#A0A0A0] text-sm sm:text-base md:text-lg mb-12 sm:mb-16 max-w-2xl mx-auto">
            We designed Campus Bites to solve real problems faced by students.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ">
            <FeatureCard icon={<Smartphone />} title="Easy Ordering" desc="Browse menus, place orders, and pay securely." color="blue" index={0} />
            <FeatureCard icon={<Clock />} title="Zero Queues" desc="Skip the wait — grab your food instantly when it’s ready." color="green" index={1} />
            <FeatureCard icon={<ShieldCheck />} title="Hygiene First" desc="Partner canteens follow strict food safety standards." color="purple" index={2} />
            <FeatureCard icon={<Users />} title="Student-Centric" desc="Built by students, for students." color="orange" index={3} />
            <FeatureCard icon={<Leaf />} title="Eco-Friendly" desc="Encouraging biodegradable packaging & sustainability." color="teal" index={4} />
          </div>
        </div>
      </section>

      {/* Founder’s Note */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-background text-foreground">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-[#1E1E1E] border border-[#E9EBF0] dark:border-[#333333] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Image */}
              <div className="relative w-full max-w-xs sm:max-w-sm mx-auto md:mx-0">
                <img
                  src="/Founder-CB.jpg"
                  alt="Garv Saluja - Founder | Campus Bites"
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                />
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h2 className="text-black dark:text-white font-bold mb-3 sm:mb-4 text-2xl sm:text-3xl">
                  Founder’s Note
                </h2>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 sm:mb-6">
                  Garv Saluja <br /> Founder, Campus Bites
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-[#666666] dark:text-[#A0A0A0] mb-4">
                  Campus Bites was born from a simple observation: students spend too much time waiting in queues instead of focusing on what truly matters.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-[#666666] dark:text-[#A0A0A0]">
                  It’s not just a food ordering app — it’s a step toward transforming campus life with innovation and convenience.
                </p>
                <blockquote className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl italic text-sm sm:text-base">
                  "Entrepreneurship is about solving problems that impact lives — starting with the lives of students around me."
                </blockquote>
                <p className="mt-2 font-semibold text-blue-600 dark:text-blue-400">
                  — Garv Saluja
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative rounded-[16px] sm:rounded-[24px] mx-4 sm:mx-6 mb-6 overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-8 text-center bg-gradient-to-br from-blue-50 to-white dark:from-[#1a2332] dark:to-[#121212]">
        <h2 className="text-black dark:text-white font-extrabold mb-6 sm:mb-8 text-2xl sm:text-3xl lg:text-4xl leading-tight">
          Food should fuel your journey, not slow it down ✨
        </h2>
        <p className="text-[#666666] dark:text-[#A0A0A0] text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-xl mx-auto">
          Join thousands of students revolutionizing campus dining
        </p>
        <Link href="/">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg text-sm sm:text-base">
          Get Campus Bites
        </button>
        </Link>
      </section>
    </div>
  );
}

/* Components */
type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
};

function InfoCard({ icon, title, desc, delay = 0 }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-[#1E1E1E] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-md"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-lg sm:text-2xl">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
        {title}
      </h3>
      <p className="text-sm sm:text-base md:text-lg text-[#666666] dark:text-[#A0A0A0]">{desc}</p>
    </motion.div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "blue" | "green" | "purple" | "orange" | "teal";
  index: number;
};

function FeatureCard({ icon, title, desc, color, index }: FeatureCardProps) {
  const colors: Record<FeatureCardProps["color"], string> = {
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    teal: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white dark:bg-[#1E1E1E] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition flex items-center flex-col "
    >
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-[#666666] dark:text-[#A0A0A0]">{desc}</p>
    </motion.div>
  );
}
