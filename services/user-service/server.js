import http from "http";
import index, {updateDBStatus} from "./index.js";
import "dotenv/config";
import { connectToDB, handleDBEvents } from "./model/repository.js";

const port = process.env.PORT || 3002;
let retries = 0;
const maxRetries = 5; // Limit retries to avoid infinite loops
const retryInterval = 5000; // 5 seconds interval between retries
let serverStarted = false;

const server = http.createServer(index);
async function startServer() {
  await connectToDB().then(() => {
    console.log("MongoDB Connected!");
    handleDBEvents();
    updateDBStatus(true);
    if (!serverStarted) {
      server.listen(port);
      serverStarted = true;
    }
    console.log("Question service server listening on http://localhost:" + port);
  }).catch((err) => {
    console.error("Failed to connect to DB");
    console.error(err);
    if (retries < maxRetries) {
        retries++;
        console.log(`Retrying... (${retries}/${maxRetries})`);
        setTimeout(startServer, retryInterval); // Retry after 5 seconds
        // Still start the server to handle requests
        
      } else {
        console.error("Max retries reached. DB connection failed.");
        process.exit(1);
      }
      if (!serverStarted) {
        server.listen(port);
        serverStarted = true;
      }
      console.log("Service started, but database connection failed.");
  });
}
await startServer();