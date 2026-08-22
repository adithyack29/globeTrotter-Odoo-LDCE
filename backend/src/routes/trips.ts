import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  tripSchema,
  updateTripSchema,
  tripStopSchema,
  addStopActivitySchema
} from '../validations/schemas';

const router = Router();
const prisma = new PrismaClient();

const generateSlug = (title: string): string => {
  const clean = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${clean}-${randomSuffix}`;
};

const calculateTripCosts = (trip: any) => {
  let stayCostTotal = 0;
  let transportCostTotal = 0;
  let activityCostTotal = 0;
  let mealCostTotal = 0;
  let miscCostTotal = 0;

  if (trip.stops && Array.isArray(trip.stops)) {
    for (const stop of trip.stops) {
      stayCostTotal += stop.stayCost || 0;
      transportCostTotal += stop.transportCost || 0;

      if (stop.stopActivities && Array.isArray(stop.stopActivities)) {
        for (const sa of stop.stopActivities) {
          const cost = sa.customCost !== null && sa.customCost !== undefined ? sa.customCost : (sa.activity?.cost || 0);
          activityCostTotal += cost;
        }
      }
    }
  }

  if (trip.expenses && Array.isArray(trip.expenses)) {
    for (const exp of trip.expenses) {
      if (exp.category === 'transport') transportCostTotal += exp.amount;
      else if (exp.category === 'stay') stayCostTotal += exp.amount;
      else if (exp.category === 'activity') activityCostTotal += exp.amount;
      else if (exp.category === 'meal') mealCostTotal += exp.amount;
      else miscCostTotal += exp.amount;
    }
  }

  const grandTotal = stayCostTotal + transportCostTotal + activityCostTotal + mealCostTotal + miscCostTotal;

  return {
    stayCostTotal,
    transportCostTotal,
    activityCostTotal,
    mealCostTotal,
    miscCostTotal,
    grandTotal
  };
};

// GET /api/trips - List user's trips
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rawTrips = await prisma.trip.findMany({
      where: { userId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            stopActivities: { include: { activity: true } }
          }
        },
        expenses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const trips = rawTrips.map((trip) => {
      const costs = calculateTripCosts(trip);
      return {
        ...trip,
        calculatedCosts: costs
      };
    });

    return res.status(200).json({ trips });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST /api/trips - Create trip
router.post('/', authenticateToken, validateRequest(tripSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, coverImageUrl, startDate, endDate, totalBudget, isPublic } = req.body;

    const shareSlug = generateSlug(title);

    const trip = await prisma.trip.create({
      data: {
        userId,
        title,
        description: description || '',
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudget: totalBudget || 0,
        isPublic: isPublic || false,
        shareSlug
      },
      include: {
        stops: { include: { city: true, stopActivities: { include: { activity: true } } } },
        expenses: true
      }
    });

    const costs = calculateTripCosts(trip);

    return res.status(201).json({
      message: 'Trip created successfully',
      trip: { ...trip, calculatedCosts: costs }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create trip' });
  }
});

// GET /api/trips/:id - Get trip details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: { include: { activities: true } },
            stopActivities: {
              orderBy: { orderIndex: 'asc' },
              include: { activity: true }
            }
          }
        },
        expenses: { orderBy: { date: 'desc' } }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const costs = calculateTripCosts(trip);

    return res.status(200).json({
      trip: {
        ...trip,
        calculatedCosts: costs
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch trip details' });
  }
});

// GET /api/trips/:id/summary - Aggregation Summary
router.get('/:id/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            stopActivities: { include: { activity: true } }
          }
        },
        expenses: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const costs = calculateTripCosts(trip);
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const cityCount = trip.stops.length;
    const dailyBudgetLimit = trip.totalBudget > 0 ? (trip.totalBudget / totalDays) : 0;
    const dailySpendAvg = costs.grandTotal / totalDays;

    return res.status(200).json({
      summary: {
        tripId: trip.id,
        title: trip.title,
        totalDays,
        cityCount,
        totalBudget: trip.totalBudget,
        calculatedTotalCost: costs.grandTotal,
        isOverBudget: costs.grandTotal > trip.totalBudget && trip.totalBudget > 0,
        dailyBudgetLimit,
        dailySpendAvg,
        categoryBreakdown: [
          { category: 'Lodging/Stay', amount: costs.stayCostTotal, color: '#3b82f6' },
          { category: 'Transit', amount: costs.transportCostTotal, color: '#6366f1' },
          { category: 'Activities', amount: costs.activityCostTotal, color: '#10b981' },
          { category: 'Meals', amount: costs.mealCostTotal, color: '#f59e0b' },
          { category: 'Misc', amount: costs.miscCostTotal, color: '#8b5cf6' }
        ]
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to generate trip summary' });
  }
});

// POST /api/trips/stops/:stopId/optimize - Smart Schedule Optimizer Algorithm
router.post('/stops/:stopId/optimize', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stopId } = req.params;

    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
      include: {
        trip: true,
        stopActivities: { include: { activity: true } }
      }
    });

    if (!stop || stop.trip.userId !== userId) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    const activities = [...stop.stopActivities];

    // Priority Rank Map: Morning (Sightseeing, Adventure) -> Afternoon (Culture, Food) -> Evening (Leisure)
    const categoryRank: Record<string, number> = {
      'Sightseeing': 1,
      'Adventure': 2,
      'Culture': 3,
      'Food': 4,
      'Leisure': 5
    };

    activities.sort((a, b) => {
      const rankA = categoryRank[a.activity.category] || 3;
      const rankB = categoryRank[b.activity.category] || 3;
      return rankA - rankB;
    });

    // Schedule-packing algorithm with buffer times
    let currentHour = 9;
    let currentMinute = 0;

    const optimizedSchedule = [];

    for (let i = 0; i < activities.length; i++) {
      const sa = activities[i];
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      await prisma.stopActivity.update({
        where: { id: sa.id },
        data: {
          orderIndex: i,
          scheduledTime: timeStr
        }
      });

      const duration = sa.activity.durationMinutes || 90;
      const buffer = 30; // 30 mins transition time
      const totalSlot = duration + buffer;

      currentMinute += totalSlot;
      currentHour += Math.floor(currentMinute / 60);
      currentMinute %= 60;

      optimizedSchedule.push({
        id: sa.id,
        activityName: sa.activity.name,
        category: sa.activity.category,
        scheduledTime: timeStr,
        durationMinutes: duration,
        orderIndex: i
      });
    }

    return res.status(200).json({
      message: 'Schedule optimized successfully with intelligent time slots & travel buffers!',
      optimizedSchedule
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to optimize schedule' });
  }
});

// PUT /api/trips/:id/stops/reorder - Reorder stops
router.put('/:id/stops/reorder', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { stopOrders } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    if (Array.isArray(stopOrders)) {
      for (const item of stopOrders) {
        await prisma.tripStop.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex }
        });
      }
    }

    return res.status(200).json({ message: 'Trip stop order updated' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to reorder stops' });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', authenticateToken, validateRequest(updateTripSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTrip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.coverImageUrl !== undefined) updateData.coverImageUrl = req.body.coverImageUrl;
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
    if (req.body.totalBudget !== undefined) updateData.totalBudget = req.body.totalBudget;
    if (req.body.isPublic !== undefined) updateData.isPublic = req.body.isPublic;

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        stops: { include: { city: true, stopActivities: { include: { activity: true } } } },
        expenses: true
      }
    });

    const costs = calculateTripCosts(updatedTrip);

    return res.status(200).json({
      message: 'Trip updated successfully',
      trip: { ...updatedTrip, calculatedCosts: costs }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTrip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    await prisma.trip.delete({ where: { id } });

    return res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// POST /api/trips/:id/duplicate - Duplicate trip
router.post('/:id/duplicate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const sourceTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: { include: { stopActivities: true } },
        expenses: true,
        checklistItems: true
      }
    });

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Source trip not found' });
    }

    const shareSlug = generateSlug(`${sourceTrip.title} Copy`);

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        title: `${sourceTrip.title} (Copy)`,
        description: sourceTrip.description,
        coverImageUrl: sourceTrip.coverImageUrl,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        totalBudget: sourceTrip.totalBudget,
        isPublic: false,
        shareSlug
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

      for (const sa of sourceTrip.stops.flatMap(s => s.stopActivities)) {
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

    for (const item of sourceTrip.checklistItems) {
      await prisma.tripChecklistItem.create({
        data: {
          tripId: newTrip.id,
          title: item.title,
          category: item.category,
          isCompleted: false
        }
      });
    }

    return res.status(201).json({
      message: 'Trip duplicated successfully',
      newTripId: newTrip.id
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to duplicate trip' });
  }
});

// POST /api/trips/:id/stops - Add stop
router.post('/:id/stops', authenticateToken, validateRequest(tripStopSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { cityId, arrivalDate, departureDate, stayCost, transportCost, orderIndex } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    const maxOrder = orderIndex !== undefined ? orderIndex : await prisma.tripStop.count({ where: { tripId: id } });

    const newStop = await prisma.tripStop.create({
      data: {
        tripId: id,
        cityId,
        orderIndex: maxOrder,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        stayCost: stayCost || 0,
        transportCost: transportCost || 0
      },
      include: {
        city: true,
        stopActivities: { include: { activity: true } }
      }
    });

    return res.status(201).json({ message: 'Stop added to trip', stop: newStop });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add stop to trip' });
  }
});

// PUT /api/trips/stops/:stopId - Update stop
router.put('/stops/:stopId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stopId } = req.params;

    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.userId !== userId) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    const { arrivalDate, departureDate, stayCost, transportCost, orderIndex } = req.body;
    const updateData: any = {};
    if (arrivalDate) updateData.arrivalDate = new Date(arrivalDate);
    if (departureDate) updateData.departureDate = new Date(departureDate);
    if (stayCost !== undefined) updateData.stayCost = Number(stayCost);
    if (transportCost !== undefined) updateData.transportCost = Number(transportCost);
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex);

    const updatedStop = await prisma.tripStop.update({
      where: { id: stopId },
      data: updateData,
      include: { city: true, stopActivities: { include: { activity: true } } }
    });

    return res.status(200).json({ message: 'Stop updated', stop: updatedStop });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update trip stop' });
  }
});

// DELETE /api/trips/stops/:stopId - Remove stop
router.delete('/stops/:stopId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stopId } = req.params;

    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.userId !== userId) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    await prisma.tripStop.delete({ where: { id: stopId } });

    return res.status(200).json({ message: 'Stop removed from trip' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete stop' });
  }
});

// POST /api/trips/stops/:stopId/activities - Add activity to stop
router.post('/stops/:stopId/activities', authenticateToken, validateRequest(addStopActivitySchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { stopId } = req.params;
    const { activityId, scheduledDate, scheduledTime, customCost, notes } = req.body;

    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.userId !== userId) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    const orderIndex = await prisma.stopActivity.count({ where: { tripStopId: stopId } });

    const stopActivity = await prisma.stopActivity.create({
      data: {
        tripStopId: stopId,
        activityId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : stop.arrivalDate,
        scheduledTime: scheduledTime || '10:00',
        customCost: customCost !== undefined ? customCost : null,
        notes: notes || '',
        orderIndex
      },
      include: { activity: true }
    });

    return res.status(201).json({ message: 'Activity added to itinerary stop', stopActivity });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add activity to stop' });
  }
});

// DELETE /api/trips/stop-activities/:id - Delete activity
router.delete('/stop-activities/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const sa = await prisma.stopActivity.findUnique({
      where: { id },
      include: { tripStop: { include: { trip: true } } }
    });

    if (!sa || sa.tripStop.trip.userId !== userId) {
      return res.status(404).json({ error: 'Activity assignment not found or unauthorized' });
    }

    await prisma.stopActivity.delete({ where: { id } });

    return res.status(200).json({ message: 'Activity removed from itinerary' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to remove activity' });
  }
});

export default router;
