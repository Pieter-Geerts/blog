import config from '@/payload.config';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import { getPayload } from 'payload';

export type AffiliateLinkItem = {
  id?: string;
  label: string;
  url: string;
  trackingId?: string;
  calloutStyle?: 'neutral' | 'featured';
};

export type MediaItem = {
  url?: string;
  alt?: string;
};

export type ImageContentBlock = {
  id?: string;
  blockType: 'image';
  image?: MediaItem;
  caption?: string;
  size?: 'article' | 'wide';
};

export type GalleryContentBlock = {
  id?: string;
  blockType: 'gallery';
  images?: Array<{
    id?: string;
    image?: MediaItem;
    caption?: string;
  }>;
};

export type PullQuoteContentBlock = {
  id?: string;
  blockType: 'pullQuote';
  quote?: string;
  attribution?: string;
};

export type CalloutContentBlock = {
  id?: string;
  blockType: 'callout';
  tone?: 'note' | 'important' | 'quiet';
  title?: string;
  body?: string;
};

export type CodeContentBlock = {
  id?: string;
  blockType: 'code';
  language?: string;
  code?: string;
};

export type VideoEmbedContentBlock = {
  id?: string;
  blockType: 'videoEmbed';
  url?: string;
  title?: string;
};

export type PostContentBlock =
  | ImageContentBlock
  | GalleryContentBlock
  | PullQuoteContentBlock
  | CalloutContentBlock
  | CodeContentBlock
  | VideoEmbedContentBlock;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: 'draft' | 'published';
  content?: unknown;
  tags?: Array<{ id?: string; name?: string }>;
  featuredImage?: MediaItem;
  contentBlocks?: PostContentBlock[];
  affiliateLinks?: AffiliateLinkItem[];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function normalizeMediaUrl(url?: string): string | undefined {
  if (!url || !url.startsWith('/api/media/file/')) {
    return url;
  }

  const prefix = '/api/media/file/';
  return `${prefix}${encodeURIComponent(url.slice(prefix.length))}`;
}

function normalizeMedia(value: unknown): MediaItem | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    url: normalizeMediaUrl(asString(value.url)),
    alt: asString(value.alt),
  };
}

function normalizeContentBlock(block: unknown): PostContentBlock | null {
  if (!isRecord(block)) {
    return null;
  }

  const id = asString(block.id);

  switch (block.blockType) {
    case 'image':
      return {
        id,
        blockType: 'image',
        image: normalizeMedia(block.image),
        caption: asString(block.caption),
        size: block.size === 'wide' ? 'wide' : 'article',
      };
    case 'gallery':
      return {
        id,
        blockType: 'gallery',
        images: Array.isArray(block.images)
          ? block.images.map((item) => {
              const galleryItem = isRecord(item) ? item : {};
              return {
                id: asString(galleryItem.id),
                image: normalizeMedia(galleryItem.image),
                caption: asString(galleryItem.caption),
              };
            })
          : [],
      };
    case 'pullQuote':
      return {
        id,
        blockType: 'pullQuote',
        quote: asString(block.quote),
        attribution: asString(block.attribution),
      };
    case 'callout':
      return {
        id,
        blockType: 'callout',
        tone: block.tone === 'important' || block.tone === 'quiet' ? block.tone : 'note',
        title: asString(block.title),
        body: asString(block.body),
      };
    case 'code':
      return {
        id,
        blockType: 'code',
        language: asString(block.language),
        code: asString(block.code),
      };
    case 'videoEmbed':
      return {
        id,
        blockType: 'videoEmbed',
        url: asString(block.url),
        title: asString(block.title),
      };
    default:
      return null;
  }
}

function normalizeContentBlocks(value: unknown): PostContentBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((block) => {
    const normalized = normalizeContentBlock(block);
    return normalized ? [normalized] : [];
  });
}

