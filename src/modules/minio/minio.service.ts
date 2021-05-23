import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Express } from 'express';

import { IMinioService } from './interfaces/minio-service.interface';

@Injectable()
export class MinioService implements IMinioService {
  public readonly expiryTime = 60 * 15; // 15 MINUTES
  public readonly bucketName = 'mypolitics-cdn';
  private minioClient: Minio.Client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.minioClient = new Minio.Client(configService.get('minio'));
    this.initBucket();
  }

  private async initBucket(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, '');
    }
  }

  public async uploadFileToFilePath(meta: Express.Multer.File, file: Buffer, filePath: string): Promise<string> {
    const metaData = {
      'Content-Type': meta.mimetype,
    };

    await this.minioClient.putObject(
      this.bucketName,
      filePath,
      file,
      metaData,
    );

    const url = await this.minioClient.presignedUrl('GET', this.bucketName, filePath);
    return url.split('?')[0];
  }

  public async deleteFileFromFilePath(filePath: string): Promise<void> {
    return this.minioClient.removeObject(
      this.bucketName,
      filePath,
    );
  }

  public async getPresignedUrl(filePath: string): Promise<string> {
    return this.minioClient.presignedGetObject(
      this.bucketName,
      filePath,
      this.expiryTime
    );
  }
}
