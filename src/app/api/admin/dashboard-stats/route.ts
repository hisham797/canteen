import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('canteen-tracker-app');

    const totalStudents = await db.collection('students').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    const totalMessages = await db.collection('messages').countDocuments();
    // Assuming tables count might be in a 'tables' collection or hardcoded if not dynamic
    // If you have a 'tables' collection, uncomment the line below
    // const totalTables = await db.collection('tables').countDocuments();
    // For now, we will return a placeholder or you can fetch it from another source
    const totalTables = 15; // Placeholder - replace if you have a tables collection

    return NextResponse.json({
      totalStudents,
      totalUsers,
      totalTables,
      totalMessages,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 