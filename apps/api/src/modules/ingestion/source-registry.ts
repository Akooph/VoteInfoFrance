import type { SourceRegistryEntry } from '@vif/types';

/**
 * The authoritative list of all data sources.
 * To add a new source: add an entry here + create a matching adapter in ./adapters/.
 */
export const SOURCE_REGISTRY: readonly SourceRegistryEntry[] = [
  {
    id: 'assemblee_nationale',
    cronSchedule: '0 */4 * * *',
    geoLevel: 'national',
    institution: 'assemblee_nationale',
    docsUrl: 'https://data.assemblee-nationale.fr',
    description: 'Dossiers législatifs de l\'Assemblée Nationale (open data)',
  },
  {
    id: 'senat',
    cronSchedule: '0 */4 * * *',
    geoLevel: 'national',
    institution: 'senat',
    docsUrl: 'https://data.senat.fr',
    description: 'Dossiers législatifs du Sénat (dataset DOSLEG)',
  },
  {
    id: 'legifrance',
    cronSchedule: '0 6 * * *',
    geoLevel: 'national',
    institution: 'senat',
    docsUrl: 'https://piste.gouv.fr',
    description: 'Textes consolidés et constitutionnels via API PISTE (OAuth2)',
  },
  {
    id: 'parlement_europeen',
    cronSchedule: '0 */6 * * *',
    geoLevel: 'europeen',
    institution: 'parlement_europeen',
    docsUrl: 'https://howtheyvote.eu/api/',
    description: 'Votes en séance plénière du Parlement Européen via HowTheyVote API',
  },
  {
    id: 'conseils_regionaux',
    cronSchedule: '0 8 * * *',
    geoLevel: 'region',
    institution: 'conseil_regional',
    docsUrl: 'https://www.data.gouv.fr',
    description: 'Délibérations des conseils régionaux via data.gouv.fr',
  },
] as const;
