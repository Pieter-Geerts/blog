import config from "@/payload.config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { getPayload } from "payload";

export type AffiliateLinkItem = {
  id?: string;
  label: string;
  url: string;
  trackingId?: string;
  calloutStyle?: "neutral" | "featured";
};

export type MediaItem = {
  url?: string;
  alt?: string;
};

export type ImageContentBlock = {
  id?: string;
  blockType: "image";
  image?: MediaItem;
  caption?: string;
  size?: "article" | "wide";
};

export type GalleryContentBlock = {
  id?: string;
  blockType: "gallery";
  images?: Array<{
    id?: string;
    image?: MediaItem;
    caption?: string;
  }>;
};

export type PullQuoteContentBlock = {
  id?: string;
  blockType: "pullQuote";
  quote?: string;
  attribution?: string;
};

export type CalloutContentBlock = {
  id?: string;
  blockType: "callout";
  tone?: "note" | "important" | "quiet";
  title?: string;
  body?: string;
};

export type CodeContentBlock = {
  id?: string;
  blockType: "code";
  language?: string;
  code?: string;
};

export type VideoEmbedContentBlock = {
  id?: string;
  blockType: "videoEmbed";
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
  status: "draft" | "published";
  content?: unknown;
  tags?: Array<{ id?: string; name?: string }>;
  featuredImage?: MediaItem;
  contentBlocks?: PostContentBlock[];
  affiliateLinks?: AffiliateLinkItem[];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeMediaUrl(url?: string): string | undefined {
  if (!url || !url.startsWith("/api/media/file/")) {
    return url;
  }

  const prefix = "/api/media/file/";
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
    case "image":
      return {
        id,
        blockType: "image",
        image: normalizeMedia(block.image),
        caption: asString(block.caption),
        size: block.size === "wide" ? "wide" : "article",
      };
    case "gallery":
      return {
        id,
        blockType: "gallery",
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
    case "pullQuote":
      return {
        id,
        blockType: "pullQuote",
        quote: asString(block.quote),
        attribution: asString(block.attribution),
      };
    case "callout":
      return {
        id,
        blockType: "callout",
        tone:
          block.tone === "important" || block.tone === "quiet"
            ? block.tone
            : "note",
        title: asString(block.title),
        body: asString(block.body),
      };
    case "code":
      return {
        id,
        blockType: "code",
        language: asString(block.language),
        code: asString(block.code),
      };
    case "videoEmbed":
      return {
        id,
        blockType: "videoEmbed",
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

function normalizePost(post: unknown): BlogPost {
  const record = isRecord(post) ? post : {};

  return {
    id:
      asString(record.id) ??
      asString(record._id) ??
      `${asString(record.slug) ?? "post"}-${Math.random()}`,
    slug: asString(record.slug) ?? "untitled",
    title: asString(record.title) ?? "Untitled",
    summary: asString(record.summary) ?? "",
    publishedAt: asString(record.publishedAt) ?? new Date().toISOString(),
    status: record.status === "draft" ? "draft" : "published",
    content: record.content,
    tags: Array.isArray(record.tags) ? record.tags : [],
    featuredImage: normalizeMedia(record.featuredImage),
    contentBlocks: normalizeContentBlocks(record.contentBlocks),
    affiliateLinks: Array.isArray(record.affiliateLinks)
      ? (record.affiliateLinks as AffiliateLinkItem[])
      : [],
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      depth: 2,
      limit: 20,
      sort: "-publishedAt",
      where: {
        and: [
          { status: { equals: "published" } },
          { slug: { not_equals: "content-blocks-showcase" } },
        ],
      },
    });

    return (result.docs ?? []).map(normalizePost);
  } catch (error) {
    console.error("Failed to load published posts", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      depth: 2,
      limit: 1,
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: "published" } },
          { slug: { not_equals: "content-blocks-showcase" } },
        ],
      },
    });

    const post = result.docs?.[0];
    return post ? normalizePost(post) : null;
  } catch (error) {
    console.error(`Failed to load post: ${slug}`, error);
    return null;
  }
}

export function renderRichText(content: unknown): string {
  if (!content) {
    return "<p>Content coming soon.</p>";
  }

  try {
    return convertLexicalToHTML({
      data: content as Parameters<typeof convertLexicalToHTML>[0]["data"],
    });
  } catch {
    return "<p>Content coming soon.</p>";
  }
}
