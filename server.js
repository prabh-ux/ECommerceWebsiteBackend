import express from 'express';
import cors from 'cors';
import './models/db.js'
import authRouter from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';
import productRouter from './routes/fetchRouter.js'
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",         // local dev
    "http://192.168.1.3:5173",       // local network
    "https://your-frontend-domain.com" // deployed frontend (if you deploy later)
  ], // Vite's default frontend URL
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

