import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { players, sessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, name, answer } = body;

    if (!sessionId || !name) {
      return NextResponse.json(
        { error: 'sessionId and name are required' },
        { status: 400 }
      );
    }

    // Verify session exists
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

    // Find or create player
    let [player] = await db
      .select()
      .from(players)
      .where(and(eq(players.name, name), eq(players.sessionId, sessionId)))
      .limit(1);

    let wasCreated = false;

    // If player doesn't exist, create a new one
    if (!player) {
      try {
        [player] = await db
          .insert(players)
          .values({
            sessionId,
            name,
            answer: answer || null,
          })
          .returning();
        wasCreated = true;
      } catch (insertError) {
        // If insert fails (e.g., race condition), try to fetch again
        [player] = await db
          .select()
          .from(players)
          .where(and(eq(players.name, name), eq(players.sessionId, sessionId)))
          .limit(1);

        if (!player) {
          throw insertError;
        }
        // Player was found after race condition, so it wasn't created
        wasCreated = false;
      }
    }

    const statusCode = wasCreated ? 201 : 200; // 201 if created, 200 if found
    return NextResponse.json({ player, sessionName: session.sessionName }, { status: statusCode });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}

