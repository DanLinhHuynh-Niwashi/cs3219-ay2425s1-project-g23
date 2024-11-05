import express from 'express';
import { createHistoryEntry, getAllAttempts, getAttempt } from '../controllers/history-controller.js';

const historyRoutes = express.Router();

historyRoutes.post('/', createHistoryEntry);
historyRoutes.get("/user/:userId", getAllAttempts);
historyRoutes.get("/attempts/:id", getAttempt);

export default historyRoutes;