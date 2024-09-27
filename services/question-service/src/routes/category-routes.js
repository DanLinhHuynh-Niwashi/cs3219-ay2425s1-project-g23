import express from 'express';
import {
    getAllCategories,
    getCategory
} from '../controllers/category-controller.js';

const categoryRoutes = express.Router();

categoryRoutes.get('/', getAllCategories);
categoryRoutes.get("/:id", getCategory);

export default categoryRoutes;