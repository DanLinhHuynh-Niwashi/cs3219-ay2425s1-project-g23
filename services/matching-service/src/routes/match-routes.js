import express from 'express';
import { requestMatch, cancelMatch } from '../controllers/match-controller.js';

const router = express.Router();

router.post('/', requestMatch); // Endpoint to request a match
router.delete('/:userId', cancelMatch); // Endpoint to cancel a match

export default router;
