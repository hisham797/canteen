import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Check, X, Coffee, Egg, Sandwich, CupSoda, Utensils } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  _id: string;
  fullName: string;
  admissionNumber: string;
  tableNumber: number;
  isPresent: boolean;
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

interface TableModalProps {
  tableId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Define meal times and their corresponding icons
const mealTimes = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'breakfast', label: 'Breakfast', icon: Egg },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'tea', label: 'Tea', icon: CupSoda },
  { id: 'dinner', label: 'Dinner', icon: Utensils },
];

// Add defaultAttendance constant at the top of the file after interfaces
const defaultAttendance = {
  coffee: true,
  breakfast: true,
  lunch: true,
  tea: true,
  dinner: true
};

const TableModal: React.FC<TableModalProps> = ({ tableId, isOpen, onClose }) => {
  const [tableData, setTableData] = useState<{ id: number; name: string; students: Student[] } | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<string>("");
  const [currentAttendanceStatus, setCurrentAttendanceStatus] = useState<boolean>(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load table data when tableId changes
  useEffect(() => {
    const fetchTableData = async () => {
      if (tableId === null) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/students/by-table');
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        
        // Get students for this table
        const tableStudents = data[tableId.toString()] || [];
        
        setTableData({
          id: tableId,
          name: `Table ${tableId}`,
          students: tableStudents
        });
      } catch (error) {
        console.error('Error fetching table data:', error);
        toast.error('Failed to load table data');
      } finally {
        setIsLoading(false);
    }
    };

    fetchTableData();
  }, [tableId]);

  // Check if user is logged in
  const isLoggedIn = () => {
    const userStr = localStorage.getItem('user');
    return userStr !== null;
  };

  const togglePresence = async (studentId: string) => {
    if (!isLoggedIn()) {
      toast.error("You need to log in to mark attendance");
      return;
    }

    if (tableData) {
      try {
        const response = await fetch(`/api/users/${studentId}/toggle-presence`, {
          method: 'PATCH'
        });
        
        if (!response.ok) throw new Error('Failed to update presence');
        
        const updatedStudent = await response.json();
        
      const updatedStudents = tableData.students.map(student => 
          student._id === studentId 
            ? { ...student, isPresent: updatedStudent.isPresent } 
          : student
      );
      
      setTableData({
        ...tableData,
        students: updatedStudents
      });
      
        toast.success('Attendance updated successfully');
      } catch (error) {
        console.error('Error updating presence:', error);
        toast.error('Failed to update attendance');
      }
    }
  };
  
  const toggleMealAttendance = async (studentId: string, mealId: string) => {
    if (!isLoggedIn()) {
      toast.error("You need to log in to mark attendance");
      return;
    }

    if (tableData) {
      try {
        // Find the student to get their admission number
        const student = tableData.students.find(s => s._id === studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        const response = await fetch(`/api/users/attendance`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            admissionNumber: student.admissionNumber,
            mealId 
          })
        });
        
        if (!response.ok) throw new Error('Failed to update meal attendance');
        
        const updatedStudent = await response.json();
      
      // Save the current values for the alert
      setCurrentMeal(mealId);
        setCurrentAttendanceStatus(updatedStudent.attendance[mealId]);
      setCurrentStudentId(studentId);
      setAlertOpen(true);
      
      // Update the state
        const updatedStudents = tableData.students.map(student => 
          student._id === studentId 
            ? { ...student, attendance: updatedStudent.attendance } 
            : student
      );
      
      setTableData({
        ...tableData,
        students: updatedStudents
      });

        toast.success('Attendance updated successfully');
      } catch (error) {
        console.error('Error updating meal attendance:', error);
        toast.error('Failed to update meal attendance');
      }
    }
  };
  
  const getFilteredStudents = () => {
    if (!tableData) return [];
    if (!selectedMeal) return tableData.students;
    
    return tableData.students.filter(student => 
      student.attendance && student.attendance[selectedMeal as keyof typeof student.attendance]
    );
  };
  
  const filteredStudents = getFilteredStudents();

  const getMealLabel = (mealId: string) => {
    const meal = mealTimes.find(meal => meal.id === mealId);
    return meal ? meal.label : mealId;
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Update getStudentPresence to handle undefined attendance
  const getStudentPresence = (student: Student) => {
    if (selectedMeal) {
      return (student.attendance || defaultAttendance)[selectedMeal as keyof typeof defaultAttendance];
    }
    return student.isPresent;
  };

  // Calculate presence counts based on selected meal or overall presence
  const calculatePresenceCounts = () => {
    if (!tableData) return { present: 0, absent: 0 };
    
    const students = tableData.students;
    const present = students.filter(student => getStudentPresence(student)).length;
    const absent = students.length - present;
    
    return { present, absent };
  };

  if (!tableData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              {tableData.name} Details
              {selectedMeal && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({mealTimes.find(m => m.id === selectedMeal)?.label})
                </span>
              )}
            </DialogTitle>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
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
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Present</div>
              <div className="text-2xl font-bold text-green-500">
                {calculatePresenceCounts().present}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Absent</div>
              <div className="text-2xl font-bold text-red-500">
                {calculatePresenceCounts().absent}
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="text-center p-4 text-gray-500">
                Loading students...
              </div>
            ) : (
            <div className="space-y-2">
                {filteredStudents.map((student) => {
                  const isPresent = getStudentPresence(student);
                  const attendance = student.attendance || defaultAttendance;
                  
                  return (
                <div 
                      key={student._id} 
                  className={`p-3 rounded-lg border flex justify-between items-center ${
                        isPresent ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                        <div className="flex items-center text-xs mt-1">
                          {isPresent ? (
                        <><Check className="h-3 w-3 text-green-500 mr-1" /> Present</>
                      ) : (
                        <><X className="h-3 w-3 text-red-500 mr-1" /> Absent</>
                      )}
                          {selectedMeal && (
                            <span className="ml-2 text-gray-500">
                              ({mealTimes.find(m => m.id === selectedMeal)?.label})
                            </span>
                      )}
                    </div>
                    
                    {/* Meal attendance buttons */}
                    <div className="flex mt-2 space-x-1">
                      {mealTimes.map((meal) => (
                        <Button
                          key={meal.id}
                          size="sm"
                          variant="ghost"
                          className={`p-1 h-auto ${
                                attendance[meal.id as keyof typeof attendance]
                              ? 'bg-green-100'
                              : 'bg-red-100'
                              } ${selectedMeal === meal.id ? '' : ''}`}
                              onClick={() => toggleMealAttendance(student._id, meal.id)}
                          title={`${meal.label}: ${
                                attendance[meal.id as keyof typeof attendance]
                              ? 'Present'
                              : 'Absent'
                          }`}
                        >
                          <meal.icon className={`h-4 w-4 ${
                                attendance[meal.id as keyof typeof attendance]
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div 
                    className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer ${
                          isPresent ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                        onClick={() => togglePresence(student._id)}
                  >
                        {isPresent ? <Check size={14} /> : <X size={14} />}
                  </div>
                </div>
                  );
                })}
              
              {filteredStudents.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  No students found for this filter
                </div>
              )}
            </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          {!isLoggedIn() && (
            <div className="text-sm text-amber-600 mb-2 w-full text-center">
              Log in to mark attendance
            </div>
          )}
          <Button onClick={onClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Alert Dialog for meal attendance update */}
      {alertOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseAlert}
        >
          <div 
            className="bg-purple-600 text-white rounded-lg p-4 max-w-sm w-full mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-2">Attendance Updated</h3>
            <p>
              {currentStudentId && `Student attendance for ${getMealLabel(currentMeal)}`} 
              has been set to {currentAttendanceStatus ? 'Present' : 'Absent'}.
            </p>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default TableModal;
