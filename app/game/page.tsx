'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePage() {
    const [formInputs, setFormInputs] = useState([
        { label: 'Game ID', name: 'gameId', type: 'text', placeholder: 'Enter Game ID', value: '' },
        { label: 'Player Name', name: 'playerName', type: 'text', placeholder: 'Enter Player Name', value: '' },
    ]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedGameId = sessionStorage.getItem('gameId') || '';
            if (storedGameId) {
                setFormInputs(prev =>
                    prev.map(input =>
                        input.name === 'gameId' ? { ...input, value: storedGameId } : input
                    )
                );
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormInputs(prev =>
            prev.map(input =>
                input.name === name ? { ...input, value } : input
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const gameId = formInputs.find(input => input.name === 'gameId')?.value || '';
        const playerName = formInputs.find(input => input.name === 'playerName')?.value || '';

        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: gameId, name: playerName }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create player');
            }
            const { player, sessionName } = await response.json();
            sessionStorage.setItem('playerId', player.id);
            sessionStorage.setItem('gameId', player.sessionId);
            sessionStorage.setItem('sessionName', sessionName);
            router.push(`/game/${player.sessionId}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="atma flex items-center justify-center px-8 py-16">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-tertiary p-8 w-11/12">
                {formInputs.map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                        <label htmlFor={field.name} className="text-dark text-2xl">{field.label}</label>
                        <input id={field.name} name={field.name} className="w-full rounded-lg p-3 text-xl text-dark bg-light placeholder-primary focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary" type={field.type} placeholder={field.placeholder} value={field.value} onChange={handleInputChange} />
                    </div>
                ))}
                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="button button1 text-2xl">Join Game</button>
            </form>
        </main>
    );
}