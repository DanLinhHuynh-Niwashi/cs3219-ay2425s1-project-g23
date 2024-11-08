import { isValidObjectId } from "mongoose";
import { findAllCategories as _findAllCategories, 
  findCategoryById as _findCategoryById } from "../model/repository.js";

// Cache object
export let categoryCache = null;

export function formatCategoryResponse(category) {
  return {
    id: category.id,
    name: category.name,
  };
}

// Fetch all categories from the cache or database
export async function getAllCategories(req, res) {
  try {
    // If categories are not in the cache, fetch from database
    if (!categoryCache) {
      const categories = await _findAllCategories();
      categoryCache = categories;  // Cache the result

      console.log("Categories fetched from database and cached.");
    } else {
      console.log("Categories fetched from cache.");
    }

    return res.status(200).json({
      message: `Found categories`,
      data: categoryCache.map(formatCategoryResponse),
    });
  } catch (err) {
    console.error("Error fetching all categories:", err);
    return res.status(500).json({ message: "Unknown error when getting all categories!" });
  }
}

// Fetch a specific category by ID, either from cache or database
export async function getCategory(req, res) {
  try {
    const id = req.params.id;

    // Check if ID is valid
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: `Category ${id} not found` });
    }

    // First, check the cache for the category by ID
    if (categoryCache) {
      const cachedCategory = categoryCache.find(cat => cat.id.toString() === id);
      if (cachedCategory) {
        console.log("Category found in cache.");
        return res.status(200).json({
          message: `Found category from cached list!`,
          data: formatCategoryResponse(cachedCategory),
        });
      }
    }

    // If the category is not found in the cache, fetch from the database
    const category = await _findCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: `Category ${id} not found` });
    }

    const categories = await _findAllCategories();
    categoryCache = categories;  // Cache the new category

    return res.status(200).json({
      message: `Found category from database!`,
      data: formatCategoryResponse(category),
    });
  } catch (err) {
    console.error("Error fetching category:", err);
    return res.status(500).json({ message: "Unknown error when getting category!" });
  }
}
