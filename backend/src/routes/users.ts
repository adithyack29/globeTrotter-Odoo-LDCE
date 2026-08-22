import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema } from '../validations/schemas';

const router = Router();
const prisma = new PrismaClient();

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
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
