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

    const fileExtension = file.originalname.split('.').pop();
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
