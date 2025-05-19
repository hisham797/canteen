import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

type MealType = 'coffee' | 'breakfast' | 'lunch' | 'tea' | 'dinner';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface User {
  _id: string;
  admissionNumber: string;
  attendance?: Record<MealType, boolean>;
}

interface StudentInfo {
  id: string;
  name: string;
}

interface MealSummary {
  present: number;
  absent: number;
  presentStudents: StudentInfo[];
  absentStudents: StudentInfo[];
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
      coffee: { present: totalStudents, absent: 0, presentStudents: [], absentStudents: [] },
      breakfast: { present: totalStudents, absent: 0, presentStudents: [], absentStudents: [] },
      lunch: { present: totalStudents, absent: 0, presentStudents: [], absentStudents: [] },
      tea: { present: totalStudents, absent: 0, presentStudents: [], absentStudents: [] },
      dinner: { present: totalStudents, absent: 0, presentStudents: [], absentStudents: [] }
    };

    // Get all users with attendance records
    const users = await db.collection<User>('users').find({}).toArray();

    // Process each meal's attendance
    const meals: MealType[] = ['coffee', 'breakfast', 'lunch', 'tea', 'dinner'];
    
    meals.forEach(meal => {
      summary[meal].presentStudents = students.map(student => ({
        id: student._id.toString(),
        name: `${student.firstName} ${student.lastName}`
      }));

      // Update counts based on actual attendance records
      users.forEach(user => {
        if (user.attendance && user.attendance[meal] === false) {
          // Find corresponding student
          const student = students.find(s => s.admissionNumber === user.admissionNumber);
          if (student) {
            summary[meal].present--;
            summary[meal].absent++;
            
            // Move student from present to absent list
            const studentInfo: StudentInfo = {
              id: student._id.toString(),
              name: `${student.firstName} ${student.lastName}`
            };
            
            summary[meal].presentStudents = summary[meal].presentStudents.filter(
              (s: StudentInfo) => s.id !== studentInfo.id
            );
            summary[meal].absentStudents.push(studentInfo);
          }
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