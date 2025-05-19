import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface User {
  _id: string;
  fullName: string;
  admissionNumber: string;
  tableNumber: number;
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Get all users with their table numbers and attendance
    const users = await db.collection<User>('users').find({}).toArray();
    
    // Group users by table number
    const studentsByTable: { [key: string]: User[] } = {};
    
    users.forEach(user => {
      const tableNumber = user.tableNumber?.toString() || '1';
      if (!studentsByTable[tableNumber]) {
        studentsByTable[tableNumber] = [];
      }
      studentsByTable[tableNumber].push(user);
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