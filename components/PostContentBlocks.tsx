import type { PostContentBlock } from '@/lib/content';

type PostContentBlocksProps = {
  blocks?: PostContentBlock[];
};

function getVideoEmbedUrl(url?: string): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (parsedUrl.hostname === 'vimeo.com') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function blockKey(block: PostContentBlock, index: number) {
  return block.id ?? `${block.blockType}-${index}`;
}

export function PostContentBlocks({ blocks }: PostContentBlocksProps) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className="not-prose mt-10 flex flex-col gap-10">
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'image': {
            if (!block.image?.url) {
              return null;
            }

            return (
              <figure key={blockKey(block, index)} className={block.size === 'wide' ? 'md:-mx-12' : undefined}>
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                  <img
                    src={block.image.url}
                    alt={block.image.alt ?? block.caption ?? ''}
                    className="h-auto w-full object-cover"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="mt-3 text-sm leading-6 text-zinc-500">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          }

          case 'gallery': {
            const images = block.images?.filter((item) => item.image?.url) ?? [];

            if (!images.length) {
              return null;
            }

            return (
              <div key={blockKey(block, index)} className="grid gap-4 sm:grid-cols-2">
                {images.map((item, itemIndex) => (
                  <figure key={item.id ?? `${blockKey(block, index)}-${itemIndex}`}>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <img
                        src={item.image?.url}
                        alt={item.image?.alt ?? item.caption ?? ''}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    </div>
                    {item.caption ? (
                      <figcaption className="mt-2 text-sm leading-6 text-zinc-500">{item.caption}</figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            );
          }

          case 'pullQuote':
            if (!block.quote) {
              return null;
            }

            return (
              <figure key={blockKey(block, index)} className="border-l-4 border-zinc-900 py-2 pl-6">
                <blockquote className="text-2xl font-semibold leading-10 tracking-tight text-zinc-900">
                  {block.quote}
                </blockquote>
                {block.attribution ? (
                  <figcaption className="mt-4 text-sm text-zinc-500">{block.attribution}</figcaption>
                ) : null}
              </figure>
            );

          case 'callout': {
            if (!block.body) {
              return null;
            }

            const toneClass = {
              important: 'border-zinc-900 bg-zinc-900 text-white',
              note: 'border-zinc-200 bg-white text-zinc-800',
              quiet: 'border-zinc-200 bg-zinc-50 text-zinc-700',
            }[block.tone ?? 'note'];

            const bodyClass = block.tone === 'important' ? 'text-zinc-200' : 'text-zinc-600';

            return (
              <aside key={blockKey(block, index)} className={`rounded-2xl border p-5 ${toneClass}`}>
                {block.title ? <h2 className="text-lg font-semibold tracking-tight">{block.title}</h2> : null}
                <p className={`mt-2 text-sm leading-7 ${bodyClass}`}>{block.body}</p>
              </aside>
            );
          }

          case 'code':
            if (!block.code) {
              return null;
            }

            return (
              <figure key={blockKey(block, index)} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                {block.language ? (
                  <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">
                    {block.language}
                  </figcaption>
                ) : null}
                <pre className="overflow-x-auto p-4 text-sm leading-7 text-zinc-100">
                  <code>{block.code}</code>
                </pre>
              </figure>
            );

          case 'videoEmbed': {
            const embedUrl = getVideoEmbedUrl(block.url);

            if (!embedUrl) {
              return null;
            }

            return (
              <div key={blockKey(block, index)} className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950">
                <iframe
                  src={embedUrl}
                  title={block.title ?? 'Embedded video'}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
