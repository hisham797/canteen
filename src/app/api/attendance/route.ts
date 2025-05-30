import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

type MealType = 'coffee' | 'breakfast' | 'lunch' | 'tea' | 'dinner';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
}

interface User {
  _id: string;
  admissionNumber: string;
  attendance?: Record<MealType, {
    present: boolean;
    sick?: boolean;
    sickReason?: string;
  }>;
}

interface StudentInfo {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  sickReason?: string;
}

interface MealSummary {
  present: number;
  absent: number;
  sick: number;
  presentStudents: StudentInfo[];
  absentStudents: StudentInfo[];
  sickStudents: StudentInfo[];
}

type AttendanceSummary = Record<MealType, MealSummary>;

export async function GET() {
  try {
    const db = await connectToDatabase();

    // Get all students
    const students = await db.collection<Student>('students').find({}).toArray();
    const totalStudents = students.length;

    // Initialize summary structure
    const summary: AttendanceSummary = {
      coffee: { present: 0, absent: 0, sick: 0, presentStudents: [], absentStudents: [], sickStudents: [] },
      breakfast: { present: 0, absent: 0, sick: 0, presentStudents: [], absentStudents: [], sickStudents: [] },
      lunch: { present: 0, absent: 0, sick: 0, presentStudents: [], absentStudents: [], sickStudents: [] },
      tea: { present: 0, absent: 0, sick: 0, presentStudents: [], absentStudents: [], sickStudents: [] },
      dinner: { present: 0, absent: 0, sick: 0, presentStudents: [], absentStudents: [], sickStudents: [] }
    };

    // Get all users with attendance records
    const users = await db.collection<User>('users').find({}).toArray();

    // Process each meal's attendance
    const meals: MealType[] = ['coffee', 'breakfast', 'lunch', 'tea', 'dinner'];
    
    // First, process all students and their attendance
    students.forEach(student => {
      const studentInfo: StudentInfo = {
        id: student._id.toString(),
        name: `${student.firstName} ${student.lastName}`,
        class: student.class,
        admissionNumber: student.admissionNumber
      };

      // Find user record for this student
      const user = users.find(u => u.admissionNumber === student.admissionNumber);
      
      // Process each meal for this student
      meals.forEach(meal => {
        if (user?.attendance?.[meal]) {
          if (user.attendance[meal].sick) {
            // Student is sick for this meal
            const sickInfo = { ...studentInfo, sickReason: user.attendance[meal].sickReason };
            summary[meal].sickStudents.push(sickInfo);
            summary[meal].sick++;
          } else if (!user.attendance[meal].present) {
            // Student is absent for this meal
            summary[meal].absentStudents.push(studentInfo);
            summary[meal].absent++;
          } else {
            // Student is present for this meal
            summary[meal].presentStudents.push(studentInfo);
            summary[meal].present++;
          }
        } else {
          // No attendance record found, count as present
          summary[meal].presentStudents.push(studentInfo);
          summary[meal].present++;
        }
      });
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    return NextResponse.json(
      { error: 'Failed to get attendance summary' },
      { status: 500 }
    );
  }
} 