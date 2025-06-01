'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TableGrid from '@/components/tables/TableGrid';
import TableModal from '@/components/tables/TableModal';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define meal times and their corresponding icons
const mealTimes = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'breakfast', label: 'Breakfast', icon: Egg },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'tea', label: 'Tea', icon: CupSoda },
  { id: 'dinner', label: 'Dinner', icon: Utensils },
];

type Campus = 'hifz';

interface Student {
  _id: string;
  fullName: string;
  class: string;
  admissionNumber: string;
  campus: string;
  isAttendanceHidden?: boolean;
  isSick?: boolean;
}

interface MealDetails {
  type: 'present' | 'absent' | 'sick';
  students: Student[];
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

const Tables = () => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedMealDetails, setSelectedMealDetails] = useState<{
    meal: string;
    type: 'present' | 'absent' | 'sick';
    students: Student[];
  } | null>(null);
  const [isDataHidden, setIsDataHidden] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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
      
      // Filter data for Hifz campus only
      const filteredData: AttendanceSummary = {
        coffee: filterMealData(data.coffee),
        breakfast: filterMealData(data.breakfast),
        lunch: filterMealData(data.lunch),
        tea: filterMealData(data.tea),
        dinner: filterMealData(data.dinner),
        totalSick: data.totalSick,
        sickStudents: data.sickStudents.filter((student: Student) => student.campus === 'hifz')
      };
      
      setAttendanceSummary(filteredData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMealData = (mealData: any) => {
    if (!mealData) return null;
    
    return {
      ...mealData,
      presentStudents: mealData.presentStudents.filter((student: Student) => student.campus === 'hifz'),
      absentStudents: mealData.absentStudents.filter((student: Student) => student.campus === 'hifz'),
      present: mealData.presentStudents.filter((student: Student) => student.campus === 'hifz').length,
      absent: mealData.absentStudents.filter((student: Student) => student.campus === 'hifz').length,
      campusTotals: mealData.campusTotals
    };
  };

  const getTotalSickStudents = () => {
    if (!attendanceSummary) return 0;
    return attendanceSummary.sickStudents.length;
  };

  const handleOpenTableDetails = (tableId: string) => {
    setSelectedTableId(tableId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchAttendanceSummary();
  };

  const handleMealClick = (mealName: string, type: 'present' | 'absent' | 'sick', students: Student[]) => {
    setSelectedMeal(mealName);
    setSelectedMealDetails({
      meal: mealName,
      type,
      students
    });
    setIsDetailsDialogOpen(true);
  };

  const handleToggleVisibility = async (checked: boolean) => {
    if (checked) {
      setIsReasonDialogOpen(true);
    } else {
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmShowData = async () => {
    try {
      const response = await fetch('/api/attendance/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isHidden: false,
          reason: ''
        }),
      });

      if (!response.ok) throw new Error('Failed to update visibility');
      
      setIsDataHidden(false);
      setHideReason('');
      setIsConfirmDialogOpen(false);
      toast.success('Attendance data is now visible');
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  const handleSaveReason = async () => {
    if (!hideReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      const response = await fetch('/api/attendance/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isHidden: true,
          reason: hideReason.trim()
        }),
      });

      if (!response.ok) throw new Error('Failed to update visibility');
      
      setIsDataHidden(true);
      setIsReasonDialogOpen(false);
      toast.success('Attendance data is now hidden');
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  useEffect(() => {
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

    fetchVisibilityState();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hifz Campus</h1>
            <p className="text-gray-600">
              {isDataHidden ? 'Attendance data is currently hidden' : 'View all tables and their current attendance status'}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="data-visibility"
                  checked={isDataHidden}
                  onCheckedChange={handleToggleVisibility}
                />
                <Label htmlFor="data-visibility" className="flex items-center gap-2">
                  {isDataHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isDataHidden ? 'Show Data' : 'Hide Data'}
                </Label>
              </div>
            )}

            {!isDataHidden && (
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
            )}
          </div>
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
        ) : (
          <>
            {/* Attendance Summary Boxes */}
            <div className="grid gap-4 mb-6 grid-cols-1 md:grid-cols-2">
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
                        const mealData = attendanceSummary?.[meal.id as keyof Omit<AttendanceSummary, 'totalSick' | 'sickStudents'>];
                        const presentCount = mealData?.present || 0;
                        const presentStudents = mealData?.presentStudents || [];
                        const campusTotal = mealData?.campusTotals?.['hifz'] || 0;
                        
                        return (
                          <div
                            key={`present-${meal.id}`}
                            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors ${selectedMeal === meal.id ? 'bg-green-200' : ''}`}
                            onClick={() => handleMealClick(meal.label, 'present', presentStudents)}
                          >
                            <meal.icon className="h-5 w-5 text-green-600 mb-1" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {presentCount}
                            </Badge>
                            <span className="text-xs mt-1">{meal.label}</span>
                            <span className="text-xs text-gray-500 mt-1">
                              Total: {campusTotal}
                            </span>
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
                        const mealData = attendanceSummary?.[meal.id as keyof Omit<AttendanceSummary, 'totalSick' | 'sickStudents'>];
                        const absentCount = mealData?.absent || 0;
                        const absentStudents = mealData?.absentStudents || [];
                        return (
                          <div
                            key={`absent-${meal.id}`}
                            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-red-100 transition-colors ${selectedMeal === meal.id ? 'bg-red-200' : ''}`}
                            onClick={() => handleMealClick(meal.label, 'absent', absentStudents)}
                          >
                            <meal.icon className="h-5 w-5 text-red-600 mb-1" />
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              {absentCount}
                            </Badge>
                            <span className="text-xs mt-1">{meal.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <TableGrid onOpenTableDetails={handleOpenTableDetails} selectedMeal={selectedMeal} selectedCampus="hifz" />
        <TableModal
          tableId={selectedTableId ? parseInt(selectedTableId) : null}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Student Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedMealDetails?.meal} - {selectedMealDetails?.type === 'present' ? 'Present' : selectedMealDetails?.type === 'sick' ? 'Sick' : 'Absent'} Students
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {selectedMealDetails?.students.map((student, index) => (
                  <div
                    key={student._id}
                    className={`p-3 rounded-lg border ${
                      selectedMealDetails.type === 'present' 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : selectedMealDetails.type === 'sick'
                        ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-red-200 bg-red-50 hover:bg-red-100'
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedMealDetails.type === 'present'
                            ? 'bg-green-500'
                            : selectedMealDetails.type === 'sick'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`} />
                        <p className="font-medium">{student.fullName}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Class:</span> {student.class}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Admission No:</span> {student.admissionNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedMealDetails?.students.length === 0 && (
                  <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                    No students found
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Reason Dialog */}
        <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hide Attendance Data</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason" className="mb-2 block">Please provide a reason for hiding the attendance data:</Label>
              <Textarea
                id="reason"
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Enter reason..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReasonDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveReason} disabled={!hideReason.trim()}>
                Hide Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Show Attendance Data</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to make the attendance data visible again? This will show all attendance information to all users.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmShowData}>
                Show Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Tables;
