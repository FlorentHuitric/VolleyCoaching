import { Client as MinioClient } from 'minio';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class UploadService {
  private minioClient: MinioClient;
  private bucketName: string = 'player-avatars';

  constructor() {
    // Extract endpoint and port from MINIO_ENDPOINT env var
    const endpointEnv = process.env.MINIO_ENDPOINT || 'minio:9000';
    const [endpoint, portStr] = endpointEnv.includes(':')
      ? endpointEnv.split(':')
      : [endpointEnv, '9000'];

    this.minioClient = new MinioClient({
      endPoint: endpoint,
      port: parseInt(portStr),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`✅ Created MinIO bucket: ${this.bucketName}`);

        // Set bucket policy to public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('❌ Error initializing MinIO bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Ensure bucket exists before upload
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      console.log(`✅ Created MinIO bucket: ${this.bucketName}`);

      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
    }

    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    const fileExtension = extensions[file.mimetype];
    const header = file.buffer;
    const valid = file.mimetype === 'image/jpeg' ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
      : file.mimetype === 'image/png' ? header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : file.mimetype === 'image/webp' && header.toString('ascii',0,4) === 'RIFF' && header.toString('ascii',8,12) === 'WEBP';
    if (!fileExtension || !valid) throw new Error('Invalid image content');
    const fileName = `${uuidv4()}.${fileExtension}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      }
    );

    // Return the public URL accessible through nginx
    const publicUrl = process.env.MINIO_PUBLIC_URL || `http://storage.localhost`;
    return `${publicUrl}/${this.bucketName}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await this.minioClient.removeObject(this.bucketName, fileName);
      }
    } catch (error) {
      console.error('❌ Error deleting file from MinIO:', error);
    }
  }
}
