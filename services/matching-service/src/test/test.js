import WebSocket from 'ws';
import { handleMessage, handleDisconnect } from '../controllers/websocket-match-controller.js';
import { removeFromQueue } from '../model/mock-queue.js';

// Create a WebSocket server for testing
const server = new WebSocket.Server({ port: 8081 });

jest.setTimeout(30000); // Sets timeout to 10 seconds

describe('WebSocket Matching Controller', () => {
    let client1, client2;

    beforeAll((done) => {
        // Start the server before running tests
        server.on('connection', (ws) => {
            ws.on('message', (message) => {
                handleMessage(ws, message);
            });
            ws.on('close', () => {
                handleDisconnect(ws);
            });
        });

        done();
    });

    afterAll((done) => {
        server.close(); // Close the server after tests
        done();
    });

    beforeEach(async () => {
        // Connect two clients before each test
        client1 = new WebSocket('ws://localhost:8081');
        // Connect two clients before each test
        client2 = new WebSocket('ws://localhost:8081');

        await new Promise((resolve) => {
            client1.on('open', () => {
                resolve();
            });
        });
        await new Promise((resolve) => {
            client2.on('open', () => {
                resolve();
            });
        });
    });

    afterEach((done) => {
        // Close clients after each test
        client1.close();
        client2.close();
        done();
    });



    it('should handle matching 2 users', async() => {
        const joinData = {
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

        const messagePromise = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                if(response.status == 200) {
                    resolve(response);
                }
                
            });
        });
        const messagePromise2 = new Promise((resolve) => {
            client2.on('message', (message) => {
                const response = JSON.parse(message);
                if(response.status == 200) {
                    resolve(response);
                }
            });
        });
    
        client1.send(JSON.stringify(joinData)); // First join
        client2.send(JSON.stringify(joinData2)); // Second join

        const response = await messagePromise; // Wait for the first join to be processed
        const response2 = await messagePromise2; // Wait for the first join to be processed
        

        expect(response.status).toBe(200);
        expect(response.userId).toBe('user2');

        expect(response2.status).toBe(200);
        expect(response2.userId).toBe('user1');
    });

    it('should send an error message if the user already has a request in progress', async () => {
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
        const response = await messagePromise; // Wait for the first join to be processed

        // Now attempt to send the second join request
        const secondJoinPromise = new Promise((resolve) => {
            client1.on('message', (message) => {
                const response = JSON.parse(message);
                resolve(response);
            });
        });
    
        client1.send(JSON.stringify(joinData)); // Second join attempt
    
        const secondResponse = await secondJoinPromise; // Wait for the error response
        
        // Assertions to verify the response
        expect(secondResponse.status).toBe(500);
        expect(secondResponse.message).toBe('You already have a matching request in progress.');
    });
    
    it('should handle joining the queue', async() => {
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
        const response = await messagePromise; // Wait for the first join to be processed
        
        expect(response.status).toBe(100);
        expect(response.user).toEqual({
            userId: 'user1',
            topic: 'JavaScript',
            difficulty: 'Easy',
            isMatching: true,
        });
    });
});
