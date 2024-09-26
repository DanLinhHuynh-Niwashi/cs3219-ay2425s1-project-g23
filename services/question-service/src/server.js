import express from 'express';
import cors from 'cors';
import questionRoutes from './routes/question-routes.js';
import categoryRoutes from './routes/category-routes.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
