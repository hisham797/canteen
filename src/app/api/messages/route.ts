import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const messages = await db.collection<Message>('messages')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const message = await request.json();
    
    // Add timestamp to the message
    const messageWithTimestamp = {
      ...message,
      createdAt: new Date().toISOString(),
      status: 'unread' // Add status field for message tracking
    };
    
    const result = await db.collection<Message>('messages').insertOne(messageWithTimestamp);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { messageId } = await request.json();
    const db = await connectToDatabase();
    
    const result = await db.collection<Message>('messages').updateOne(
      { _id: messageId },
      { $set: { status: 'read' } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('messages').deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { id, ...data } = await request.json();
  // Your PATCH logic here
  return NextResponse.json({ message: "PATCH message", id, data });
} 