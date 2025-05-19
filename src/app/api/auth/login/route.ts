import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { admissionNumber, password } = await request.json();

    // Check if it's an admin login
    if (admissionNumber === 'shaz80170@gmail.com' && password === '871459') {
      return NextResponse.json({
        success: true,
        user: {
          email: admissionNumber,
          role: 'admin',
          isLoggedIn: true
        }
      });
    }

    // Find user by admission number
    const user = await db.collection("users").findOne({ admissionNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid admission number or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid admission number or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 