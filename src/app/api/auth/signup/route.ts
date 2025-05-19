import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, admissionNumber } = await request.json();
    
    const db = await connectToDatabase();
    
    // Check if user already exists with this email or admission number
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { admissionNumber }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or admission number already exists' },
        { status: 400 }
      );
    }

    // Find student in students collection to get table number
    const student = await db.collection('students').findOne({ admissionNumber });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found with this admission number' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user with table number
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      admissionNumber,
      tableNumber: student.tableNumber,
      role: 'student',
      isPresent: true,
      attendance: {
        coffee: true,
        breakfast: true,
        lunch: true,
        tea: true,
        dinner: true
      },
      createdAt: new Date()
    };
    
    // Insert the new user
    const result = await db.collection('users').insertOne(newUser);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create user account');
    }

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
} 