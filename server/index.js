import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import router from './routes/routes.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api",router); // Use the router for API routes and it contains to operations that is getcaptcha and fetchcourtdetails
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
