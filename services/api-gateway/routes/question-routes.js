import dotenv from 'dotenv';
import express from "express";
import { handleHttpRequest, handleHttpUploadFile } from "../controllers/gateway-controller.js";

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
questionRoutes.get("/questions/random/:category/:difficulty", (req, res) => handleHttpRequest(req, res, base_url, port, `/questions/random/${req.params.category}/${req.params.difficulty}`))
questionRoutes.post("/questions/file/upload-questions", (req, res) => handleHttpUploadFile(req, res, base_url, port, "/questions/file/upload-questions"))
questionRoutes.patch("/questions/file/upload-questions", (req, res) => handleHttpUploadFile(req, res, base_url, port, "/questions/file/upload-questions"))
// Category routes
questionRoutes.get("/categories", (req, res) => handleHttpRequest(req, res, base_url, port, "/categories"));
questionRoutes.get("/categories/:id", (req, res) => handleHttpRequest(req, res, base_url, port, `/categories/${req.params.id}`));

export default questionRoutes;
