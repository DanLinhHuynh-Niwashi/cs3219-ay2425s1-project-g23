export default class Question {
  constructor(id, title, description, complexity, categories) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.complexity = complexity;
    this.categories = categories; // Array of category IDs
  }
}
