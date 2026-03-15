declare module '@aws-sdk/s3-request-presigner' {
  import { S3Client } from '@aws-sdk/client-s3'
  export function getSignedUrl(
    client: S3Client,
    command: any,
    options?: { expiresIn?: number }
  ): Promise<string>
}
