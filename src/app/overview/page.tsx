'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Loader2 } from 'lucide-react';
import MealAttendanceTable from '@/components/tables/MealAttendanceTable';
import { toast } from 'sonner';

type Campus = 'dawa academy' | 'hifz' | 'daiya stafs' | 'ayadi' | 'office stafs';

interface Student {
  _id: string;
  fullName: string;
  class: string;
  admissionNumber: string;
  campus: string;
  isSick?: boolean;
}

interface MealAttendance {
  present: number;
  absent: number;
  sick: number;
  presentStudents: Student[];
  absentStudents: Student[];
  sickStudents: Student[];
  campusTotals: Record<Campus, number>;
}

interface AttendanceSummary {
  coffee: MealAttendance;
  breakfast: MealAttendance;
  lunch: MealAttendance;
  tea: MealAttendance;
  dinner: MealAttendance;
  totalSick: number;
  sickStudents: Student[];
}

const AVAILABLE_CAMPUSES: Campus[] = ['dawa academy', 'hifz', 'daiya stafs', 'ayadi', 'office stafs'];

const Overview = () => {
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataHidden, setIsDataHidden] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchAttendanceSummary();
    fetchVisibilityState();
    fetchAdminStatus();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchAttendanceSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      
      // Process data for all campuses
      const processedData: AttendanceSummary = {
        coffee: processMealData(data.coffee),
        breakfast: processMealData(data.breakfast),
        lunch: processMealData(data.lunch),
        tea: processMealData(data.tea),
        dinner: processMealData(data.dinner),
        totalSick: data.totalSick,
        sickStudents: data.sickStudents
      };
      
      setAttendanceSummary(processedData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const processMealData = (mealData: any) => {
    if (!mealData) return {
      present: 0,
      absent: 0,
      sick: 0,
      presentStudents: [],
      absentStudents: [],
      sickStudents: [],
      campusTotals: {}
    };
    
    return {
      ...mealData,
      campusTotals: mealData.campusTotals || {}
    };
  };

  const fetchVisibilityState = async () => {
    try {
      const response = await fetch('/api/attendance/visibility');
      if (!response.ok) throw new Error('Failed to fetch visibility state');
      const data = await response.json();
      setIsDataHidden(data.isHidden);
      setHideReason(data.reason);
    } catch (error) {
      console.error('Error fetching visibility state:', error);
    }
  };

  const fetchAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/status');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error fetching admin status:', error);
      setIsAdmin(false); // Default to non-admin on error
    }
  };

  const mealTimes = [
    { id: 'coffee', label: 'Coffee', icon: Coffee },
    { id: 'breakfast', label: 'Breakfast', icon: Egg },
    { id: 'lunch', label: 'Lunch', icon: Sandwich },
    { id: 'tea', label: 'Tea', icon: CupSoda },
    { id: 'dinner', label: 'Dinner', icon: Utensils },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Overview</h1>
          <p className="text-gray-600">View attendance statistics across all campuses</p>
        </div>

        {isDataHidden ? (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-medium text-lg mb-2">Attendance Data is Currently Hidden</h3>
                <p className="text-gray-600">{hideReason}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {isAdmin ? 'You can toggle the visibility using the switch above.' : 'Please check back later.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Loading Overview</h3>
              <p className="text-sm text-gray-500">Fetching attendance data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Meal Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {mealTimes.map((meal) => {
                const mealData = attendanceSummary?.[meal.id as keyof Omit<AttendanceSummary, 'totalSick' | 'sickStudents'>];
                const totalPresent = mealData?.present || 0;
                const totalAbsent = mealData?.absent || 0;
                const totalSick = mealData?.sick || 0;
                const totalStudents = totalPresent + totalAbsent + totalSick;

                // Define colors for each meal type
                const mealColors = {
                  coffee: {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: 'text-blue-600',
                    badge: 'bg-blue-100 text-blue-800'
                  },
                  breakfast: {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: 'text-green-600',
                    badge: 'bg-green-100 text-green-800'
                  },
                  lunch: {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    icon: 'text-yellow-600',
                    badge: 'bg-yellow-100 text-yellow-800'
                  },
                  tea: {
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                    icon: 'text-purple-600',
                    badge: 'bg-purple-100 text-purple-800'
                  },
                  dinner: {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: 'text-red-600',
                    badge: 'bg-red-100 text-red-800'
                  }
                };

                const colors = mealColors[meal.id as keyof typeof mealColors];

                return (
                  <Card key={meal.id} className={`${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <meal.icon className={`h-8 w-8 mb-2 ${colors.icon}`} />
                        <h3 className="font-medium text-lg mb-2">{meal.label}</h3>
                        <div className="space-y-2 w-full">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total:</span>
                            <Badge variant="secondary" className={`${colors.badge} text-lg px-4 py-1`}>
                              {totalStudents}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <MealAttendanceTable 
              attendanceSummary={attendanceSummary}
              availableCampuses={AVAILABLE_CAMPUSES}
            />

            {/* Sick Students Summary */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-4">Sick Students</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-yellow-800">Total Sick Students</h4>
                      <p className="text-sm text-yellow-600">Across all campuses</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                      {attendanceSummary?.totalSick || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Overview; 