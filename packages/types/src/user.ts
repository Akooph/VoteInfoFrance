import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  codePostal: z.string().nullable(),
  communeInsee: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileBodySchema = z.object({
  codePostal: z.string().min(5).max(5),
});
export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>;
