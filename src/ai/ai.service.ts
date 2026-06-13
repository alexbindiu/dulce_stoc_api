import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { BusinessProfile } from '../marketplace/dto/business-profile.type';
import { ConciergeRecommendation, ConciergeResult } from './dto/concierge.types';

const NOT_CLIENT = 'N/A';

interface BizWithProducts {
  user: User;
  products: Product[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async ask(query: string): Promise<ConciergeResult> {
    const businesses = await this.loadBusinesses();
    if (businesses.length === 0) {
      return {
        message: 'Momentan nu există afaceri înregistrate. Revino curând! 🧁',
        recommendations: [],
        usedAi: false,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        return await this.askGemini(query, businesses, apiKey);
      } catch (e: any) {
        this.logger.warn(`Gemini a eșuat, folosesc fallback: ${e?.message ?? e}`);
      }
    }
    // Fallback: o mică pauză ca experiența să pară că a consultat un LLM extern.
    await this.sleep(3500);
    return this.keywordFallback(query, businesses);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async loadBusinesses(): Promise<BizWithProducts[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.businessName != :na', { na: NOT_CLIENT })
      .getMany();
    if (users.length === 0) return [];
    const products = await this.productRepo.find({ where: { isActive: true } });
    return users.map((user) => ({
      user,
      products: products.filter((p) => p.userId === user.id),
    }));
  }

  // ── Gemini (grounded: recomandă DOAR din lista reală) ───────────────────────
  private async askGemini(
    query: string,
    businesses: BizWithProducts[],
    apiKey: string,
  ): Promise<ConciergeResult> {
    const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

    const catalog = businesses.map((b) => ({
      businessId: b.user.id,
      nume: b.user.businessName,
      tip: b.user.businessType,
      oras: b.user.county,
      productie: b.user.productionScale ?? null,
      optiuniDietetice: b.user.dietaryOptions ?? [],
      specialitati: b.user.specialties ?? null,
      descriere: b.user.description ?? null,
      produse: b.products.slice(0, 25).map((p) => ({
        nume: p.name,
        categorie: p.category,
        pret: p.pricePerUnit,
        stoc: p.stock,
        ingrediente: p.ingredients ?? [],
        expira: p.expiryDate ?? null,
      })),
    }));

    const system = `Ești «Asistentul Dulce», un concierge prietenos pentru patiserii și cofetării locale.
Primești o listă de AFACERI REALE (cu produsele lor) și cererea unui client.
Reguli:
- Recomandă DOAR afaceri din listă și folosește EXACT businessId-ul primit. Nu inventa afaceri sau produse.
- Alege cele mai potrivite 1–4 afaceri pentru cerere.
- Pentru fiecare, scrie un motiv scurt (1 frază) și produsele relevante (din lista lor).
- Răspunde în limba română, cald și concis. Dacă nimic nu se potrivește, întoarce recommendations gol și un mesaj amabil cu o sugestie.`;

    const userContent = `Cererea clientului: "${query}"\n\nAfaceri disponibile (JSON):\n${JSON.stringify(catalog)}`;

    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            message: { type: 'STRING' },
            recommendations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  businessId: { type: 'STRING' },
                  reason: { type: 'STRING' },
                  matchedProducts: { type: 'ARRAY', items: { type: 'STRING' } },
                },
                required: ['businessId', 'reason'],
              },
            },
          },
          required: ['message', 'recommendations'],
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Răspuns Gemini gol');

    const parsed = JSON.parse(text) as {
      message: string;
      recommendations: { businessId: string; reason: string; matchedProducts?: string[] }[];
    };

    const byId = new Map(businesses.map((b) => [b.user.id, b]));
    const recommendations: ConciergeRecommendation[] = (parsed.recommendations ?? [])
      .map((r) => {
        const biz = byId.get(r.businessId);
        if (!biz) return null; // ignoră orice ID inventat
        return {
          business: this.toProfile(biz),
          reason: r.reason,
          matchedProducts: (r.matchedProducts ?? []).slice(0, 6),
        };
      })
      .filter((r): r is ConciergeRecommendation => r !== null);

    return {
      message: parsed.message || 'Iată ce am găsit pentru tine:',
      recommendations,
      usedAi: true,
    };
  }

  // ── Fallback fără AI (căutare după cuvinte cheie) ───────────────────────────
  private keywordFallback(query: string, businesses: BizWithProducts[]): ConciergeResult {
    const terms = query.toLowerCase().split(/[^a-zăâîșț0-9]+/i).filter((t) => t.length >= 3);

    const scored = businesses.map((b) => {
      const hay = [
        b.user.businessName, b.user.businessType, b.user.county,
        b.user.productionScale, b.user.specialties, b.user.description,
        ...(b.user.dietaryOptions ?? []),
        ...b.products.flatMap((p) => [p.name, p.category, ...(p.ingredients ?? [])]),
      ].filter(Boolean).join(' ').toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      const matched = b.products
        .filter((p) => terms.some((t) =>
          `${p.name} ${p.category} ${(p.ingredients ?? []).join(' ')}`.toLowerCase().includes(t)))
        .map((p) => p.name)
        .slice(0, 6);
      return { b, score, matched };
    });

    const top = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    const chosen = top.length > 0 ? top : scored.slice(0, 3);

    const recommendations: ConciergeRecommendation[] = chosen.map(({ b, matched }) => ({
      business: this.toProfile(b),
      reason: matched.length
        ? `Are produse care s-ar putea potrivi: ${matched.slice(0, 3).join(', ')}.`
        : `${b.user.businessType} din ${b.user.county}.`,
      matchedProducts: matched,
    }));

    return {
      message: top.length
        ? 'Iată câteva afaceri care s-ar putea potrivi cererii tale:'
        : 'Nu am găsit o potrivire exactă, dar uite câteva afaceri locale:',
      recommendations,
      usedAi: false,
    };
  }

  private toProfile(b: BizWithProducts): BusinessProfile {
    const u = b.user;
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      businessName: u.businessName,
      businessType: u.businessType,
      county: u.county,
      phone: u.phone,
      description: u.description,
      productionScale: u.productionScale,
      dietaryOptions: u.dietaryOptions,
      specialties: u.specialties,
      productCount: b.products.length,
    };
  }
}
