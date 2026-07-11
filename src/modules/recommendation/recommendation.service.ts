import { AppDataSource } from '../../database/datasource';
import { Recommendation } from './entities/recommendation.entity';
import { logger } from '../../config/logger';

interface Rule {
  category: string;
  keywords: string[];
  suggestions: string[];
}

export class RecommendationService {
  private rules: Rule[] = [
    {
      category: 'travel',
      keywords: ['pantai', 'gunung', 'liburan', 'beach', 'mountain', 'travel', 'wisata'],
      suggestions: ['Pantai Kuta', 'Gunung Bromo', 'Raja Ampat Tour', 'Bali Package'],
    },
    {
      category: 'food',
      keywords: ['makanan', 'kuliner', 'restoran', 'food', 'masakan', 'pedas'],
      suggestions: ['Nasi Goreng Spesial', 'Sate Ayam Madura', 'Rendang Padang', 'Gado-Gado'],
    },
    {
      category: 'education',
      keywords: ['belajar', 'kursus', 'sekolah', 'kuliah', 'coding', 'bahasa'],
      suggestions: ['Kursus JavaScript', 'Belajar Python', 'English Course', 'UI/UX Design'],
    },
    {
      category: 'health',
      keywords: ['sehat', 'diet', 'olahraga', 'gym', 'fitness', 'yoga'],
      suggestions: ['Program Diet 30 Hari', 'Yoga Online', 'Personal Trainer', 'Meal Plan'],
    },
  ];

  async recommend(userInterest: string, userId?: string, applicationId?: number): Promise<{ category: string; suggestions: string[]; ruleBased: boolean }> {
    const lowerInterest = userInterest.toLowerCase();
    let matchedRule: Rule | undefined;

    for (const rule of this.rules) {
      const hasMatch = rule.keywords.some((keyword) => lowerInterest.includes(keyword));
      if (hasMatch) {
        matchedRule = rule;
        break;
      }
    }

    const result = matchedRule
      ? { category: matchedRule.category, suggestions: matchedRule.suggestions, ruleBased: true }
      : { category: 'general', suggestions: this.getDefaultSuggestions(), ruleBased: true };

    const repo = AppDataSource.getRepository(Recommendation);
    await repo.save(
      repo.create({
        applicationId,
        userId: userId || undefined,
        type: 'interest',
        data: { interest: userInterest, result },
      }),
    );

    logger.info({ userInterest, matched: result.category }, 'Recommendation generated');
    return result;
  }

  async getHistory(userId?: string, page: number = 1, limit: number = 20): Promise<{ data: Recommendation[]; total: number }> {
    const repo = AppDataSource.getRepository(Recommendation);
    const where: any = {};
    if (userId) where.userId = userId;

    const [data, total] = await repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }

  private getDefaultSuggestions(): string[] {
    return [
      'Coba explore kategori travel',
      'Lihat rekomendasi kuliner',
      'Mulai belajar skill baru',
      'Jaga kesehatan dengan olahraga',
    ];
  }
}
