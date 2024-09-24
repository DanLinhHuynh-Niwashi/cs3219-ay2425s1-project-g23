import Category from './category-model.js'; // Mongoose Category model


// Get all categories
export async function findAllCategories() {
    try {
      const categories = await Category.find();
      return categories;
    } catch (error) {
      console.error('Error finding all categories:', error);
      throw error;
    }
  }
// Find a category by its ID
export async function findCategoryById(id) {
    try {
      const category = await Category.findById(id);
      return category;
    } catch (error) {
      console.error('Error finding category by ID:', error);
      throw error;
    }
  }
  