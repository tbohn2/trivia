import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { players, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answer, gameId } = body;

    if (answer === undefined) {
      return NextResponse.json(
        { error: 'answer field is required' },
        { status: 400 }
      );
    }

    if (gameId === undefined) {
      return NextResponse.json(
        { error: 'gameId field is required' },
        { status: 400 }
      );
    }

    const isSessionLive = await db
      .select({ live: sessions.live })
      .from(sessions)
      .where(eq(sessions.id, gameId))
      .limit(1)
      .then(result => result[0]?.live ?? false);

    if (!isSessionLive) {
      return NextResponse.json(
        { error: 'Polling is closed' },
        { status: 400 }
      );
    }

    const [updatedPlayer] = await db
      .update(players)
      .set({ answer: answer || null })
      .where(eq(players.id, playerId))
      .returning();

    if (!updatedPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

