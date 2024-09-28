import { isValidObjectId } from "mongoose";
import {
    findAllCategories as _findAllCategories,
    findCategoryById as _findCategoryById
  } from "../model/repository.js";

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

export async function getCategory(req, res) {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: `Category ${id} not found` });
    }

    const category = await _findCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: `Category ${id} not found` });
    } else {
      return res.status(200).json({ message: `Found category!`, data: formatCategoryResponse(category) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting category!" });
  }
}