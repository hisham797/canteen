// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MealTotalsCard from "@/components/home/MealTotalsCard";
import { Loader2 } from 'lucide-react';

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

  return (
    <>
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Loading Meal Data</h3>
              <p className="text-sm text-gray-500">Fetching attendance information...</p>
            </div>
          </div>
        ) : (
          <MealTotalsCard attendanceSummary={attendanceSummary} />
        )}
      </div>
      <FeaturesSection />
      <Footer/>
    </>
  );
}
