import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { expenseItemSchema } from '../validations/schemas';

const router = Router();
const prisma = new PrismaClient();

// POST /api/trips/:id/expenses - Add expense to trip
router.post('/trips/:id/expenses', authenticateToken, validateRequest(expenseItemSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { tripStopId, category, amount, date, note } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const expense = await prisma.expenseItem.create({
      data: {
        tripId: id,
        tripStopId: tripStopId || null,
        category,
        amount,
        date: date ? new Date(date) : new Date(),
        note: note || ''
      }
    });

    return res.status(201).json({ message: 'Expense item added', expense });
  } catch (error: any) {
    console.error('Add expense error:', error);
    return res.status(500).json({ error: 'Failed to add expense item' });
  }
});

// GET /api/trips/:id/expenses - List expenses
router.get('/trips/:id/expenses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const expenses = await prisma.expenseItem.findMany({
      where: { tripId: id },
      orderBy: { date: 'desc' }
    });

    return res.status(200).json({ expenses });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// DELETE /api/expenses/:id - Delete expense item
router.delete('/expenses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expense = await prisma.expenseItem.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!expense || expense.trip.userId !== userId) {
      return res.status(404).json({ error: 'Expense item not found or unauthorized' });
    }

    await prisma.expenseItem.delete({ where: { id } });

    return res.status(200).json({ message: 'Expense item deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete expense item' });
  }
});

export default router;
