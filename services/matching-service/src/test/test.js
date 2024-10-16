import WebSocket from 'ws';
import { handleMessage, handleDisconnect } from '../controllers/websocket-match-controller.js';
import { removeFromActiveRequests, flushRedis, quitRedis } from '../model/message-queue.js';

//jest.setTimeout(30000); // Sets timeout to 30 seconds

describe('WebSocket Matching Controller', () => {
    let client1, client2;


    beforeEach(async () => {
        // Connect two clients before each test
        client1 = new WebSocket('ws://localhost:8080');
        client2 = new WebSocket('ws://localhost:8080');

        // Ensure clients are connected before proceeding with tests
        await new Promise((resolve) => client1.on('open', resolve));
        await new Promise((resolve) => client2.on('open', resolve));
    });

    afterEach(async () => {
        // Wait for both clients to close properly
        if (client1) {
            await new Promise((resolve) => {
                client1.on('close', resolve);
                client1.close(); // Initiate close
            });
        }
    
        if (client2) {
            await new Promise((resolve) => {
                client2.on('close', resolve);
                client2.close(); // Initiate close
            });
        }
    });

    it('should handle matching 2 users', async () => {
        const joinData1 = {
            event: 'joinQueue',
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Hard',
        };

        const joinData2 = {
            event: 'joinQueue',
            userId: 'user2',
            topic: 'JavaScript',
            difficulty: 'Hard',
        };

        const messagePromise1 = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                if (response.status === 200) {
                    resolve(response);
                }
            });
        });

        const messagePromise2 = new Promise((resolve) => {
            client2.on('message', (message) => {
                const response = JSON.parse(message);
                if (response.status === 200) {
                    resolve(response);
                }
            });
        });

        client1.send(JSON.stringify(joinData1)); // First join
        client2.send(JSON.stringify(joinData2)); // Second join

        const response1 = await messagePromise1; // Wait for the first join to be processed
        const response2 = await messagePromise2; // Wait for the second join to be processed

        // Validate the match results
        expect(response1.status).toBe(200);
        expect(response1.userId).toBe('user2'); // Matched with user2

        expect(response2.status).toBe(200);
        expect(response2.userId).toBe('user1'); // Matched with user1
    });

    it('should send an error message if the user already has a request in progress', async () => {
        const joinData = {
            event: 'joinQueue',
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Easy',
        };

        const messagePromise1 = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                resolve(response);
            });
        });

        client1.send(JSON.stringify(joinData)); // First join
        const response1 = await messagePromise1; // Wait for the first join to be processed
        console.log(response1);
        // Now attempt to send the second join request
        const secondJoinPromise = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                resolve(response);
            });
        });

        client1.send(JSON.stringify(joinData)); // Second join attempt

        const response2 = await secondJoinPromise; // Wait for the error response
        console.log(response2);
        // Assertions to verify the response
        expect(response2.status).toBe(500);
        expect(response2.message).toBe('You already have a matching request in progress.');
    });

    it('should handle joining the queue', async () => {
        const joinData = {
            event: 'joinQueue',
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Easy',
        };

        const messagePromise = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                resolve(response);
            });
        });

        client1.send(JSON.stringify(joinData)); // First join
        const response = await messagePromise; // Wait for the join to be processed
        console.log(response);
        // Validate the queue response
        expect(response.status).toBe(100);
        expect(response.user).toEqual({
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Easy'
        });
    });
});
