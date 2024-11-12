import express from "express";

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  getRandomQuestionByCategory,
  uploadQuestions, 
  uploadQuestionsWithReplace
} from "../controllers/question-controller.js";

const questionRoutes = express.Router();

questionRoutes.get("/", getAllQuestions);

questionRoutes.post("/", createQuestion);

questionRoutes.get("/:id", getQuestion);

questionRoutes.get("/random/:category/:difficulty", getRandomQuestionByCategory);

questionRoutes.patch("/:id", updateQuestion);

questionRoutes.delete("/:id", deleteQuestion);

questionRoutes.post('/file/upload-questions', uploadQuestions);

questionRoutes.patch('/file/upload-questions', uploadQuestionsWithReplace);

export default questionRoutes;