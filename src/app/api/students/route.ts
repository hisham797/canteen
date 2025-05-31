import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, validateStudent } from './schema';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  campus: string;
  tableNumber: number;
  isPresent: boolean;
  oldAdmissionNumber?: string;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const students = await db.collection('students').find({}).toArray();
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const student: Student = await request.json();

    // Check if admission number already exists
    const existingStudent = await db.collection('students').findOne({ admissionNumber: student.admissionNumber });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Admission number already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('students').insertOne(student);
    return NextResponse.json({ _id: result.insertedId, ...student });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const student: Student = await request.json();

    // If admission number is being changed, check if new one exists
    if (student.oldAdmissionNumber && student.oldAdmissionNumber !== student.admissionNumber) {
      const existingStudent = await db.collection('students').findOne({ admissionNumber: student.admissionNumber });
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Admission number already exists' },
          { status: 400 }
        );
      }
    }

    const { oldAdmissionNumber, ...updateData } = student;
    const result = await db.collection('students').updateOne(
      { _id: student._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const result = await db.collection('students').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
} 