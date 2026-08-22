import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper slug generator
const generateSlug = (title: string): string => {
  const clean = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${clean}-${randomSuffix}`;
};

// GET /api/share/:shareSlug - Get public shared trip
router.get('/:shareSlug', async (req: Request, res: Response) => {
  try {
    const { shareSlug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        shareSlug,
        isPublic: true
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        },
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            stopActivities: {
              orderBy: { orderIndex: 'asc' },
              include: { activity: true }
            }
          }
        },
        expenses: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Public trip not found or link is private' });
    }

    // Calculate totals
    let stayCostTotal = 0;
    let transportCostTotal = 0;
    let activityCostTotal = 0;
    let mealCostTotal = 0;
    let miscCostTotal = 0;

    for (const stop of trip.stops) {
      stayCostTotal += stop.stayCost || 0;
      transportCostTotal += stop.transportCost || 0;
      for (const sa of stop.stopActivities) {
        activityCostTotal += sa.customCost !== null && sa.customCost !== undefined ? sa.customCost : (sa.activity?.cost || 0);
      }
    }

    for (const exp of trip.expenses) {
      if (exp.category === 'transport') transportCostTotal += exp.amount;
      else if (exp.category === 'stay') stayCostTotal += exp.amount;
      else if (exp.category === 'activity') activityCostTotal += exp.amount;
      else if (exp.category === 'meal') mealCostTotal += exp.amount;
      else miscCostTotal += exp.amount;
    }

    const calculatedCosts = {
      stayCostTotal,
      transportCostTotal,
      activityCostTotal,
      mealCostTotal,
      miscCostTotal,
      grandTotal: stayCostTotal + transportCostTotal + activityCostTotal + mealCostTotal + miscCostTotal
    };

    return res.status(200).json({
      trip: {
        ...trip,
        calculatedCosts
      }
    });
  } catch (error: any) {
    console.error('Fetch public trip error:', error);
    return res.status(500).json({ error: 'Failed to fetch public trip' });
  }
});

// POST /api/share/:shareSlug/copy - Copy shared trip to logged-in user account
router.post('/:shareSlug/copy', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shareSlug } = req.params;

    const sourceTrip = await prisma.trip.findFirst({
      where: {
        shareSlug,
        isPublic: true
      },
      include: {
        stops: {
          include: {
            stopActivities: true
          }
        },
        expenses: true
      }
    });

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Shared trip not found or private' });
    }

    const newSlug = generateSlug(`${sourceTrip.title} Forked`);

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        title: `${sourceTrip.title} (Forked Plan)`,
        description: sourceTrip.description,
        coverImageUrl: sourceTrip.coverImageUrl,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        totalBudget: sourceTrip.totalBudget,
        isPublic: false,
        shareSlug: newSlug
      }
    });

    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.tripStop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          stayCost: stop.stayCost,
          transportCost: stop.transportCost
        }
      });

      for (const sa of stop.stopActivities) {
        await prisma.stopActivity.create({
          data: {
            tripStopId: newStop.id,
            activityId: sa.activityId,
            scheduledDate: sa.scheduledDate,
            scheduledTime: sa.scheduledTime,
            customCost: sa.customCost,
            notes: sa.notes,
            orderIndex: sa.orderIndex
          }
        });
      }
    }

    for (const exp of sourceTrip.expenses) {
      await prisma.expenseItem.create({
        data: {
          tripId: newTrip.id,
          category: exp.category,
          amount: exp.amount,
          date: exp.date,
          note: exp.note
        }
      });
    }

    return res.status(201).json({
      message: 'Trip copied successfully to your account!',
      newTripId: newTrip.id
    });
  } catch (error: any) {
    console.error('Copy shared trip error:', error);
    return res.status(500).json({ error: 'Failed to copy trip' });
  }
});

export default router;
