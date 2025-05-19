import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Start a session for transaction
    const session = await client.startSession();

    try {
      await session.withTransaction(async () => {
        // First get the current user
        const currentUser = await db.collection("users").findOne(
          { _id: new ObjectId(id) }
        );

        if (!currentUser) {
          throw new Error('User not found');
        }

        // Don't allow role change for admin users except by other admins
        if (currentUser.role === 'admin' && updateData.role !== 'admin') {
          throw new Error('Cannot change admin role');
        }

        // Update user
        const result = await db.collection("users").updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (!result.matchedCount) {
          throw new Error('Failed to update user');
        }

        // If admission number or class is being updated, update student record
        if (updateData.admissionNumber || updateData.class) {
          await db.collection("students").updateOne(
            { admissionNumber: currentUser.admissionNumber },
            { 
              $set: { 
                admissionNumber: updateData.admissionNumber || currentUser.admissionNumber,
                class: updateData.class || currentUser.class,
                firstName: updateData.fullName?.split(' ')[0] || currentUser.firstName,
                lastName: updateData.fullName?.split(' ')[1] || currentUser.lastName
              } 
            }
          );
        }
      });

      return NextResponse.json({ success: true, id });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("canteen-tracker-app");
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Start a session for transaction
    const session = await client.startSession();

    try {
      await session.withTransaction(async () => {
        // First get the user to get their admission number
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(userId) }
        );

        if (!user) {
          throw new Error('User not found');
        }

        // Don't allow deletion of admin users
        if (user.role === 'admin') {
          throw new Error('Cannot delete admin users');
        }

        // Delete user
        const result = await db.collection("users").deleteOne(
          { _id: new ObjectId(userId) }
        );

        if (!result.deletedCount) {
          throw new Error('Failed to delete user');
        }

        // Update student record if exists (set attendance to default)
        await db.collection("students").updateOne(
          { admissionNumber: user.admissionNumber },
          { 
            $set: { 
              attendance: {
                coffee: true,
                breakfast: true,
                lunch: true,
                tea: true,
                dinner: true
              },
              isPresent: true
            } 
          }
        );
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
} 