import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { players } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'sessionId is required' },
                { status: 400 }
            );
        }

        const updatedPlayers = await db
            .update(players)
            .set({ answer: null })
            .where(eq(players.sessionId, sessionId))
            .returning();

        return NextResponse.json({
            message: `Cleared answers for ${updatedPlayers.length} player(s)`,
            count: updatedPlayers.length,
            players: updatedPlayers,
        });
    } catch (error) {
        console.error('Error clearing player answers:', error);
        return NextResponse.json(
            { error: 'Failed to clear player answers' },
            { status: 500 }
        );
    }
}

