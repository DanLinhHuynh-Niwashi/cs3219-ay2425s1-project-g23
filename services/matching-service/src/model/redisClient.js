// Connect to Redis
import { createClient } from 'redis';
const HOST = process.env.REDIS_HOST || '127.0.0.1'
const PORT = process.env.REDIS_PORT || 6379
export const redisClient = createClient({
    url: `redis://${HOST}:${PORT}`,
});
export const pubClient = createClient({
    url: `redis://${HOST}:${PORT}`,
});
export const subClient = createClient({
    url: `redis://${HOST}:${PORT}`,
});

export async function initializeRedis() {
    // Listen for connection events
    redisClient.on('connect', () => {
        redisClient.flushAll();
        console.log(`Connected to Redis on redis://${HOST}:${PORT}`);
    });

    redisClient.on('end', () => {
        
        console.log('Redis connection closed');
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    try {
        // Connect to Redis
        await redisClient.connect();
        await pubClient.connect();
        await subClient.connect();
        console.log('Redis client connected successfully');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
}