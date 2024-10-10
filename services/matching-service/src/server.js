import http from "http";
import index from "./index.js";
import "dotenv/config";

const port = process.env.PORT || 3003;

const server = http.createServer(index);

server.listen(port);
console.log("Matching service server listening on http://localhost:" + port);
