import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

interface Settings {
  _id: string;
  email: string;
  allowPublicTableView: boolean;
  enableNotifications: boolean;
  darkMode: boolean;
  numberOfTables: number;
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const settings = await db.collection<Settings>('settings').findOne(
      { _id: 'global' }
    );
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        email: 'admin@example.com',
        allowPublicTableView: true,
        enableNotifications: true,
        darkMode: false,
        numberOfTables: 10,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json();
    const db = await connectToDatabase();
    
    // Remove password fields from settings before storing
    const { currentPassword, newPassword, confirmPassword, ...settingsToStore } = settings;

    const result = await db.collection<Settings>('settings').updateOne(
      { _id: 'global' },
      { $set: settingsToStore },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    // Here you would typically:
    // 1. Verify the current password against stored hash
    // 2. Hash the new password
    // 3. Update the password in your users collection
    
    // This is a placeholder implementation
    // TODO: Implement proper password verification and update logic
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 