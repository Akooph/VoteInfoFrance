import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  SUPABASE_JWT_SECRET: Joi.string().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  MISTRAL_API_KEY: Joi.string().allow('').default(''),
  SUMMARIZATION_ENABLED: Joi.boolean().default(true),
  MISTRAL_MODEL: Joi.string().default('mistral-small-latest'),
  MISTRAL_MAX_TOKENS: Joi.number().default(1500),
  MISTRAL_MAX_CONCURRENT_JOBS: Joi.number().default(10),

  PISTE_CLIENT_ID: Joi.string().allow('').default(''),
  PISTE_CLIENT_SECRET: Joi.string().allow('').default(''),

  ADMIN_API_KEY: Joi.string().required(),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  VOTE_THROTTLE_LIMIT: Joi.number().default(20),
});
