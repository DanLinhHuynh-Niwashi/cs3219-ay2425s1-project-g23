// Connect to Redis
import { createClient } from 'redis';
const HOST = process.env.REDIS_HOST || '127.0.0.1'
const PORT = process.env.REDIS_PORT || 6379
const redisClient = createClient({
    url: `redis://${HOST}:${PORT}`,
});
const keys = [];
const ACTIVE_REQUESTS_SET = 'activeRequests'; // Set for storing active user IDs

// Async function to connect to Redis
export async function initializeRedis() {
    // Listen for connection events
    redisClient.on('connect', () => {
        console.log(`Connected to Redis on redis://${HOST}:${PORT}`);
        redisClient.flushAll();
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
        console.log('Redis client connected successfully');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
}

export async function flushRedis() {
    if (redisClient.isOpen) {
        await redisClient.flushAll();
        for (const key of keys) {
            await logQueue(key);
        }
    }
}

export async function quitRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}

// Log the current items in a specific queue
async function logQueue(queueKey) {
    try {
        const members = await redisClient.sMembers(ACTIVE_REQUESTS_SET);
        console.log(`Active requests: ${members}`);
        
    } catch (error) {
        console.error('Error retrieving queue items:', error);
    }
}

// Helper function to generate Redis keys
function getQueueKey(topic, difficulty) {
    keys.push(`queue:${topic}:${difficulty}`)
    return `queue:${topic}:${difficulty}`;
}

// Add user ID to active requests
export async function addToActiveRequests(userId) {
    await redisClient.sAdd(ACTIVE_REQUESTS_SET, userId);
}

// Remove user ID from active requests
export async function removeFromActiveRequests(userId) {
    console.log(`Removed ${userId} from the active queue.`)
    logQueue(ACTIVE_REQUESTS_SET)
    await redisClient.sRem(ACTIVE_REQUESTS_SET, userId);
}

// Check if user ID is in active requests
export async function isUserInActiveRequests(userId) {
    return await redisClient.sIsMember(ACTIVE_REQUESTS_SET, userId);
}

// Add a user request to the queue
export async function addToQueue(request) {
    const { topic, difficulty, userId } = request;

    const queueKey = getQueueKey(topic, difficulty);
    
    await redisClient.rPush(queueKey, JSON.stringify(request)); // Push user to Redis list
    console.log(`User ${userId} added to ${difficulty} queue for topic ${topic}`);
    // Add user ID to active requests
    await addToActiveRequests(userId);
}

// Remove a user request from the queue
export async function removeFromQueue(request) {
    const { topic, difficulty, userId } = request;
    const queueKey = getQueueKey(topic, difficulty);
    
    const queue = await redisClient.lRange(queueKey, 0, -1); // Get all entries in the list
    const updatedQueue = queue.filter(u => JSON.parse(u).userId !== userId);

    await redisClient.del(queueKey); // Clear the old list
    if (updatedQueue.length) {
        await redisClient.rPush(queueKey, ...updatedQueue); // Push the updated list back to Redis
    }

    // Remove user ID from active requests
    await removeFromActiveRequests(userId);
}

// Function to find a match for a user request
export async function findMatch(topic, difficulty) {
    const exactMatch = await getExactMatch(topic, difficulty);
    if (exactMatch!=null) { return exactMatch; }
    return await getFallbackMatch(topic, difficulty); // Attempt fallback match if no exact match
}

// Function to get an exact match in the same difficulty
async function getExactMatch(topic, difficulty) {
    const queueKey = getQueueKey(topic, difficulty);
    const queue = await redisClient.lRange(queueKey, 0, -1); // Get all users in the queue

    if (queue.length >= 2) {
        const [request1, request2] = [JSON.parse(queue.shift()), JSON.parse(queue.shift())];

        await redisClient.del(queueKey);
        if (queue.length) {
            await redisClient.rPush(queueKey, ...queue);
        }

        console.log(`Matched ${request1.userId} with ${request2.userId} on topic ${topic} with difficulty ${difficulty}`);
        return { request1, request2, topic, difficulty };
    }
    return null;
}

// Function to attempt fallback match
async function getFallbackMatch(topic, difficulty) {

    switch (difficulty) {
        case 'Hard':
            return await attemptFallbackMatch(topic, difficulty, 'Medium', 'Easy');
        case 'Easy':
            return await attemptFallbackMatch(topic, difficulty, 'Medium', 'Hard');
        case 'Medium':
            return await attemptFallbackMatch(topic, difficulty, 'Hard', 'Easy');
        default:
            return null;
    }
}

// Function to perform the fallback logic for matching
async function attemptFallbackMatch(topic, difficulty, firstFallback, secondFallback) {
    const [difficultyQueue, firstFallbackQueue, secondFallbackQueue] = await Promise.all([
        redisClient.lRange(getQueueKey(topic, difficulty), 0, -1),
        redisClient.lRange(getQueueKey(topic, firstFallback), 0, -1),
        redisClient.lRange(getQueueKey(topic, secondFallback), 0, -1),
    ]);

    console.log(`Trying fallback match for ${topic} - Current queues: 
        [${difficulty}: ${difficultyQueue.length}, ${firstFallback}: ${firstFallbackQueue.length}, ${secondFallback}: ${secondFallbackQueue.length}]`);

    if (difficultyQueue.length > 0) {
        if (firstFallbackQueue.length > 0) {
            return await processMatch(topic, difficulty, firstFallback, difficultyQueue, firstFallbackQueue);
        }

        if (secondFallbackQueue.length > 0) {
            return await processMatch(topic, difficulty, secondFallback, difficultyQueue, secondFallbackQueue);
        }
    }

    console.log(`No match found for ${topic} with difficulty ${difficulty}.`);
    return null; // No match found
}

// In the processMatch function, make sure to log the matched users
async function processMatch(topic, difficulty, fallbackDifficulty, difficultyQueue, fallbackQueue) {
    const request1 = JSON.parse(difficultyQueue.shift());
    const request2 = JSON.parse(fallbackQueue.shift());
    
    await updateQueue(getQueueKey(topic, difficulty), difficultyQueue);
    await updateQueue(getQueueKey(topic, fallbackDifficulty), fallbackQueue);

    console.log(`Matched ${request1.userId} with ${request2.userId} on topic ${topic} with difficulty ${fallbackDifficulty}`);
    return { request1, request2, topic, difficulty: fallbackDifficulty };
}


// Helper function to update the queue in Redis after processing
async function updateQueue(queueKey, updatedQueue) {
    await redisClient.del(queueKey);
    if (updatedQueue.length) {
        await redisClient.rPush(queueKey, ...updatedQueue);
    }
}
