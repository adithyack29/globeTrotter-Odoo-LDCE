import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/community/reviews - Fetch community reviews feed
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { cityName: { contains: q } },
        { title: { contains: q } },
        { content: { contains: q } }
      ];
    }

    const reviews = await prisma.communityReview.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true, city: true, country: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ reviews });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch community reviews' });
  }
});

// POST /api/community/reviews - Create community review
router.post('/reviews', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { cityName, rating, title, content } = req.body;

    const review = await prisma.communityReview.create({
      data: {
        userId,
        cityName: cityName || 'Global',
        rating: rating ? parseInt(rating) : 5,
        title: title || 'Travel Experience',
        content: content || ''
      },
      include: {
        user: { select: { name: true, avatarUrl: true, city: true, country: true } }
      }
    });

    return res.status(201).json({ message: 'Review published to community!', review });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to publish review' });
  }
});

export default router;
