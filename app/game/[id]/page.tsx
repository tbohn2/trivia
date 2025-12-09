'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PlayerGamePage() {
    const params = useParams();
    const gameId = params.id as string;
    const [playerId, setPlayerId] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [error, setError] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedAnswer, setSubmittedAnswer] = useState(false);
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPlayerId = sessionStorage.getItem('playerId') || '';
            const storedSessionName = sessionStorage.getItem('sessionName') || '';

            if (!storedSessionName || !storedPlayerId) {
                router.push('/game');
                return;
            }
            setPlayerId(storedPlayerId);
            setSessionName(storedSessionName);
            sessionStorage.setItem('gameId', gameId);

            setIsLoaded(true);
        }
    }, [gameId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setSubmittedAnswer(false);
        try {
            const response = await fetch(`/api/players/${playerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer, gameId }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit answer');
            }
            const data = await response.json();
            setAnswer(data.answer);
            setSubmittedAnswer(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            setTimeout(() => {
                setError('');
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };




    return (
        <main className="atma flex flex-col items-center justify-center gap-12 px-8 py-16">
            <form onSubmit={handleSubmit} className="w-11/12 flex flex-col items-center justify-center gap-4 rounded-2xl bg-tertiary p-8">
                <h1 className="text-4xl hennyPenny text-center">{sessionName}</h1>
                <label htmlFor="answer" className="text-2xl text-center">Answer Below</label>
                {submittedAnswer && (
                    <div className="hennyPenny w-full rounded-lg bg-green border-2 border-primary text-primary p-4 text-2xl text-center">
                        Answer Submitted!
                    </div>
                )}
                <textarea id="answer" rows={5} name="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full rounded-lg p-2 text-xl text-dark bg-light placeholder-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                {error && (
                    <div className="w-full rounded-lg bg-light border-2 border-light p-4 text-xl text-primary">
                        {error}
                    </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full button button1 text-2xl">{isSubmitting ? 'Submitting...' : 'Submit Answer'}</button>
            </form>
            <button onClick={() => { setAnswer(''); setSubmittedAnswer(false); }} className="w-11/12 button button3 text-2xl">Clear Answer</button>
        </main>
    );
}