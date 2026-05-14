import { S3Client } from '@aws-sdk/client-s3';
import env from './env.js';

let s3Client = null;

if (env.isS3Configured) {
  s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('✅ AWS S3 client initialized');
} else {
  console.warn('⚠️  AWS S3 not configured — using local file storage fallback');
}

export default s3Client;
