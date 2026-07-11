import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecommendationService } from './recommendation.service';
import { AppDataSource } from '../../database/datasource';

vi.mock('../../database/datasource', () => ({
  AppDataSource: {
    getRepository: vi.fn().mockReturnValue({
      create: vi.fn().mockReturnValue({}),
      save: vi.fn().mockResolvedValue({}),
    }),
  },
}));

vi.mock('../../config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = new RecommendationService();
  });

  describe('recommend', () => {
    it('returns travel category for beach-related interest', async () => {
      const result = await service.recommend('saya suka pantai');
      expect(result.category).toBe('travel');
      expect(result.suggestions).toContain('Pantai Kuta');
      expect(result.ruleBased).toBe(true);
    });

    it('returns food category for culinary interest', async () => {
      const result = await service.recommend('makanan enak');
      expect(result.category).toBe('food');
      expect(result.suggestions).toContain('Nasi Goreng Spesial');
    });

    it('returns education category for learning interest', async () => {
      const result = await service.recommend('saya ingin belajar coding');
      expect(result.category).toBe('education');
    });

    it('returns health category for gym interest', async () => {
      const result = await service.recommend('olahraga di gym');
      expect(result.category).toBe('health');
    });

    it('returns general category for unknown interest', async () => {
      const result = await service.recommend('halo apa kabar');
      expect(result.category).toBe('general');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.ruleBased).toBe(true);
    });

    it('matches keywords case-insensitively', async () => {
      const result = await service.recommend('PANTAI');
      expect(result.category).toBe('travel');
    });

    it('matches partial keywords in longer text', async () => {
      const result = await service.recommend('besok aku mau liburan ke bali');
      expect(result.category).toBe('travel');
    });
  });
});
