import { getPublishedPosts } from '@/lib/content';
import Link from 'next/link';

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 border-b border-zinc-200 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Writing</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">Journal</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
              <Link href={`/blog/${post.slug}`} className="hover:text-zinc-600">
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">{post.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
                <span key={tag.id ?? tag.name} className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {tag.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
