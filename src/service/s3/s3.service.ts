import { Init, Inject, Config, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { IS3Config } from '../../interface';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';

@Provide()
export class S3Service {
  @Config('s3') s3Config: IS3Config;

  @Inject() logger: ILogger;

  private s3Client: S3;

  @Init()
  async init() {
    this.s3Client = new S3({
      endpoint: this.s3Config.endpoint,
      forcePathStyle: true,
    });
  }

  async upload(key: string, body: StreamingBlobPayloadInputTypes, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.s3Config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      await this.s3Client.send(command);
      return key;
    } catch (err) {
      this.logger.error('S3Service.upload error:', err);
      return null;
    }
  }
}
