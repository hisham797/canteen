import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  tableNumber: number;
  class: string;
  fullName?: string;  // Add fullName as optional property
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

interface User {
  _id: string;
  admissionNumber: string;
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

// Default attendance object
const defaultAttendance = {
  coffee: true,
  breakfast: true,
  lunch: true,
  tea: true,
  dinner: true
};

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Get all students with their table numbers
    const students = await db.collection<Student>('students').find({}).toArray();
    
    // Get all users with their attendance
    const users = await db.collection<User>('users').find({}).toArray();
    
    // Create a map of admission numbers to user attendance
    const userAttendanceMap = new Map(
      users.map(user => [user.admissionNumber, user.attendance || defaultAttendance])
    );
    
    // Group students by table number and merge with user attendance
    const studentsByTable: { [key: string]: Student[] } = {};
    
    students.forEach(student => {
      const tableNumber = student.tableNumber?.toString() || '1';
      if (!studentsByTable[tableNumber]) {
        studentsByTable[tableNumber] = [];
      }
      
      // Get attendance from users collection or use default
      const attendance = userAttendanceMap.get(student.admissionNumber) || defaultAttendance;
      
      // Merge student info with attendance
      const studentWithAttendance = {
        ...student,
        fullName: `${student.firstName} ${student.lastName}`,
        attendance: attendance
      };
      
      studentsByTable[tableNumber].push(studentWithAttendance);
    });

    return NextResponse.json(studentsByTable);
  } catch (error) {
    console.error('Error fetching students by table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students by table' },
      { status: 500 }
    );
  }
} 