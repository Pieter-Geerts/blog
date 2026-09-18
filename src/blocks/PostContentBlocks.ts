import type { Block } from 'payload';

export const ImageBlock: Block = {
  slug: 'image',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'article',
      options: [
        { label: 'Article width', value: 'article' },
        { label: 'Wide', value: 'wide' },
      ],
    },
  ],
};

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
  ],
};

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  labels: {
    singular: 'Pull quote',
    plural: 'Pull quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
    },
  ],
};

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'note',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Important', value: 'important' },
        { label: 'Quiet', value: 'quiet' },
      ],
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
};

export const CodeBlock: Block = {
  slug: 'code',
  labels: {
    singular: 'Code',
    plural: 'Code blocks',
  },
  fields: [
    {
      name: 'language',
      type: 'text',
    },
    {
      name: 'code',
      type: 'textarea',
      required: true,
    },
  ],
};

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: {
    singular: 'Video embed',
    plural: 'Video embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
    },
  ],
};

export const postContentBlocks = [
  ImageBlock,
  GalleryBlock,
  PullQuoteBlock,
  CalloutBlock,
  CodeBlock,
  VideoEmbedBlock,
];
