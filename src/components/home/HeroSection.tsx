'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    setIsAdmin(userStr ? JSON.parse(userStr)?.role === 'admin' : false);
  }, []);

  const scrollToTables = () => {
    const tablesSection = document.getElementById('features-section');
    if (tablesSection) {
      tablesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-canteen-gray">
    <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-canteen-darkgray">
            Track Canteen Attendance with Ease
          </h1>
          <p className="text-xl text-gray-600 max-w-lg">
            Check who's present, see meal planning, and manage attendance all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={scrollToTables} className="text-white bg-canteen-blue hover:bg-canteen-blue/90">
              View Features
            </Button>
            
            {isAdmin ? (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-canteen-blue text-canteen-blue hover:text-canteen-blue/90">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-canteen-blue text-canteen-blue hover:text-canteen-blue/90">
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="hidden lg:flex justify-end">
          <div className="relative w-full max-w-lg">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-canteen-blue/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-present/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-absent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-canteen-darkgray">Canteen Overview</h3>
                    <p className="text-sm text-gray-500">Today's Attendance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-canteen-blue">75%</div>
                    <p className="text-sm text-gray-500">Present</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((table) => (
                    <div key={table} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">Table {table}</div>
                        <div className="text-xs text-gray-500">8 Students</div>
                      </div>
                      <div className="flex space-x-1">
                        {Array(6).fill(null).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-present"></div>
                        ))}
                        {Array(2).fill(null).map((_, i) => (
                          <div key={i + 6} className="w-2 h-2 rounded-full bg-absent"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HeroSection;
