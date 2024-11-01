import dotenv from 'dotenv';
import express from "express";
import { handleHttpRequest } from "../controllers/gateway-controller.js";

dotenv.config();

const base_url = process.env.QUESTION_URL;
const port = process.env.QUESTION_PORT || 3001;

const questionRoutes = express.Router();

// Question routes
questionRoutes.get("/questions", (req, res) => handleHttpRequest(req, res, base_url, port, "/questions"));
questionRoutes.post("/questions", (req, res) => handleHttpRequest(req, res, base_url, port, "/questions"));
questionRoutes.get("/questions/:id", (req, res) => handleHttpRequest(req, res, base_url, port, `/questions/${req.params.id}`));
questionRoutes.patch("/questions/:id", (req, res) => handleHttpRequest(req, res, base_url, port, `/questions/${req.params.id}`));
questionRoutes.delete("/questions/:id", (req, res) => handleHttpRequest(req, res, base_url, port, `/questions/${req.params.id}`));

// Category routes
questionRoutes.get("/categories", (req, res) => handleHttpRequest(req, res, base_url, port, "/categories"));
questionRoutes.get("/categories/:id", (req, res) => handleHttpRequest(req, res, base_url, port, `/categories/${req.params.id}`));

export default questionRoutes;
