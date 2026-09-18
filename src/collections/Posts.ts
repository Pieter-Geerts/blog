import type { CollectionConfig } from 'payload';
import { postContentBlocks } from '../blocks/PostContentBlocks';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'status', 'publishedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      unique: true,
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      label: 'Content blocks',
      blocks: postContentBlocks,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'affiliateLinks',
      type: 'array',
      label: 'Affiliate Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'trackingId',
          type: 'text',
        },
        {
          name: 'calloutStyle',
          type: 'select',
          options: [
            { label: 'Neutral', value: 'neutral' },
            { label: 'Featured', value: 'featured' },
          ],
          defaultValue: 'neutral',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
    },
  ],
};
