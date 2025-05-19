import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MongoClient } from 'mongodb';

export async function PATCH(request: Request) {
  let client: MongoClient | null = null;
  
  try {
    const { admissionNumber, mealId } = await request.json();
    
    if (!admissionNumber || !mealId) {
      return NextResponse.json(
        { error: 'Admission number and meal ID are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();
    
    // Find the user first
    const user = await db.collection('users').findOne({ admissionNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize attendance if it doesn't exist
    const currentAttendance = user.attendance || {
      coffee: true,
      breakfast: true,
      lunch: true,
      tea: true,
      dinner: true
    };

    // Toggle the attendance for the specified meal
    const updatedAttendance = {
      ...currentAttendance,
      [mealId]: !currentAttendance[mealId]
    };

    try {
      // Update the user's attendance
      const userResult = await db.collection('users').updateOne(
        { admissionNumber },
        { 
          $set: { 
            attendance: updatedAttendance,
            lastUpdated: new Date()
          } 
        }
      );

      // Update the student's attendance
      const studentResult = await db.collection('students').updateOne(
        { admissionNumber },
        { 
          $set: { 
            attendance: updatedAttendance,
            lastUpdated: new Date()
          } 
        }
      );

      if (!userResult.matchedCount || !studentResult.matchedCount) {
        throw new Error('Failed to update attendance in both collections');
      }

      return NextResponse.json({
        success: true,
        attendance: updatedAttendance
      });
    } catch (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to update attendance records' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
} 