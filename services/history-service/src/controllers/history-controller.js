import { isValidObjectId } from "mongoose";
import History from '../model/history-model.js';
import { fetchQuestionById, findAttemptById, findAllAttempts, fetchCategoryById } from '../model/repository.js';

// Create a new history record
export async function createHistoryEntry(req, res) {
  const { userId, questionId, attemptCode, suggestedSolutions } = req.body;

  try {
    // Fetch question details from the Question service
    const questionDetails = await fetchQuestionById(questionId);
    const categoryDetails = await Promise.all(
      questionDetails.categories.map(categoryId => fetchCategoryById(categoryId))
    );
    const categoryNames = categoryDetails.map(category => category.name);

    // Construct history entry
    const historyEntry = new History({
      userId,
      questionId,
      title: questionDetails.title,
      description: questionDetails.description,
      duration: 2,
      complexity: questionDetails.complexity,
      categories: categoryNames,
      attemptDateTime: new Date(),
      attemptCode,
      suggestedSolutions,
    });

    // Save the history entry to the database
    await historyEntry.save();

    return res.status(201).json({
      message: 'History entry created successfully!',
      data: historyEntry,
    });
  } catch (error) {
    console.error('Error creating history entry:', error);
    res.status(500).json({ message: 'Failed to create history entry' });
  }
}

export async function getAttempt(req, res) {
  try {
    const id = req.params.id;
    
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: `Attempt ${id} not found` });
    }

    const attempt = await findAttemptById(id);
    if (!attempt) {
      return res.status(404).json({ message: `Attempt ${id} not found` });
    } else {
      return res.status(200).json({ message: `Found Attempt!`, data: formatAttemptResponse(attempt) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting attempt!" });
  }
}

export async function getAllAttempts(req, res) {
  const userId = req.params.userId; // Assuming userId is passed as a URL parameter

  try {
    const attempts = await findAllAttempts(userId);

    return res.status(200).json({ message: `Found attempts for user ${userId}`, data: attempts.map(formatAttemptResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user attempts!" });
  }
}

export function formatAttemptResponse(attempt) {
  return {
    id: attempt._id,
    userId: attempt.userId,
    questionId: attempt.questionId,
    title: attempt.title,
    description: attempt.description,
    complexity: attempt.complexity,
    categories: attempt.categories,
    attemptDateTime: attempt.attemptDateTime,
    attemptCode: attempt.attemptCode,
    // Uncomment the following line if `suggestedSolutions` are included in the schema
    // suggestedSolutions: attempt.suggestedSolutions,
  };
}