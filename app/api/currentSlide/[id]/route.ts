import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { players, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { google } from "googleapis";

const credentials = JSON.parse(<string>process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/presentations.readonly"]
});

async function setSlideIds(presentationId: string) {
    const slidesApi = google.slides({ version: "v1", auth: (await auth.getClient()) as any });
    const response = await slidesApi.presentations.get({
        presentationId,
    });
    if (!response.data.slides) {
        throw new Error('No pages found');
    }
    const slideIds = response.data.slides.map((slide: any) => slide.objectId);
    const [updatedSession] = await db
        .update(sessions)
        .set({ slideIds: slideIds })
        .where(eq(sessions.presentationId, presentationId))
        .returning();
    return updatedSession;
}

async function getSlideByObjectId(presentationId: string, objectId: string) {
    const slidesApi = google.slides({ version: "v1", auth: (await auth.getClient()) as any });
    try {
        const response = await slidesApi.presentations.pages.get({
            presentationId,
            pageObjectId: objectId,
        });

        return response.data;
    } catch (error) {
        console.error('Error getting slide by object ID:', error);
        throw new Error('Failed to get slide by object ID');
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const sessionId = id;

    if (!/^\d{4}$/.test(sessionId)) {
        return NextResponse.json(
            { error: 'Invalid session ID format. Must be 4 digits' },
            { status: 400 }
        );
    }

    let [session] = await db
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

    const presentationId = session.presentationId
    if (!presentationId) {
        return NextResponse.json(
            { error: 'Presentation ID not found' },
            { status: 404 }
        );
    }

    if (session.slideIds.length === 0) {
        session = await setSlideIds(presentationId);
    }

    const slideIndex = session.slideIndex
    const slideId = session.slideIds[slideIndex];
    const slide = await getSlideByObjectId(presentationId, slideId);
    return NextResponse.json({ slideIndex, slide });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const sessionId = id;

    if (!/^\d{4}$/.test(sessionId)) {
        return NextResponse.json(
            { error: 'Invalid session ID format. Must be 4 digits' },
            { status: 400 }
        );
    }

    const body = await request.json();
    const { slideIndex } = body;

    if (slideIndex === undefined || slideIndex === null || typeof slideIndex !== 'number') {
        return NextResponse.json(
            { error: 'slideIndex is required and must be a number' },
            { status: 400 }
        );
    }

    // Get the session first to validate bounds
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

    // Ensure slideIds are set
    if (session.slideIds.length === 0) {
        if (!session.presentationId) {
            return NextResponse.json(
                { error: 'Presentation ID not found' },
                { status: 404 }
            );
        }
        await setSlideIds(session.presentationId);
        // Re-fetch session to get updated slideIds
        const [updatedSessionWithIds] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1);
        if (!updatedSessionWithIds) {
            return NextResponse.json(
                { error: 'Session not found after updating slide IDs' },
                { status: 404 }
            );
        }
        // Validate bounds
        if (slideIndex < 0 || slideIndex >= updatedSessionWithIds.slideIds.length) {
            return NextResponse.json(
                { error: `slideIndex must be between 0 and ${updatedSessionWithIds.slideIds.length - 1}` },
                { status: 400 }
            );
        }
    } else {
        // Validate bounds
        if (slideIndex < 0 || slideIndex >= session.slideIds.length) {
            return NextResponse.json(
                { error: `slideIndex must be between 0 and ${session.slideIds.length - 1}` },
                { status: 400 }
            );
        }
    }

    const [updatedSession] = await db
        .update(sessions)
        .set({ slideIndex: slideIndex })
        .where(eq(sessions.id, sessionId))
        .returning();

    if (!updatedSession) {
        return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
        );
    }

    const presentationId = updatedSession.presentationId;
    const newSlideIndex = updatedSession.slideIndex;
    if (!presentationId || newSlideIndex === null || newSlideIndex === undefined) {
        return NextResponse.json(
            { error: 'Presentation ID or slide index not found' },
            { status: 404 }
        );
    }
    const slide = await getSlideByObjectId(presentationId, updatedSession.slideIds[newSlideIndex]);
    return NextResponse.json({ slideIndex: newSlideIndex, slide });
}