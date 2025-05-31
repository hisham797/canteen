import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { passkey } = await req.json();

    if (!passkey || typeof passkey !== 'string' || passkey.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid passkey format. Must be a 6-digit string.' },
        { status: 400 }
      );
    }

    // Validate that passkey contains only numbers
    if (!/^\d{6}$/.test(passkey)) {
      return NextResponse.json(
        { error: 'Passkey must contain only numbers' },
        { status: 400 }
      );
    }

    try {
      // Update or insert the passkey in settings
      const result = await db.settings.upsert({
        where: { key: 'admin_passkey' },
        update: {
          value: passkey,
          updatedAt: new Date()
        },
        create: {
          key: 'admin_passkey',
          value: passkey,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      if (!result) {
        throw new Error('Failed to store passkey in database');
      }

      return NextResponse.json({ 
        success: true,
        message: 'Passkey stored successfully',
        passkey: result.value
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: 'Database operation failed', details: dbError.message },
          { status: 500 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error storing passkey:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store passkey',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const settings = await db.settings.findUnique({
      where: { key: 'admin_passkey' }
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'No passkey found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      passkey: settings.value,
      updatedAt: settings.updatedAt
    });
  } catch (error) {
    console.error('Error fetching passkey:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch passkey',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 