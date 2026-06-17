import { z } from 'zod';

export const GeoLevelSchema = z.enum([
  'commune',
  'departement',
  'region',
  'national',
  'europeen',
]);
export type GeoLevel = z.infer<typeof GeoLevelSchema>;

export const CommuneSchema = z.object({
  codeInsee: z.string(),
  nom: z.string(),
  codePostal: z.array(z.string()),
  codeDept: z.string(),
});
export type Commune = z.infer<typeof CommuneSchema>;

export const DepartementSchema = z.object({
  code: z.string(),
  nom: z.string(),
  codeRegion: z.string(),
});
export type Departement = z.infer<typeof DepartementSchema>;

export const RegionSchema = z.object({
  code: z.string(),
  nom: z.string(),
});
export type Region = z.infer<typeof RegionSchema>;

export const GeoLookupResultSchema = z.object({
  commune: CommuneSchema,
  departement: DepartementSchema,
  region: RegionSchema,
  national: z.literal(true),
  europeen: z.literal(true),
});
export type GeoLookupResult = z.infer<typeof GeoLookupResultSchema>;
