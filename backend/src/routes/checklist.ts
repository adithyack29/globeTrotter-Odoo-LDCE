import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Default smart template items
const DEFAULT_SMART_CHECKLIST = [
  { title: 'Passport & Visa Documents', category: 'Essentials' },
  { title: 'Universal Power Adapter & Chargers', category: 'Essentials' },
  { title: 'Travel Insurance & Emergency Contacts', category: 'Documents' },
  { title: 'Comfortable City Walking Shoes', category: 'Packing' },
  { title: 'Toiletry Kit & Sunscreen', category: 'Packing' }
];

// GET /api/trips/:id/checklist - Fetch or auto-generate checklist
router.get('/trips/:id/checklist', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        stops: {
          include: { stopActivities: { include: { activity: true } } }
        },
        checklistItems: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Auto-generate checklist items based on activities if empty
    if (trip.checklistItems.length === 0) {
      const generatedItems = [...DEFAULT_SMART_CHECKLIST];

      // Scan categories
      const categories = new Set<string>();
      trip.stops.forEach(s => s.stopActivities.forEach(sa => categories.add(sa.activity?.category || '')));

      if (categories.has('Adventure')) {
        generatedItems.push({ title: 'Trekking Boots & Rain Jacket', category: 'Adventure' });
        generatedItems.push({ title: 'First-Aid Kit & Insect Repellent', category: 'Adventure' });
      }
      if (categories.has('Culture') || categories.has('Sightseeing')) {
        generatedItems.push({ title: 'Camera & Memory Cards', category: 'Sightseeing' });
        generatedItems.push({ title: 'Pre-booked Museum Pass Confirmations', category: 'Culture' });
      }
      if (categories.has('Food')) {
        generatedItems.push({ title: 'Reusable Water Bottle & Digestive Tablets', category: 'Food' });
      }

      for (const item of generatedItems) {
        await prisma.tripChecklistItem.create({
          data: {
            tripId: id,
            title: item.title,
            category: item.category,
            isCompleted: false
          }
        });
      }

      const freshItems = await prisma.tripChecklistItem.findMany({
        where: { tripId: id },
        orderBy: { category: 'asc' }
      });
      return res.status(200).json({ items: freshItems });
    }

    return res.status(200).json({ items: trip.checklistItems });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// POST /api/trips/:id/checklist - Add custom item
router.post('/trips/:id/checklist', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, category } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const item = await prisma.tripChecklistItem.create({
      data: {
        tripId: id,
        title: title || 'Custom Item',
        category: category || 'General',
        isCompleted: false
      }
    });

    return res.status(201).json({ message: 'Item added', item });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add checklist item' });
  }
});

// PUT /api/checklist/:id - Toggle completion
router.put('/checklist/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.tripChecklistItem.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!existing || existing.trip.userId !== userId) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    const updated = await prisma.tripChecklistItem.update({
      where: { id },
      data: { isCompleted: !existing.isCompleted }
    });

    return res.status(200).json({ item: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// DELETE /api/checklist/:id - Delete item
router.delete('/checklist/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.tripChecklistItem.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!existing || existing.trip.userId !== userId) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    await prisma.tripChecklistItem.delete({ where: { id } });

    return res.status(200).json({ message: 'Item deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

export default router;
