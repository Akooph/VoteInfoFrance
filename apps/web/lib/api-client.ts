import type {
  GeoLookupResult,
  PaginatedPropositions,
  Proposition,
  VoteTally,
  DepartmentVoteTally,
  CreateVoteBody,
  UserVote,
  GeoLevel,
  Institution,
  UserProfile,
} from '@vif/types';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000/api/v1';

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'API error');
  }
  return res.json() as Promise<T>;
}

export const api = {
  geo: {
    lookup: (codePostal: string) =>
      apiFetch<GeoLookupResult>(`/geo/lookup?codePostal=${codePostal}`),
    departements: () => apiFetch<{ code: string; nom: string }[]>('/geo/departements'),
  },
  propositions: {
    list: (params: {
      geoLevel?: GeoLevel;
      geoCode?: string;
      status?: string;
      institution?: Institution;
      page?: number;
      limit?: number;
      token?: string;
    }) => {
      const q = new URLSearchParams();
      if (params.geoLevel) q.set('geoLevel', params.geoLevel);
      if (params.geoCode) q.set('geoCode', params.geoCode);
      if (params.status) q.set('status', params.status);
      if (params.institution) q.set('institution', params.institution);
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      return apiFetch<PaginatedPropositions>(`/propositions?${q.toString()}`, {
        token: params.token,
      });
    },
    get: (id: string, token?: string) =>
      apiFetch<Proposition>(`/propositions/${id}`, { token }),
    tally: (id: string) => apiFetch<VoteTally>(`/propositions/${id}/tally`),
    mapData: (id: string) =>
      apiFetch<DepartmentVoteTally[]>(`/propositions/${id}/map`),
  },
  votes: {
    cast: (body: CreateVoteBody, token: string) =>
      apiFetch<UserVote>('/votes', {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
    myVotes: (token: string) => apiFetch<UserVote[]>('/votes/me', { token }),
  },
  profile: {
    get: (token: string) => apiFetch<UserProfile>('/profile', { token }),
    update: (codePostal: string, token: string) =>
      apiFetch<UserProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify({ codePostal }),
        token,
      }),
  },
};
