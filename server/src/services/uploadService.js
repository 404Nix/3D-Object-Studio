import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import s3Client from '../config/s3.js';
import env from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');


const ensureUploadsDir = async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
};


const uploadService = {

  async uploadFile(fileBuffer, originalName, mimetype) {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    const key = `models/${uniqueName}`;

    // If S3 is configured, upload to S3
    if (env.isS3Configured && s3Client) {
      return this.uploadToS3(fileBuffer, key, mimetype);
    }

    // Otherwise, save locally
    return this.uploadToLocal(fileBuffer, uniqueName);
  },


  async uploadToS3(fileBuffer, key, mimetype) {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype || 'model/gltf-binary',
      },
    });

    await upload.done();

    const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      url,
      key,
      storageType: 's3',
    };
  },


  async uploadToLocal(fileBuffer, fileName) {
    await ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${fileName}`;

    return {
      url,
      key: fileName,
      storageType: 'local',
    };
  },


  async deleteFile(key, storageType) {
    if (storageType === 's3' && s3Client) {
      const command = new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      });
      await s3Client.send(command);
    } else {
      const filePath = path.join(UPLOADS_DIR, key);
      try {
        await fs.unlink(filePath);
      } catch {
        // File already be deleted
      }
    }
  },
};

export default uploadService;
