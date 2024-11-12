import { redisClient } from './redisClient.js';

const keys = [];
const ACTIVE_REQUESTS_SET = 'activeRequests'; // Set for storing active user IDs

// Log the current items in a specific queue
async function logActiveQueue() {
    try {
        const members = await redisClient.sMembers(ACTIVE_REQUESTS_SET);
        console.log(`Active requests: ${members}`);
        
    } catch (error) {
        console.error('Error retrieving queue items:', error);
    }
}

// Log the current items in a specific queue
async function logRequestQueues() {
    try {
        for (const key of keys) {
            const queue = await redisClient.lRange(key, 0, -1); // Get all entries in the list
            if (queue.length > 0) {
                const userIds = queue.map(request => JSON.parse(request).userId);
                console.log(`Queue: ${key} - User IDs: ${userIds.join(', ')}`);
            } else {
                console.log(`Queue: ${key} is empty.`);
            }
        }
    } catch (error) {
        console.error('Error retrieving queue items:', error);
    }
}

function getQueueKey(topic, difficulty) {
    
    const newKey = `queue:${topic}:${difficulty}`;
    if (!keys.includes(newKey)) {
        keys.push(newKey);
    }
    return newKey;
}

// Add user ID to active requests
export async function addToActiveRequests(userId) {
    await redisClient.sAdd(ACTIVE_REQUESTS_SET, userId);
    await logActiveQueue();
    await logRequestQueues();
}

// Remove user ID from active requests
export async function removeFromActiveRequests(userId) {
    console.log(`Removed ${userId} from the active queue.`)
    await redisClient.sRem(ACTIVE_REQUESTS_SET, userId);
    await logActiveQueue();
    await logRequestQueues();
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

// Find a match for a user request
export async function findMatch(topic, difficulty) {
    const exactMatch = await getExactMatch(topic, difficulty);
    if (exactMatch!=null) { return exactMatch; }
    return await getFallbackMatch(topic, difficulty); // Attempt fallback match if no exact match
}

// Get an exact match in the same difficulty
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

// Function to perform the fallback logic
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
