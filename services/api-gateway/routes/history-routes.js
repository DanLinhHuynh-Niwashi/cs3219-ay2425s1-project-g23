import dotenv from 'dotenv';
import express from "express";
import { handleHttpRequest } from "../controllers/gateway-controller.js";

dotenv.config();

const base_url = process.env.HISTORY_URL;
const port = process.env.HISTORY_PORT || 8082;

const historyRoutes = express.Router();

historyRoutes.post('/history', (req, res) => handleHttpRequest(req, res, base_url, port, "/history"));
historyRoutes.get("/history/user/:userId", (req, res)=> handleHttpRequest(req, res, base_url, port, `/history/user/${req.params.userId}`));
historyRoutes.get("/history/attempts/:id", (req, res)=> handleHttpRequest(req, res, base_url, port, `/history/attempts/${req.params.id}`));

export default historyRoutes;