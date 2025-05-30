import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, validateStudent } from './schema';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const students = await db.collection("students").find({}).toArray();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const studentData = await request.json();
    
    // Validate student data
    const error = validateStudent(studentData);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    
    // Check if student already exists
    const existingStudent = await db.collection('students').findOne({
      admissionNumber: studentData.admissionNumber
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this admission number already exists' },
        { status: 400 }
      );
    }
    
    // Add creation timestamp
    const newStudent: Student = {
      ...studentData,
      createdAt: new Date()
    };
    
    // Insert new student
    const result = await db.collection('students').insertOne(newStudent);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create student record');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student added successfully',
      student: newStudent
    });
    
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const { _id, ...updateData } = await request.json();

    // Start a session for transaction
    const session = await client.startSession();

    try {
      await session.withTransaction(async () => {
        // Update student
        const result = await db.collection("students").updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData }
        );

        if (!result.matchedCount) {
          throw new Error('Student not found');
        }

        // If admission number is being updated, update corresponding user
        if (updateData.admissionNumber) {
          await db.collection("users").updateOne(
            { admissionNumber: updateData.oldAdmissionNumber },
            { 
              $set: { 
                admissionNumber: updateData.admissionNumber,
                class: updateData.class
              } 
            }
          );
        }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
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

    // Start a session for transaction
    const session = await client.startSession();

    try {
      await session.withTransaction(async () => {
        // First get the student to get their admission number
        const student = await db.collection("students").findOne(
          { _id: new ObjectId(id) }
        );

        if (!student) {
          throw new Error('Student not found');
        }

        // Delete student
        const result = await db.collection("students").deleteOne(
          { _id: new ObjectId(id) }
        );

        if (!result.deletedCount) {
          throw new Error('Failed to delete student');
        }

        // Delete corresponding user if exists
        await db.collection("users").deleteOne(
          { admissionNumber: student.admissionNumber }
        );
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
} 