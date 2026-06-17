export * from './geo';
export * from './proposition';
export * from './vote';
export * from './user';
export * from './ingestion';

export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};
