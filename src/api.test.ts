import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from './app';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Health & System API', () => {
  it('GET /ping returns ok', async () => {
    const res = await supertest(app.server).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /health returns service statuses', async () => {
    const res = await supertest(app.server).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('database');
    expect(res.body.services).toHaveProperty('redis');
    expect(res.body.services).toHaveProperty('whatsapp');
  });

  it('GET /api/v1/system/metrics returns metrics', async () => {
    const res = await supertest(app.server).get('/api/v1/system/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('services');
  });
});

describe('Auth API', () => {
  it('POST /api/v1/auth/register without name returns 400', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({ description: 'test' });
    expect(res.status).toBe(400);
  });
});

describe('Rate Limiting', () => {
  it('returns 429 after exceeding rate limit', async () => {
    const responses = [];
    for (let i = 0; i < 110; i++) {
      responses.push(await supertest(app.server).get('/ping'));
    }

    const rateLimited = responses.some((r) => r.status === 429);
    expect(rateLimited).toBe(true);
  }, 15000);
});
