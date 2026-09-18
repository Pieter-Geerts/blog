import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Media } from './src/collections/Media';
import { Posts } from './src/collections/Posts';
import { Tags } from './src/collections/Tags';
import { Users } from './src/collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databasePort = Number(process.env.POSTGRES_PORT || '5432');

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [Users, Media, Tags, Posts],
  db: postgresAdapter({
    pool: {
      database: process.env.POSTGRES_DB || 'portfolio',
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      port: Number.isFinite(databasePort) ? databasePort : 5432,
      user: process.env.POSTGRES_USER || 'postgres',
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'change-me-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
});
