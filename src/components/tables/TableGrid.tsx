'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface TableGridProps {
  onOpenTableDetails: (tableId: string) => void;
  selectedMeal: string | null;
  selectedCampus?: string;
}

interface Student {
  _id: string;
  fullName: string;
  admissionNumber: string;
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
  campus: string;
}

// Add defaultAttendance constant at the top of the file after interfaces
const defaultAttendance = {
  coffee: false,
  breakfast: false,
  lunch: false,
  tea: false,
  dinner: false
};

const TableGrid: React.FC<TableGridProps> = ({ onOpenTableDetails, selectedMeal, selectedCampus }) => {
  const [students, setStudents] = useState<{ [key: string]: Student[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfTables, setNumberOfTables] = useState(10); // Default to 10
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setNumberOfTables(data.numberOfTables);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students/by-table');
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    fetchStudents();
  }, []);

  // Get student's first name initial
  const getFirstNameInitial = (fullName: string) => {
    const firstName = fullName.split(' ')[0];
    return firstName ? firstName[0].toUpperCase() : 'A';
  };

  // Get current meal status based on selectedMeal
  const getMealStatus = (student: Student) => {
    if (!selectedMeal) return null;
    const mealKey = selectedMeal.toLowerCase() as keyof typeof defaultAttendance;
    return student.attendance?.[mealKey] ?? null;
  };

  // Calculate presence for a table
  const calculatePresence = (tableStudents: Student[]) => {
    const present = tableStudents.filter(student => {
      const status = getMealStatus(student);
      return status === true;
    }).length;
    
    const absent = tableStudents.filter(student => {
      const status = getMealStatus(student);
      return status === false;
    }).length;

    return { present, absent };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 w-full"
    >
      {Array.from({ length: numberOfTables }, (_, i) => i + 1).map((tableNumber) => {
        let tableStudents = students[tableNumber.toString()] || [];
        if (selectedCampus && selectedCampus !== 'all') {
          tableStudents = tableStudents.filter(s => s.campus === selectedCampus);
        }
        const presence = calculatePresence(tableStudents);

        return (
          <motion.div
            key={tableNumber}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle>Table {tableNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {tableStudents.map((student) => {
                    const mealStatus = getMealStatus(student);
                    return (
                      <motion.div
                        key={student._id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 ${
                          mealStatus === true
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : mealStatus === false
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                        }`}
                        title={`${student.fullName}: ${mealStatus === null ? 'Not checked' : mealStatus ? 'Present' : 'Absent'}`}
                      >
                        <span className="text-xs font-medium">
                          {getFirstNameInitial(student.fullName)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>
                      {presence.present} present
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span>
                      {presence.absent} absent
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onOpenTableDetails(tableNumber.toString())}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default TableGrid;
