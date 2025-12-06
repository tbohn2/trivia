import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Generate a unique 4-digit session ID
async function generateUniqueSessionId(): Promise<string> {
    let sessionId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
        // Generate a random 4-digit number (1000-9999)
        sessionId = Math.floor(1000 + Math.random() * 9000).toString();

        // Check if this ID already exists
        const [existing] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1);

        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique session ID');
    }

    return sessionId!;
}

// Create a new session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostName, sessionName } = body;

        if (!hostName || !sessionName) {
            return NextResponse.json(
                { error: 'hostName and sessionName are required' },
                { status: 400 }
            );
        }

        const sessionId = await generateUniqueSessionId();

        const [newSession] = await db
            .insert(sessions)
            .values({
                id: sessionId,
                hostName,
                sessionName,
                live: false,
            })
            .returning();

        return NextResponse.json({ id: newSession.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

