import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/analytics - Platform analytics dashboard
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const totalTrips = await prisma.trip.count();
    const totalUsers = await prisma.user.count();
    const totalCities = await prisma.city.count();
    const totalActivities = await prisma.activity.count();

    const tripsAgg = await prisma.trip.aggregate({
      _avg: { totalBudget: true },
      _sum: { totalBudget: true }
    });

    const avgBudget = tripsAgg._avg.totalBudget || 0;

    // Top Booked Cities calculation
    const stopsGroup = await prisma.tripStop.groupBy({
      by: ['cityId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const topBookedCities = [];
    for (const group of stopsGroup) {
      const city = await prisma.city.findUnique({ where: { id: group.cityId } });
      if (city) {
        topBookedCities.push({
          cityName: city.name,
          country: city.country,
          tripCount: group._count.id
        });
      }
    }

    // Expense Distribution by Category
    const expensesGroup = await prisma.expenseItem.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });

    const categoryDistribution = expensesGroup.map((g) => ({
      category: g.category.toUpperCase(),
      amount: g._sum.amount || 0
    }));

    // Public Trips Exploration List
    const publicTrips = await prisma.trip.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true } },
        stops: { include: { city: true } }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      analytics: {
        totalTrips,
        totalUsers,
        totalCities,
        totalActivities,
        avgBudget,
        topBookedCities,
        categoryDistribution,
        publicTrips
      }
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

export default router;
