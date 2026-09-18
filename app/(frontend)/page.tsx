import { NewsletterForm } from '@/components/NewsletterForm';
import { TrackedLink } from '@/components/TrackedLink';
import { getPublishedPosts } from '@/lib/content';
import Link from 'next/link';

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-0 py-12">
      <section className="flex flex-col gap-6 border-b border-zinc-200 pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Independent writing</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
          Thoughtful work for a slower internet.
        </h1>
        <p className="max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
          Essays, notes, and product thinking from a small studio shaped by quiet design, careful systems, and simple tools that last.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-700">
          <TrackedLink href="/blog" eventName="navigation_click" eventProperties={{ destination: 'journal', location: 'home_cta' }} className="rounded-full border border-zinc-300 px-4 py-2.5 transition hover:border-zinc-500">
            Read the journal
          </TrackedLink>
          <TrackedLink href="#newsletter" eventName="navigation_click" eventProperties={{ destination: 'newsletter', location: 'home_cta' }} className="rounded-full border border-zinc-300 px-4 py-2.5 transition hover:border-zinc-500">
            Join the newsletter
          </TrackedLink>
        </div>
      </section>

      <section className="py-12">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Latest notes</h2>
          <Link href="/blog" className="text-sm text-zinc-600 hover:text-zinc-900">
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {latestPosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{post.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="newsletter" className="border-t border-zinc-200 py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Newsletter</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">A note worth receiving.</h2>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            A concise monthly letter with fresh writing, thoughtful links, and the occasional behind-the-scenes update.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
