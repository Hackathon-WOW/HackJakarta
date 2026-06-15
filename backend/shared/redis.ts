import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log('📦 Connected to Redis');
  }
  return redisClient;
};

export const cacheSet = async (key: string, value: any, expirationInSeconds = 3600) => {
  const client = await connectRedis();
  await client.setEx(key, expirationInSeconds, JSON.stringify(value));
};

export const cacheGet = async (key: string) => {
  const client = await connectRedis();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheDelete = async (key: string) => {
  const client = await connectRedis();
  await client.del(key);
};
