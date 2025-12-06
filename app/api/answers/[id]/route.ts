import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { players, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

        // Get session with all players
        const sessionPlayers = await db.select({
            name: players.name,
            answer: players.answer,
        }).from(players).where(eq(players.sessionId, sessionId));

        return NextResponse.json(sessionPlayers);
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}