import http from "http";
import index from "./index.js";
import "dotenv/config";

const server = http.createServer(index);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});