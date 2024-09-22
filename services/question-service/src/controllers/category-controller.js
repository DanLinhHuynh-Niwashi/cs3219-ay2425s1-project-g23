import { isValidObjectId } from "mongoose";
import {
    findAllCategories as _findAllCategories,
  } from "../model/repository-mock.js";

export function formatCategoryResponse(category) {
    return {
      id: category.id,
      name: category.name
    };
}
export async function getAllCategories(req, res) {
  try {
    const categories = await _findAllCategories();

    return res.status(200).json({ message: `Found categories`, data: categories.map(formatCategoryResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all categories!" });
  }
}