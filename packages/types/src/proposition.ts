import { z } from 'zod';
import { GeoLevelSchema } from './geo';

export const InstitutionSchema = z.enum([
  'assemblee_nationale',
  'senat',
  'conseil_regional',
  'conseil_departemental',
  'conseil_municipal',
  'parlement_europeen',
]);
export type Institution = z.infer<typeof InstitutionSchema>;

export const PropositionStatusSchema = z.enum([
  'en_cours',
  'adopte',
  'rejete',
  'suspendu',
]);
export type PropositionStatus = z.infer<typeof PropositionStatusSchema>;

export const SummarySchema = z.object({
  id: z.string().uuid(),
  propositionId: z.string().uuid(),
  resume: z.string(),
  pour: z.string(),
  contre: z.string(),
  modelUsed: z.string(),
  generatedAt: z.string().datetime(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const PropositionSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  institution: InstitutionSchema,
  titre: z.string(),
  texteOriginal: z.string().nullable(),
  dateDepot: z.string().nullable(),
  dateVote: z.string().nullable(),
  status: PropositionStatusSchema,
  geoLevel: GeoLevelSchema,
  geoCode: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  summary: SummarySchema.nullable().optional(),
});
export type Proposition = z.infer<typeof PropositionSchema>;

export const PropositionListItemSchema = PropositionSchema.pick({
  id: true,
  sourceUrl: true,
  institution: true,
  titre: true,
  dateDepot: true,
  dateVote: true,
  status: true,
  geoLevel: true,
  geoCode: true,
}).extend({
  hasSummary: z.boolean(),
  userVote: z.string().nullable().optional(),
});
export type PropositionListItem = z.infer<typeof PropositionListItemSchema>;

export const PaginatedPropositionsSchema = z.object({
  data: z.array(PropositionListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});
export type PaginatedPropositions = z.infer<typeof PaginatedPropositionsSchema>;
