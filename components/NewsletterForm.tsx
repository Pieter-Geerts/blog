'use client';

import { FormEvent, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    trackEvent('newsletter_submit');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to subscribe right now.');
      }

      setStatus('success');
      setMessage('You are subscribed. A thoughtful note will be on its way soon.');
      setEmail('');
      trackEvent('newsletter_signup', { result: 'success' });
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
      trackEvent('newsletter_signup', { result: 'error' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="min-h-11 flex-1 rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="min-h-11 rounded-full border border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'loading' ? 'Joining…' : 'Join the list'}
        </button>
      </div>
      {message ? (
        <p
          className={`w-full text-sm ${status === 'error' ? 'text-red-600' : 'text-zinc-600'}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
