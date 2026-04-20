import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  image: z.string().url().optional(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
