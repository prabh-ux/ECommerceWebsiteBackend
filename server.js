import express from 'express';
import cors from 'cors';
import './models/db.js'
import authRouter from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';
import productRouter from './routes/fetchRouter.js'
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL||"http://localhost:5173", // Vite's default frontend URL
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/api',productRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

