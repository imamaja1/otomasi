import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { AppDataSource } from './database/datasource';

let app: FastifyInstance;

export async function setupTestApp() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = await buildApp();
  await app.ready();
  return app;
}

export async function teardownTestApp() {
  if (app) {
    await app.close();
  }
}

export { app };
