'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TableGrid from '@/components/tables/TableGrid';
import TableModal from '@/components/tables/TableModal';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Loader2, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define meal times and their corresponding icons
const mealTimes = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'breakfast', label: 'Breakfast', icon: Egg },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'tea', label: 'Tea', icon: CupSoda },
  { id: 'dinner', label: 'Dinner', icon: Utensils },
];

interface AttendanceSummary {
  coffee: { 
    present: number; 
    absent: number;
    presentStudents: Array<{ id: string; name: string }>;
    absentStudents: Array<{ id: string; name: string }>;
  };
  breakfast: { 
    present: number; 
    absent: number;
    presentStudents: Array<{ id: string; name: string }>;
    absentStudents: Array<{ id: string; name: string }>;
  };
  lunch: { 
    present: number; 
    absent: number;
    presentStudents: Array<{ id: string; name: string }>;
    absentStudents: Array<{ id: string; name: string }>;
  };
  tea: { 
    present: number; 
    absent: number;
    presentStudents: Array<{ id: string; name: string }>;
    absentStudents: Array<{ id: string; name: string }>;
  };
  dinner: { 
    present: number; 
    absent: number;
    presentStudents: Array<{ id: string; name: string }>;
    absentStudents: Array<{ id: string; name: string }>;
  };
    }

const getFirstLetter = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const Tables = () => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    fetchAttendanceSummary();
    // Check if user is admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin');
    }
  }, []);

  const fetchAttendanceSummary = async () => {
    try {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      setAttendanceSummary(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTableDetails = (tableId: string) => {
    setSelectedTableId(tableId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh attendance data when modal is closed
    fetchAttendanceSummary();
  };

  const handleSendReport = async () => {
    setIsSendingReport(true);
    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceSummary }),
      });
      
      if (!response.ok) throw new Error('Failed to send report');
      
      toast.success('Report sent successfully!');
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Failed to send report');
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Canteen Tables</h1>
            <p className="text-gray-600">
              View all tables and their current attendance status
            </p>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
            <Button 
              variant="outline" 
              onClick={handleSendReport}
              disabled={isSendingReport}
            >
              {isSendingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Report
                </>
              )}
            </Button>
            )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedMeal ? `Filter: ${mealTimes.find(m => m.id === selectedMeal)?.label}` : "Filter by Meal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => setSelectedMeal(null)}
                >
                  Show All
                </Button>
                {mealTimes.map(meal => (
                  <Button
                    key={meal.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSelectedMeal(meal.id)}
                  >
                    <meal.icon className="mr-2 h-4 w-4" />
                    {meal.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          </div>
        </div>
        
        {/* Attendance Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Present Students Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Present Students</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                </div>
              ) : (
              <div className="grid grid-cols-5 gap-2">
                {mealTimes.map((meal) => {
                    const presentCount = attendanceSummary?.[meal.id as keyof AttendanceSummary]?.present || 0;
                    const presentStudents = attendanceSummary?.[meal.id as keyof AttendanceSummary]?.presentStudents || [];
                  return (
                    <div 
                      key={`present-${meal.id}`}
                      className={`flex flex-col items-center p-2 rounded-lg ${selectedMeal === meal.id ? 'bg-green-200' : ''}`}
                    >
                      <meal.icon className="h-5 w-5 text-green-600 mb-1" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {presentCount}
                      </Badge>
                      <span className="text-xs mt-1">{meal.label}</span>
                        <div className="hidden">
                          {presentStudents.map(student => (
                            <span key={student.id}>{getFirstLetter(student.name)}</span>
                          ))}
                        </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
          
          {/* Absent Students Summary */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Absent Students</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                </div>
              ) : (
              <div className="grid grid-cols-5 gap-2">
                {mealTimes.map((meal) => {
                    const absentCount = attendanceSummary?.[meal.id as keyof AttendanceSummary]?.absent || 0;
                    const absentStudents = attendanceSummary?.[meal.id as keyof AttendanceSummary]?.absentStudents || [];
                  return (
                    <div 
                      key={`absent-${meal.id}`}
                      className={`flex flex-col items-center p-2 rounded-lg ${selectedMeal === meal.id ? 'bg-red-200' : ''}`}
                    >
                      <meal.icon className="h-5 w-5 text-red-600 mb-1" />
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {absentCount}
                      </Badge>
                      <span className="text-xs mt-1">{meal.label}</span>
                        <div className="hidden">
                          {absentStudents.map(student => (
                            <span key={student.id}>{getFirstLetter(student.name)}</span>
                          ))}
                        </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <TableGrid onOpenTableDetails={handleOpenTableDetails} selectedMeal={selectedMeal} />
        <TableModal 
          tableId={selectedTableId ? parseInt(selectedTableId) : null} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default Tables;
