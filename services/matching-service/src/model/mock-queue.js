let queue = []

export function addToQueue(request) {
    const topic = request.topic;
    const difficulty = request.difficulty;
    const userId = request.userId;

    initializeTopicQueue(topic);
    queue[topic][difficulty].push(request);
    console.log(`User ${userId} added to ${difficulty} queue for topic ${topic}`);
}


export function removeFromQueue(request) {
    const topic = request.topic;
    const difficulty = request.difficulty;
    const userId = request.userId;
    if (!queue[topic] || !queue[topic][difficulty]) return;
    queue[topic][difficulty] = queue[topic][difficulty].filter(u => u.userId != userId);
}


function initializeTopicQueue(topic) {
    if (!queue[topic]) {
        queue[topic] = { Easy: [], Medium: [], Hard: [] };
    }
}

export function findMatch(topic, difficulty) {
    if (!queue[topic]) return null;

    // Exact match within the same difficulty
    const exactMatch = getExactMatch(topic, difficulty);
    if (exactMatch) return exactMatch;
        // Difficulty fallback logic
    return getFallbackMatch(topic, difficulty);
}


function getExactMatch(topic, difficulty) {
    if (queue[topic][difficulty] && queue[topic][difficulty].length >= 2) {
        const request1 = queue[topic][difficulty].shift();
        const request2 = queue[topic][difficulty].shift();
        console.log(`Matched ${request1.userId} with ${request2.userId} 
            on topic ${topic} with difficulty ${difficulty}`);
        return {request1, request2, topic, difficulty};
    }
    return null;
}


function getFallbackMatch(topic, difficulty) {
    if (difficulty === 'Hard') return attemptFallbackMatch(topic, difficulty, 'Medium', 'Easy');
    if (difficulty === 'Easy') return attemptFallbackMatch(topic, difficulty, 'Medium', 'Hard');
    if (difficulty === 'Medium') return attemptFallbackMatch(topic, difficulty, 'Hard', 'Easy');
    return null;
}

function attemptFallbackMatch(topic, difficulty, firstFallback, secondFallback) {
    if (queue[topic][difficulty] && queue[topic][difficulty].length >= 1) {
        if (queue[topic][difficulty] && queue[topic][firstFallback].length >= 1) {
            const request1 = queue[topic][difficulty].shift();
            const request2 = queue[topic][firstFallback].shift();
            console.log(`Matched ${request1.userId} with ${request2.userId} 
                on topic ${topic} with difficulty ${firstFallback}`);
            return {request1, request2, topic, firstFallback};
        }

        if (queue[topic][difficulty] && queue[topic][secondFallback].length >= 1) {
            const request1 = queue[topic][difficulty].shift();
            const request2 = queue[topic][secondFallback].shift();
            console.log(`Matched ${request1.userId} with ${request2.userId} 
                on topic ${topic} with difficulty ${secondFallback}`);
            return {request1, request2, topic, secondFallback};
        }
    }
    return null; // No match found
}