'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {


  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="hennyPenny flex flex-col items-center justify-center px-8 py-16 gap-12">
        <h1 className="w-full text-6xl flex flex-wrap justify-center items-center gap-4 font-bold hennyPenny">CHRISTMAS<span className="text-4xl w-full text-center">MOVIE TRIVIA</span></h1>
        <Link href="/host" className="button button1 text-3xl">Host Game</Link>
        <Link href="/game" className="button button1 text-3xl">Join Game</Link>
      </main>
    </div>
  );
}
