'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Session {
    id: string;
    hostName: string;
    sessionName: string;
    live: boolean;
}

export default function HostPage() {
    const params = useParams();
    const sessionId = params.id as string;
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSessionId = sessionStorage.getItem('sessionId') || '';
            if (!sessionId || sessionId !== storedSessionId) {
                router.push('/host');
                return;
            }
            fetchSession(sessionId);
        }
    }, [sessionId, router]);

    const fetchSession = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/sessions/${sessionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch session');
            }
            const data = await response.json();
            setSession(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const updateSession = async (updates: { live?: boolean }) => {
        if (!session) return;

        setIsUpdating(true);
        setError('');

        console.log('updates', updates);

        try {
            const response = await fetch(`/api/sessions/${session.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update session');
            }

            const { isSessionLive } = await response.json() as { isSessionLive: boolean };
            setSession({ ...session, live: isSessionLive });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteSession = async () => {
        if (!session) return;

        setIsUpdating(true);
        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/sessions/${session.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete session');
            }

            sessionStorage.removeItem('sessionId');
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsUpdating(false);
        }
    };

    const fetchAnswers = async () => {

    };



    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="hennyPenny text-5xl">Loading session...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="atma flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-5xl text-wrap text-center">Session {sessionId} not found</p>
                <button
                    onClick={() => router.push('/')}
                    className="button button1 text-xl">
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center">
            <div className="atma space-y-8 rounded-2xl bg-tertiary p-8 w-11/12">
                <div className="text-center flex flex-col items-center justify-center gap-4">
                    <h1 className="text-3xl flex flex-wrap justify-center items-center gap-4">
                        Session: <span className="hennyPenny text-6xl w-full text-center">{session.sessionName}</span>
                    </h1>
                    <p className="text-3xl">
                        Host: {session.hostName}
                    </p>
                    <p className="text-3xl">
                        ID: {session.id}
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                <button
                    onClick={fetchAnswers}
                    disabled={isUpdating}
                    className="button button3 w-full text-2xl"
                >
                    {isUpdating ? 'Fetching Answers...' : 'Fetch Answers'}
                </button>

                <button
                    onClick={() => updateSession({ live: !session.live })}
                    disabled={isUpdating}
                    className={`w-full text-2xl button ${session.live ? 'button2' : 'button1'}`}
                >
                    {isUpdating ? 'Updating...' : session.live ? 'End Polling' : 'Start Polling'}
                </button>

                <button
                    onClick={deleteSession}
                    disabled={isDeleting}
                    className="button button2 delete absolute top-5 right-5 text-2xl"
                >{isDeleting ? 'Deleting...' : 'End Session'}
                </button>

            </div>
        </main>
    );
}

