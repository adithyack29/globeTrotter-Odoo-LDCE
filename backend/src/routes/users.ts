import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema } from '../validations/schemas';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        language: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, avatarUrl, language } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (language) updateData.language = language;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        language: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// DELETE /api/users/profile - Delete account with cascade cleanup
router.delete('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ message: 'Account and all associated trip data deleted permanently' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete user account' });
  }
});

// GET /api/users/wishlist - Fetch user wishlist
router.get('/wishlist', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const wishlist = await prisma.userWishlist.findMany({
      where: { userId },
      include: { city: { include: { activities: true } } }
    });
    return res.status(200).json({ wishlist });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/users/wishlist/:cityId - Toggle city in wishlist
router.post('/wishlist/:cityId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { cityId } = req.params;

    const existing = await prisma.userWishlist.findUnique({
      where: { userId_cityId: { userId, cityId } }
    });

    if (existing) {
      await prisma.userWishlist.delete({ where: { id: existing.id } });
      return res.status(200).json({ message: 'City removed from wishlist', isSaved: false });
    } else {
      const item = await prisma.userWishlist.create({
        data: { userId, cityId }
      });
      return res.status(201).json({ message: 'City saved to wishlist!', isSaved: true, item });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

export default router;
