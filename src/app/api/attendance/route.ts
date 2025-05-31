import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

type MealType = 'coffee' | 'breakfast' | 'lunch' | 'tea' | 'dinner';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  isSick?: boolean;
  attendance?: Record<MealType, {
    present: boolean;
    sick?: boolean;
    sickReason?: string;
  }>;
  campus?: string;
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
  campusTotals: {
    'dawa academy': number;
    'hifz': number;
    'daiya stafs': number;
    'ayadi': number;
    'office stafs': number;
  };
}

interface AttendanceSummary {
  coffee: MealSummary;
  breakfast: MealSummary;
  lunch: MealSummary;
  tea: MealSummary;
  dinner: MealSummary;
  totalSick: number;
  sickStudents: StudentInfo[];
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");

    // Get all students
    const students = await db.collection('students').find({}).toArray();
    // Get all users
    const users = await db.collection('users').find({}).toArray();

    // Initialize attendance summary
    const attendanceSummary = {
      coffee: {
        present: 0,
        absent: 0,
        sick: 0,
        presentStudents: [],
        absentStudents: [],
        sickStudents: [],
        campusTotals: {
          'dawa academy': 0,
          'hifz': 0,
          'daiya stafs': 0,
          'ayadi': 0,
          'office stafs': 0
        }
      },
      breakfast: {
        present: 0,
        absent: 0,
        sick: 0,
        presentStudents: [],
        absentStudents: [],
        sickStudents: [],
        campusTotals: {
          'dawa academy': 0,
          'hifz': 0,
          'daiya stafs': 0,
          'ayadi': 0,
          'office stafs': 0
        }
      },
      lunch: {
        present: 0,
        absent: 0,
        sick: 0,
        presentStudents: [],
        absentStudents: [],
        sickStudents: [],
        campusTotals: {
          'dawa academy': 0,
          'hifz': 0,
          'daiya stafs': 0,
          'ayadi': 0,
          'office stafs': 0
        }
      },
      tea: {
        present: 0,
        absent: 0,
        sick: 0,
        presentStudents: [],
        absentStudents: [],
        sickStudents: [],
        campusTotals: {
          'dawa academy': 0,
          'hifz': 0,
          'daiya stafs': 0,
          'ayadi': 0,
          'office stafs': 0
        }
      },
      dinner: {
        present: 0,
        absent: 0,
        sick: 0,
        presentStudents: [],
        absentStudents: [],
        sickStudents: [],
        campusTotals: {
          'dawa academy': 0,
          'hifz': 0,
          'daiya stafs': 0,
          'ayadi': 0,
          'office stafs': 0
        }
      },
      totalSick: 0,
      sickStudents: []
    };

    // Count sick students from users database (only for Dawa Academy)
    let totalSickCount = 0;
    const sickStudents: StudentInfo[] = [];

    users.forEach(user => {
      if (user.isSick) {
        // Find the corresponding student
        const student = students.find(s => s.admissionNumber === user.admissionNumber);
        if (student && student.campus === 'dawa academy') {
          totalSickCount++;
          sickStudents.push({
            id: student._id.toString(),
            name: student.firstName + ' ' + student.lastName,
            class: student.class,
            admissionNumber: student.admissionNumber,
            sickReason: 'Marked as sick'
          });
        }
      }
    });

    // Set the total sick count
    attendanceSummary.totalSick = totalSickCount;
    attendanceSummary.sickStudents = sickStudents;

    // Process each student's attendance
    students.forEach(student => {
      const campus = student.campus || 'dawa academy';
      
      ['coffee', 'breakfast', 'lunch', 'tea', 'dinner'].forEach(meal => {
        // Default to present if no attendance record exists
        const mealAttendance = student.attendance?.[meal] || { present: true, sick: false };
        
        if (mealAttendance.present) {
          attendanceSummary[meal].present++;
          attendanceSummary[meal].presentStudents.push(student);
          attendanceSummary[meal].campusTotals[campus]++;
        } else {
          attendanceSummary[meal].absent++;
          attendanceSummary[meal].absentStudents.push(student);
        }
      });
    });

    return NextResponse.json(attendanceSummary);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
} 