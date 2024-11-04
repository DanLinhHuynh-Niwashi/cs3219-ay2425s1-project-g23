import dotenv from 'dotenv';
import express from "express";
import { handleHttpRequest } from "../controllers/gateway-controller.js";

dotenv.config();

const base_url = process.env.COLLAB_URL;
const port = process.env.COLLAB_PORT || 8081;

const collabRoutes = express.Router();

// Collab routes
collabRoutes.post("/collab/session-summary", async (req, res) => handleHttpRequest(req, res, base_url, port, "/collab/session-summary"));
collabRoutes.get("/collab/session-summary/:sessionId", (req, res) => handleHttpRequest(req, res, base_url, port, `/collab/session-summary/${req.params.sessionId}`));

export default collabRoutes;
