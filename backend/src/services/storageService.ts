import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('storageService');

const defaultClient = new S3Client({
  region: 'auto',
  endpoint: config.storage.endpoint,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
});

export class StorageService {
  constructor(private client: S3Client = defaultClient) {}

  async uploadBuffer(options: {
    buffer: Buffer;
    mimeType: string;
    prefix: 'inputs' | 'outputs';
    extension?: string;
  }): Promise<{ key: string; url: string }> {
    const id = crypto.randomUUID();
    const extension = options.extension ?? options.mimeType.split('/')[1] ?? 'bin';
    const key = `${config.storage.folder}/${options.prefix}/${id}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: options.buffer,
      ContentType: options.mimeType,
      ACL: 'public-read',
    });

    await this.client.send(command);
    const url = new URL(key, config.storage.publicBaseUrl).toString();
    logger.info('Uploaded asset to storage', { key });
    return { key, url };
  }
}

export const storageService = new StorageService();

