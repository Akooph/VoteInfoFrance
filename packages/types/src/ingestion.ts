import { z } from 'zod';
import { GeoLevelSchema } from './geo';
import { InstitutionSchema } from './proposition';

export const IngestionRunStatusSchema = z.enum(['running', 'success', 'error']);
export type IngestionRunStatus = z.infer<typeof IngestionRunStatusSchema>;

export const IngestionRunSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  status: IngestionRunStatusSchema,
  recordsUpserted: z.number().int().nonnegative(),
  errorMessage: z.string().nullable(),
});
export type IngestionRun = z.infer<typeof IngestionRunSchema>;

export const NormalizedPropositionSchema = z.object({
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  institution: InstitutionSchema,
  titre: z.string(),
  texteOriginal: z.string().nullable(),
  dateDepot: z.string().nullable(),
  dateVote: z.string().nullable(),
  status: z.enum(['en_cours', 'adopte', 'rejete', 'suspendu']),
  geoLevel: GeoLevelSchema,
  geoCode: z.string().nullable(),
});
export type NormalizedProposition = z.infer<typeof NormalizedPropositionSchema>;

export const SourceRegistryEntrySchema = z.object({
  id: z.string(),
  cronSchedule: z.string(),
  geoLevel: GeoLevelSchema,
  institution: InstitutionSchema,
  docsUrl: z.string().url(),
  description: z.string(),
});
export type SourceRegistryEntry = z.infer<typeof SourceRegistryEntrySchema>;
