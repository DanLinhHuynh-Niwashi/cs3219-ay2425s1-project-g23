// matchingController.test.js
import request from 'supertest';
import app from '../index.js'; // Import your Express app
import { addUserToQueue, getQueue, clearQueue, removeUserFromQueue } from '../mock-queue.js';

describe('Matching Controller Integration Tests', () => {
    beforeEach(() => {
        // Reset the queue before each test
        clearQueue();
    });

    jest.setTimeout(20000); // 20 seconds

    it('should find a match and return it', async () => {
        const mockUser1 = { userId: '1', topic: 'Algorithms', difficulty: 'easy' };
        const mockUser2 = { userId: '2', topic: 'Algorithms', difficulty: 'easy' };

        // Add mockUser2 to the queue directly
        addUserToQueue(mockUser2);
        expect(getQueue()).toContainEqual(mockUser2);

        const response = await request(app)
            .post('/match')
            .send(mockUser1);

        // Log the response for debugging
        console.log('Response:', response.body);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Match found!",
            match: mockUser2,
        });
        
    });

    it('should return an error if no match is found within 10 seconds', async () => {
        const mockUser1 = { userId: '1', topic: 'UnknownTopic', difficulty: 'unknown' };

        // Simulate a request to find a match
        const response = await request(app)
            .post('/match')
            .send(mockUser1);

        // Log the response for debugging
        console.log('Response:', response.body);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: "Request timed out: No match found after 10 seconds",
        });
        expect(getQueue()).toContainEqual(mockUser1);
    });

    it('should cancel a match request successfully', async () => {
        const userId = '2';

        const mockUser2 = { userId: '2', topic: 'Algorithms', difficulty: 'easy' };

        // Add mockUser2 to the queue directly
        addUserToQueue(mockUser2);
        expect(getQueue()).toContainEqual(mockUser2);

        const response = await request(app)
            .delete(`/match/${userId}`)
            .send();

        // Log the response for debugging
        console.log('Response:', response.body);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: `Match request cancelled for user: ${userId}` });
        expect(getQueue()).toEqual([]);
    });
});