const contentBlocksShowcasePost: BlogPost = {
  id: 'example-content-blocks-showcase',
  slug: 'content-blocks-showcase',
  title: 'Content blocks showcase',
  summary:
    'A working demo post that shows every custom blog block: images, galleries, quotes, callouts, code, video, and affiliate recommendations.',
  publishedAt: '2026-09-15T08:00:00.000Z',
  status: 'published',
  tags: [{ name: 'Demo' }, { name: 'Blocks' }, { name: 'Editorial system' }],
  featuredImage: {
    url: '/demo-content-blocks/featured.svg',
    alt: 'Abstract editorial workspace with layered paper shapes',
  },
  content: {
    root: {
      type: 'root',
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'heading',
          tag: 'h2',
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'A complete post canvas',
              type: 'text',
              version: 1,
            },
          ],
        },
        {
          type: 'paragraph',
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'This example post uses the normal rich text field for the main essay and the structured content blocks for richer sections that need more control.',
              type: 'text',
              version: 1,
            },
          ],
        },
        {
          type: 'paragraph',
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Use rich text for flow: paragraphs, headings, lists, links, emphasis, and quotes. Use blocks when a section needs media, layout, captions, code, or a visual treatment.',
              type: 'text',
              version: 1,
            },
          ],
        },
      ],
    },
  },
  contentBlocks: [
    {
      id: 'showcase-image-wide',
      blockType: 'image',
      image: {
        url: '/demo-content-blocks/wide-image.svg',
        alt: 'Wide editorial image block with a calm grid composition',
      },
      caption: 'Image blocks are good for single moments that need a caption and strong placement.',
      size: 'wide',
    },
    {
      id: 'showcase-pull-quote',
      blockType: 'pullQuote',
      quote: 'A good content system gives every idea the smallest structure it needs, and no more.',
      attribution: 'Example pull quote',
    },
    {
      id: 'showcase-callout-note',
      blockType: 'callout',
      tone: 'note',
      title: 'Editorial note',
      body: 'Callouts are useful for context, warnings, definitions, or short side notes that should stand apart from the main essay.',
    },
    {
      id: 'showcase-gallery',
      blockType: 'gallery',
      images: [
        {
          id: 'gallery-1',
          image: {
            url: '/demo-content-blocks/gallery-one.svg',
            alt: 'First gallery tile with notebook-style shapes',
          },
          caption: 'Gallery item with caption.',
        },
        {
          id: 'gallery-2',
          image: {
            url: '/demo-content-blocks/gallery-two.svg',
            alt: 'Second gallery tile with image frame shapes',
          },
          caption: 'A second image in the same visual set.',
        },
      ],
    },
    {
      id: 'showcase-code',
      blockType: 'code',
      language: 'tsx',
      code: "export function SmallIdea() {\n  return <p>Keep the writing simple and the structure intentional.</p>;\n}",
    },
    {
      id: 'showcase-callout-important',
      blockType: 'callout',
      tone: 'important',
      title: 'Production habit',
      body: 'Every image needs useful alt text, every embed needs a title, and every block should earn its place in the article.',
    },
    {
      id: 'showcase-video',
      blockType: 'videoEmbed',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Example video embed',
    },
  ],
  affiliateLinks: [
    {
      id: 'showcase-affiliate-featured',
      label: 'Example featured recommendation',
      url: 'https://example.com/featured',
      trackingId: 'showcase_featured_recommendation',
      calloutStyle: 'featured',
    },
    {
      id: 'showcase-affiliate-neutral',
      label: 'Example secondary recommendation',
      url: 'https://example.com/secondary',
      trackingId: 'showcase_secondary_recommendation',
      calloutStyle: 'neutral',
    },
  ],
};

const fallbackPosts: BlogPost[] = [
  contentBlocksShowcasePost,
  {
    id: 'fallback-1',
    slug: 'a-slower-way-to-build',
    title: 'A slower way to build',
    summary:
      'A minimal note on thoughtful product decisions, quiet design, and why sustainable creative work often wins in the long run.',
    publishedAt: '2025-01-14T08:00:00.000Z',
    status: 'published',
    tags: [{ name: 'Writing' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'A simple first draft is often better than a loud one.' }],
          },
        ],
      },
    },
  },
  {
    id: 'fallback-2',
    slug: 'notes-on-editorial-design',
    title: 'Notes on editorial design',
    summary:
      'Some of the strongest digital experiences feel calm, spacious, and highly readable — like a thoughtful printed magazine.',
    publishedAt: '2025-01-08T08:00:00.000Z',
    status: 'published',
    tags: [{ name: 'Design' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Editorial design rewards clarity over noise.' }],
          },
        ],
      },
    },
  },
  {
    id: 'fallback-3',
    slug: 'building-with-intention',
    title: 'Building with intention',
    summary:
      'A small digital practice can still feel personal, durable, and deeply considered when the fundamentals are strong.',
    publishedAt: '2024-12-22T08:00:00.000Z',
    status: 'published',
    tags: [{ name: 'Process' }],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'The best tools are often the simplest ones to keep using.' }],
          },
        ],
      },
    },
  },
];

function normalizePost(post: unknown): BlogPost {
  const record = isRecord(post) ? post : {};

  return {
    id: asString(record.id) ?? asString(record._id) ?? `${asString(record.slug) ?? 'post'}-${Math.random()}`,
    slug: asString(record.slug) ?? 'untitled',
    title: asString(record.title) ?? 'Untitled',
    summary: asString(record.summary) ?? '',
    publishedAt: asString(record.publishedAt) ?? new Date().toISOString(),
    status: record.status === 'draft' ? 'draft' : 'published',
    content: record.content,
    tags: Array.isArray(record.tags) ? record.tags : [],
    featuredImage: normalizeMedia(record.featuredImage),
    contentBlocks: normalizeContentBlocks(record.contentBlocks),
    affiliateLinks: Array.isArray(record.affiliateLinks) ? record.affiliateLinks as AffiliateLinkItem[] : [],
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 20,
      sort: '-publishedAt',
      where: {
        status: {
          equals: 'published',
        },
      },
    });

    const posts = (result.docs ?? []).map(normalizePost);
    const hasShowcasePost = posts.some((post) => post.slug === contentBlocksShowcasePost.slug);

    return hasShowcasePost ? posts : [contentBlocksShowcasePost, ...posts];
  } catch {
    return fallbackPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    const post = result.docs?.[0];
    return post ? normalizePost(post) : fallbackPosts.find((fallbackPost) => fallbackPost.slug === slug) ?? null;
  } catch {
    const match = fallbackPosts.find((post) => post.slug === slug);
    return match ?? null;
  }
}

export function renderRichText(content: unknown): string {
  if (!content) {
    return '<p>Content coming soon.</p>';
  }

  try {
    return convertLexicalToHTML({
      data: content as Parameters<typeof convertLexicalToHTML>[0]['data'],
    });
  } catch {
    return '<p>Content coming soon.</p>';
  }
}
