let queue = []; // Store users in the queue

export const addUserToQueue = (user) => {
    // Check if the user is already in the queue
    const userExists = queue.some((u) => u.userId === user.userId);
    
    // If the user exists, do nothing
    if (userExists) {
        return;
    }

    queue.push(user);
};

export const getQueue = () => {
    return queue;
};

export const clearQueue = () => {
    queue = [];
};

export const removeUserFromQueue = (userId) => {
    queue = queue.filter((u) => u.userId !== userId);
};

// Function to simulate finding a match
export const findMatch = (user) => {
    // Find users that match the topic first
    const topicMatches = queue.filter(
        (u) => u.userId !== user.userId && u.topic === user.topic
    );

    // If there are topic matches, find one that also matches difficulty
    if (topicMatches.length > 0) {
        const difficultyMatch = topicMatches.find(
        (u) => u.difficulty === user.difficulty
        );

        if (difficultyMatch) {
            // Remove matched users from the queue
            removeUserFromQueue(user.userId);
            removeUserFromQueue(difficultyMatch.userId);
            return difficultyMatch;
        } else {
            // If no exact difficulty match, return the first topic match
            const firstMatch = topicMatches[0];
            removeUserFromQueue(user.userId);
            removeUserFromQueue(firstMatch.userId);
            return firstMatch;
        }
    }
    return null;
};
