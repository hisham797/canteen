import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Add default attendance object
const defaultAttendance = {
  coffee: true,
  breakfast: true,
  lunch: true,
  tea: true,
  dinner: true
};

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { admissionNumber, fullName, email, password } = await request.json();

    // First check if the admission number exists in students collection
    const student = await db.collection("students").findOne({ admissionNumber });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Admission number not found in student records' },
        { status: 400 }
      );
    }

    // Check if user already exists with this admission number
    const existingUser = await db.collection("users").findOne({ admissionNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this admission number' },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingEmail = await db.collection("users").findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with attendance data and class from student record
    const newUser = {
      admissionNumber,
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      class: student.class,
      attendance: defaultAttendance, // Set all attendance to true by default
      isPresent: true, // Set overall presence to true
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(newUser);
    
    // Also update the student record to sync attendance
    await db.collection("students").updateOne(
      { admissionNumber },
      { 
        $set: { 
          attendance: defaultAttendance,
          isPresent: true
        }
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { searchParams } = new URL(request.url);
    const admissionNumber = searchParams.get('admissionNumber');

    // If admissionNumber is provided, return specific user
    if (admissionNumber) {
      const user = await db.collection("users").findOne({ admissionNumber });
      return NextResponse.json(user);
    }

    // Otherwise, return all users
    const users = await db.collection("users").find({}).toArray();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { admissionNumber, attendance } = await request.json();

    const result = await db.collection("users").updateOne(
      { admissionNumber },
      { $set: { attendance } }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
} 