import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/cities - Search & filter cities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, region, costIndex } = req.query;

    const where: any = {};
    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { country: { contains: q } },
        { description: { contains: q } }
      ];
    }
    if (region && region !== 'all') {
      where.region = String(region);
    }
    if (costIndex && costIndex !== 'all') {
      where.costIndex = String(costIndex);
    }

    const cities = await prisma.city.findMany({
      where,
      include: {
        activities: true
      },
      orderBy: { popularityScore: 'desc' }
    });

    return res.status(200).json({ cities });
  } catch (error: any) {
    console.error('Fetch cities error:', error);
    return res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// GET /api/cities/recommended - Top recommended destinations
router.get('/recommended', async (_req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      take: 6,
      orderBy: { popularityScore: 'desc' },
      include: {
        activities: {
          take: 3
        }
      }
    });
    return res.status(200).json({ cities });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch recommended destinations' });
  }
});

// GET /api/cities/:id - Get city details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: true
      }
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.status(200).json({ city });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch city details' });
  }
});

export default router;
