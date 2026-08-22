import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.') || 'general';
          formattedErrors[path] = err.message;
        });
        return res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
};
