import express from 'express';
import {
    getAllCategories
} from '../controllers/category-controller.js';

const categoryRoutes = express.Router();

categoryRoutes.get('/', getAllCategories);

export default categoryRoutes;