import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { admissionNumber, firstName, lastName } = await request.json();
    
    const db = await connectToDatabase();
    
    // Find student in students collection
    const student = await db.collection('students').findOne({
      admissionNumber,
      firstName: { $regex: new RegExp(`^${firstName}$`, 'i') }, // case-insensitive match
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
    });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found. Please check your details.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      verified: true,
      tableNumber: student.tableNumber
    });
    
  } catch (error) {
    console.error('Error verifying student:', error);
    return NextResponse.json(
      { error: 'Failed to verify student' },
      { status: 500 }
    );
  }
} 