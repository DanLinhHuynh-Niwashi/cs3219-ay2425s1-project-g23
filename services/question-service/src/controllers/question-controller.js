import { isValidObjectId } from "mongoose";
import {
    createQuestion as _createQuestion,
    deleteQuestionById as _deleteQuestionById,
    findQuestionById as _findQuestionById,
    findAllQuestions as _findAllQuestions,
    updateQuestionById as _updateQuestionById,
    checkDuplicateQuestion as _checkDuplicateQuestion,
    findQuestionsByFilter as _findQuestionsByFilter,
  } from "../model/repository.js";

export async function createQuestion(req, res) {
  try {
    const { title, description, complexity, categories } = req.body;
    if (title && description && complexity && categories) {
      
      const isDuplicate = await _checkDuplicateQuestion(title, description);
      if (isDuplicate) {
        return res.status(400).json(
          { message: "The question with same title and description already exists." });
      }

      const createdQuestion = await _createQuestion(title, description, complexity, categories);
      return res.status(201).json({
        message: `Created new question successfully`,
        data: formatQuestionResponse(createdQuestion),
      });
    } else {
      return res.status(400).json({ message: "Title and/or description are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new question!" });
  }
}

export async function getQuestion(req, res) {
  try {
    const id = req.params.id;
    
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: `Question ${id} not found` });
    }

    const question = await _findQuestionById(id);
    if (!question) {
      return res.status(404).json({ message: `Question ${id} not found` });
    } else {
      return res.status(200).json({ message: `Found question!`, data: formatQuestionResponse(question) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting question!" });
  }
}

export async function getRandomQuestionByCategory(req, res) {
  try {
    const categoryName = req.params.category;
    const difficulty = req.params.difficulty;
    const questions = await _findQuestionsByFilter(categoryName, difficulty);
    if (questions.length == 0) {
      res.status(404).json({ error: 'No questions in this category, please select a different one' });
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];
    res.json(randomQuestion);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getAllQuestions(req, res) {
  try {
    const questions = await _findAllQuestions();

    return res.status(200).json({ message: `Found questions`, data: questions.map(formatQuestionResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all questions!" });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { title, description, complexity, categories } = req.body;
    
    const questionId = req.params.id;

    if (title || description || complexity || categories) {
      if (!isValidObjectId(questionId)) {
        return res.status(404).json({ message: `Question ${questionId} not found` });
      }

      const question = await _findQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: `Question ${questionId} not found` });
      }
      if (title) {
        question.title = title
      }
      if (description) {
        question.description = description
      }
      if (complexity) {
        question.complexity = complexity
      }
      if (categories) {
        question.categories = categories
      }

      const isDuplicate = await _checkDuplicateQuestion(title, description, questionId);
      if (isDuplicate) {
        return res.status(400).json(
          { message: "The question with same title and description already exists." });
      }
      
      const updatedQuestion = await _updateQuestionById(questionId, question.title, question.description, question.complexity, question.categories);
      return res.status(200).json({
        message: `Updated question ${questionId}`,
        data: formatQuestionResponse(updatedQuestion),
      });
    } else {
      return res.status(400).json({ message: "No field to update!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating question!" });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const questionId = req.params.id;
    if (!isValidObjectId(questionId)) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    }

    const question = await _findQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    }

    await _deleteQuestionById(questionId);
    return res.status(200).json({ message: `Deleted question ${questionId} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when deleting question!" });
  }
}

export function formatQuestionResponse(question) {
  return {
    id: question.id,
    title: question.title,
    description: question.description,
    complexity: question.complexity,
    categories: question.categories
  };
}
