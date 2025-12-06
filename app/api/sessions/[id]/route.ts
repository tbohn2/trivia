import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    // Validate that it's a 4-digit string
    if (!/^\d{4}$/.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format. Must be 4 digits' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: { live?: boolean } = {};

    if (typeof body.live === 'boolean') {
      updates.live = body.live;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const [updatedSession] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId))
      .returning();

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ isSessionLive: updatedSession.live });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    // Validate that it's a 4-digit string
    if (!/^\d{4}$/.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format. Must be 4 digits' },
        { status: 400 }
      );
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    // Validate that it's a 4-digit string
    if (!/^\d{4}$/.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format. Must be 4 digits' },
        { status: 400 }
      );
    }

    const [deletedSession] = await db
      .delete(sessions)
      .where(eq(sessions.id, sessionId))
      .returning();

    if (!deletedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

