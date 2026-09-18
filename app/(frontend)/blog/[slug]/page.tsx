import { AffiliateLink } from '@/components/AffiliateLink';
import { NewsletterForm } from '@/components/NewsletterForm';
import { PostContentBlocks } from '@/components/PostContentBlocks';
import { getPostBySlug, getPublishedPosts, renderRichText } from '@/lib/content';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = renderRichText(post.content);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blog" className="mb-8 inline-flex text-sm text-zinc-500 transition hover:text-zinc-800">
        ← Back to journal
      </Link>

      <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-headings:text-zinc-900 prose-p:text-base prose-p:leading-8 prose-a:text-zinc-700 prose-a:underline-offset-4 prose-blockquote:border-zinc-200 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5">
        <header className="mb-8 border-b border-zinc-200 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <span key={tag.id ?? tag.name} className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {tag.name}
              </span>
            ))}
          </div>
        </header>

        {post.featuredImage?.url ? (
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt ?? post.title}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div dangerouslySetInnerHTML={{ __html: content }} />

        <PostContentBlocks blocks={post.contentBlocks} />

        {post.affiliateLinks && post.affiliateLinks.length > 0 ? (
          <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Recommended</p>
            <div className="flex flex-col gap-3">
              {post.affiliateLinks.map((link, index) => (
                <AffiliateLink
                  key={link.id ?? `${link.url}-${index}`}
                  href={link.url}
                  label={link.label}
                  trackingId={link.trackingId || link.label}
                  calloutStyle={link.calloutStyle ?? 'neutral'}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-zinc-200 pt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Newsletter</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">Stay in the loop</h2>
          <NewsletterForm />
        </div>
      </article>
    </main>
  );
}
