import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/currency/rates - Fetch currency exchange rates
router.get('/rates', async (_req: Request, res: Response) => {
  try {
    const rates = await prisma.currencyRate.findMany();
    return res.status(200).json({ rates });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch currency rates' });
  }
});

export default router;
