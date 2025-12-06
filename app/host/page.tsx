'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [formInputs, setFormInputs] = useState([
    { name: 'sessionName', label: 'Session Name', type: 'text', placeholder: 'Enter session name', value: '' },
    { name: 'hostName', label: 'Host Name', type: 'text', placeholder: 'Enter your name', value: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();


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
    setIsLoading(true);

    const sessionNameInput = formInputs.find(input => input.name === 'sessionName');
    const hostNameInput = formInputs.find(input => input.name === 'hostName');
    const sessionName = sessionNameInput?.value || '';
    const hostName = hostNameInput?.value || '';

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: hostName,
          sessionName: sessionName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const session = await response.json();
      // Store session ID in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sessionId', session.id);
      }
      // Navigate to host page
      router.push(`/host/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="hennyPenny flex min-h-screen w-full flex-col items-center justify-center">
      <div className="max-w-md rounded-2xl bg-tertiary p-8 w-11/12">
        <h1 className="text-3xl font-bold text-dark text-center">
          Enter Session Details
        </h1>

        <form onSubmit={handleSubmit} className="atma flex flex-col gap-6 pt-4">
          {formInputs.map((input, index) => (
            <div key={input.name}>
              <label htmlFor={input.name} className="text-dark text-2xl">
                {input.label}
              </label>
              <input id={index.toString()} name={input.name} type={input.type} value={input.value} onChange={handleInputChange} required className="w-full rounded-lg p-3 text-xl text-dark bg-light placeholder-primary focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder={input.placeholder} disabled={isLoading} />
            </div>
          ))}

          {
            error && (
              <div className="rounded-lg bg-primary text-xl text-center p-4 text-light">
                {error}
              </div>
            )
          }

          <button
            type="submit"
            disabled={isLoading}
            className="button button1 text-xl hennyPenny"
          >
            {isLoading ? 'Starting Session...' : 'Start Session'}
          </button>
        </form >
      </div >
    </main >
  );
}
