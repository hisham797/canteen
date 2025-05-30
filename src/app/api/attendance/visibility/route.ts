import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface VisibilitySettings {
  type: string;
  isHidden: boolean;
  reason: string;
  updatedAt: Date;
  updatedBy: string;
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Get the current visibility settings from the settings collection
    const settings = await db.collection('settings').findOne({ type: 'attendance-visibility' });
    
    if (!settings) {
      // If no settings exist, create default settings
      const defaultSettings = {
        type: 'attendance-visibility',
        isHidden: false,
        reason: '',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      await db.collection('settings').insertOne(defaultSettings);
      
      return NextResponse.json({
        isHidden: false,
        reason: ''
      });
    }
    
    return NextResponse.json({
      isHidden: settings.isHidden,
      reason: settings.reason
    });
  } catch (error) {
    console.error('Error fetching visibility settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visibility settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { isHidden, reason } = await request.json();
    const db = await connectToDatabase();
    
    // Update visibility settings in the settings collection
    await db.collection('settings').updateOne(
      { type: 'attendance-visibility' },
      {
        $set: {
          type: 'attendance-visibility',
          isHidden,
          reason,
          updatedAt: new Date(),
          updatedBy: 'admin' // You might want to get this from the session
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating visibility settings:', error);
    return NextResponse.json(
      { error: 'Failed to update visibility settings' },
      { status: 500 }
    );
  }
} 