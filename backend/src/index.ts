import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import citiesRoutes from './routes/cities';
import tripsRoutes from './routes/trips';
import expensesRoutes from './routes/expenses';
import shareRoutes from './routes/share';
import usersRoutes from './routes/users';
import currencyRoutes from './routes/currency';
import checklistRoutes from './routes/checklist';
import adminRoutes from './routes/admin';
import communityRoutes from './routes/community';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', expensesRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api', checklistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'Globe Trotter API', timestamp: new Date().toISOString() });
});

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`🌍 Globe Trotter API server listening on http://localhost:${PORT}`);
});

export default app;
