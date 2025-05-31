// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MealTotalsCard from "@/components/home/MealTotalsCard";
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (!response.ok) throw new Error('Failed to fetch attendance data');
        const data = await response.json();
        setAttendanceSummary(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceSummary();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchAttendanceSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Navbar />
      <HeroSection />
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {isLoading ? (
          <motion.div 
            className="flex items-center justify-center py-12"
            variants={itemVariants}
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Loading Meal Data</h3>
              <p className="text-sm text-gray-500">Fetching attendance information...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <MealTotalsCard attendanceSummary={attendanceSummary} />
          </motion.div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <FeaturesSection />
      </motion.div>
      <Footer/>
    </>
  );
}
