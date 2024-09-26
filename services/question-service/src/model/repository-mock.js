import fs from 'fs';
import path from 'path';
import Question from './question-model.js';
import Category from './category-model.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, '../mock-database.json');

const readDataFromJson = () => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(jsonData);
};

const saveDataToJson = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

export async function createQuestion(title, description, complexity, categories) {
  const data = readDataFromJson();
  const newId = data.questions.length > 0 ? Math.max(...data.questions.map(q => q.id)) + 1 : 1;
  const newQuestion = new Question (newId, title, description, complexity, categories );
  data.questions.push(newQuestion);
  
  saveDataToJson(data);
  return newQuestion;
}

export async function findQuestionById(id) {
  const data = readDataFromJson();
  return data.questions.find(q => q.id === parseInt(id));
}

export async function findAllQuestions() {
  const data = readDataFromJson();
  return data.questions;
}

export async function findAllCategories() {
  const data = readDataFromJson();
  return data.categories;
}

export async function updateQuestionById(id, title, description, complexity, categories) {
  const data = readDataFromJson();
  const questionIndex = data.questions.findIndex(q => q.id === parseInt(id));
  if (questionIndex === -1) return null;

  const updatedQuestion = new Question(id, title, description, complexity, categories);
  data.questions[questionIndex] = updatedQuestion;

  saveDataToJson(data);
  return updatedQuestion;
}

export async function deleteQuestionById(id) {
  const data = readDataFromJson();
  const questionIndex = data.questions.findIndex(q => q.id === parseInt(id));
  if (questionIndex === -1) return null;

  data.questions.splice(questionIndex, 1);
  saveDataToJson(data);
  return true;
}