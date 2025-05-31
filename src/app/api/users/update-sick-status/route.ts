import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function PUT(request: Request) {
  try {
    const { admissionNumber, isSick } = await request.json();

    if (!admissionNumber) {
      return NextResponse.json(
        { error: 'Admission number is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update the sick status in the users collection
    const result = await db.collection('users').updateOne(
      { admissionNumber },
      { $set: { isSick } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sick status:', error);
    return NextResponse.json(
      { error: 'Failed to update sick status' },
      { status: 500 }
    );
  }
} 