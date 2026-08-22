import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  avatarUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  language: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  language: z.string().optional()
});

export const tripSchema = z.object({
  title: z.string().min(3, 'Trip title must be at least 3 characters long'),
  description: z.string().optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  totalBudget: z.number().min(0, 'Budget must be a non-negative number').default(0),
  isPublic: z.boolean().optional().default(false)
});

export const updateTripSchema = tripSchema.partial();

export const tripStopSchema = z.object({
  cityId: z.string().uuid('Invalid City ID').or(z.string().min(1)),
  arrivalDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid arrival date' }),
  departureDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid departure date' }),
  stayCost: z.number().min(0).default(0),
  transportCost: z.number().min(0).default(0),
  orderIndex: z.number().int().optional()
});

export const addStopActivitySchema = z.object({
  activityId: z.string().min(1, 'Activity ID is required'),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  customCost: z.number().min(0).optional(),
  notes: z.string().optional()
});

export const expenseItemSchema = z.object({
  tripStopId: z.string().optional().nullable(),
  category: z.enum(['transport', 'stay', 'activity', 'meal', 'misc']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().optional(),
  note: z.string().optional()
});
