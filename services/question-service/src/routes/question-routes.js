import express from "express";

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  getRandomQuestionByCategory,
} from "../controllers/question-controller.js";

const questionRoutes = express.Router();

questionRoutes.get("/", getAllQuestions);

questionRoutes.post("/", createQuestion);

questionRoutes.get("/:id", getQuestion);

questionRoutes.get("/random/:category", getRandomQuestionByCategory);

questionRoutes.patch("/:id", updateQuestion);

questionRoutes.delete("/:id", deleteQuestion);

export default questionRoutes;