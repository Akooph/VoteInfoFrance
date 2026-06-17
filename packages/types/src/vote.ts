import { z } from 'zod';

export const VoteOptionSchema = z.enum(['POUR', 'CONTRE', 'INFO', 'BLANC']);
export type VoteOption = z.infer<typeof VoteOptionSchema>;

export const VoteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  propositionId: z.string().uuid(),
  option: VoteOptionSchema,
  votedAt: z.string().datetime(),
});
export type Vote = z.infer<typeof VoteSchema>;

export const VoteTallySchema = z.object({
  POUR: z.number().int().nonnegative(),
  CONTRE: z.number().int().nonnegative(),
  INFO: z.number().int().nonnegative(),
  BLANC: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type VoteTally = z.infer<typeof VoteTallySchema>;

export const DepartmentVoteTallySchema = VoteTallySchema.extend({
  codeDept: z.string(),
  nomDept: z.string(),
  codeRegion: z.string(),
});
export type DepartmentVoteTally = z.infer<typeof DepartmentVoteTallySchema>;

export const CreateVoteBodySchema = z.object({
  propositionId: z.string().uuid(),
  option: VoteOptionSchema,
});
export type CreateVoteBody = z.infer<typeof CreateVoteBodySchema>;

export const UserVoteSchema = z.object({
  propositionId: z.string().uuid(),
  option: VoteOptionSchema,
  votedAt: z.string().datetime(),
});
export type UserVote = z.infer<typeof UserVoteSchema>;
