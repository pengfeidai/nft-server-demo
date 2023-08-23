import { MidwayConfig } from '@midwayjs/core';
import * as redisStore from 'cache-manager-ioredis';

const redisConfig = {
  host: process.env.REDIS_CLIENT_HOST || '127.0.0.1',
  port: +process.env.REDIS_CLIENT_PORT || 6379,
  password: process.env.REDIS_CLIENT_PASSWORD || '',
  db: +process.env.REDIS_CLIENT_DB || 0,
};

export default {
  keys: '1653908667752_4685',
  koa: { port: +process.env.KOA_PORT || 8001 },

  apiKeys: {
    nftScanApiKey: process.env.NFT_SCAN_API_KEY,
    blockinApiKey: process.env.BLOCKIN_API_KEY,
  },

  s3: {
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET,
  },

  cache: {
    store: redisStore,
    options: {
      ...redisConfig,
      keyPrefix: 'cache:',
      ttl: 60,
    },
  },
} as MidwayConfig;
