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

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  sickReason?: string;
}

interface MealAttendance {
  present: number;
  absent: number;
  sick: number;
  presentStudents: Student[];
  absentStudents: Student[];
  sickStudents: Student[];
}

interface AttendanceSummary {
  coffee: MealAttendance;
  breakfast: MealAttendance;
  lunch: MealAttendance;
  tea: MealAttendance;
  dinner: MealAttendance;
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
  const [showSickStudents, setShowSickStudents] = useState(false);
  const [selectedType, setSelectedType] = useState<'present' | 'absent' | 'sick'>('present');

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

    // Fetch visibility state for all users, not just admins
    fetchVisibilityState();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Canteen Tables</h1>
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
                            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors ${selectedMeal === meal.id ? 'bg-green-200' : ''}`}
                            onClick={() => handleMealClick(meal.label, 'present', presentStudents)}
                          >
                            <meal.icon className="h-5 w-5 text-green-600 mb-1" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {presentCount}
                            </Badge>
                            <span className="text-xs mt-1">{meal.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`${showSickStudents ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">
                      {showSickStudents ? 'Sick Students' : 'Absent Students'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="show-sick" className="text-sm">Show Sick</Label>
                      <Switch
                        id="show-sick"
                        checked={showSickStudents}
                        onCheckedChange={setShowSickStudents}
                        className={`data-[state=checked]:bg-yellow-600 ${!showSickStudents ? 'bg-red-600' : ''}`}
                      />
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className={`h-6 w-6 animate-spin ${showSickStudents ? 'text-yellow-600' : 'text-red-600'}`} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {mealTimes.map((meal) => {
                        const count = showSickStudents 
                          ? attendanceSummary?.[meal.id as keyof AttendanceSummary]?.sick || 0
                          : (attendanceSummary?.[meal.id as keyof AttendanceSummary]?.absent || 0) + 
                            (attendanceSummary?.[meal.id as keyof AttendanceSummary]?.sick || 0);
                        const students = showSickStudents
                          ? attendanceSummary?.[meal.id as keyof AttendanceSummary]?.sickStudents || []
                          : [
                              ...(attendanceSummary?.[meal.id as keyof AttendanceSummary]?.absentStudents || []),
                              ...(attendanceSummary?.[meal.id as keyof AttendanceSummary]?.sickStudents || [])
                            ];
                        return (
                          <div
                            key={`${showSickStudents ? 'sick' : 'absent'}-${meal.id}`}
                            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
                              showSickStudents 
                                ? 'hover:bg-yellow-100' + (selectedMeal === meal.id ? ' bg-yellow-200' : '')
                                : 'hover:bg-red-100' + (selectedMeal === meal.id ? ' bg-red-200' : '')
                            }`}
                            onClick={() => handleMealClick(meal.label, showSickStudents ? 'sick' : 'absent', students)}
                          >
                            <meal.icon className={`h-5 w-5 ${showSickStudents ? 'text-yellow-600' : 'text-red-600'} mb-1`} />
                            <Badge 
                              variant="secondary" 
                              className={`${showSickStudents ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {count}
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

        <TableGrid onOpenTableDetails={handleOpenTableDetails} selectedMeal={selectedMeal} />
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
                {selectedMealDetails?.meal} - {selectedMealDetails?.type === 'present' ? 'Present' : 'Absent'} Students
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {selectedMealDetails?.students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 rounded-lg border ${
                      selectedMealDetails.type === 'present' 
                        ? 'bg-green-50' 
                        : selectedMealDetails.type === 'sick'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className='flex flex-row gap-2'>
                      <div className="text-sm text-gray-600">
                        Class: {student.class}
                      </div>
                      <div className="text-sm text-gray-600">
                        Admission No: {student.admissionNumber}
                      </div>
                    </div>
                    {selectedMealDetails.type === 'sick' && student.sickReason && (
                      <div className="mt-2 text-sm text-yellow-700">
                        Reason: {student.sickReason}
                      </div>
                    )}
                  </div>
                ))}
                {selectedMealDetails?.students.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
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
              <Button onClick={handleConfirmShowData} >
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
