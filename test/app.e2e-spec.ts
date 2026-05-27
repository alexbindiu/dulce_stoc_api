import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { ProductsService } from '../src/products/products.service';
import { Category } from '../src/products/entities/product.entity';

// ── Test fixtures ────────────────────────────────────────────────────────────
const DEMO = { email: 'ana@dulceco.ro', password: 'parola123' };

const NEW_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@dulcestoc.ro',
  password: 'parola123',
  businessName: 'Test Bakery',
  businessType: 'Brutărie',
  county: 'Cluj',
};

const VALID_PRODUCT = {
  name: 'Ecler E2E',
  category: Category.Ecler,
  pricePerUnit: 14.5,
  stock: 20,
  description: 'E2E test ecler.',
  ingredients: ['Făină', 'Ouă'],
  isActive: true,
};

describe('DulceStoc API (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let productsService: ProductsService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    authService._reset();
    productsService._reset([]);
  });

  // ── Auth: POST /api/auth/register ─────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('201: registers a new user and returns token', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(201)
        .expect(({ body }) => {
          expect(body.accessToken).toBeTruthy();
          expect(body.user.email).toBe(NEW_USER.email);
          expect(body.user.password).toBeUndefined();
        }));

    it('409: duplicate email returns conflict', async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send(NEW_USER);
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(NEW_USER)
        .expect(409);
    });

    it('400: missing firstName', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, firstName: '' })
        .expect(400));

    it('400: short firstName', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, firstName: 'A' })
        .expect(400));

    it('400: invalid email', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, email: 'not-an-email' })
        .expect(400));

    it('400: password shorter than 8 chars', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, password: 'short' })
        .expect(400));

    it('400: invalid businessType', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, businessType: 'InvalidType' })
        .expect(400));

    it('400: missing county', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, county: '' })
        .expect(400));

    it('400: extra unknown fields are rejected (whitelist)', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...NEW_USER, unknownField: 'hack' })
        .expect(400));
  });

  // ── Auth: POST /api/auth/login ────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('200: demo credentials return token', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send(DEMO)
        .expect(200)
        .expect(({ body }) => {
          expect(body.accessToken).toBeTruthy();
          expect(body.user.email).toBe(DEMO.email);
        }));

    it('401: wrong password', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: DEMO.email, password: 'wrong' })
        .expect(401));

    it('401: unknown email', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@x.ro', password: 'parola123' })
        .expect(401));

    it('400: invalid email format', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'bad', password: 'parola123' })
        .expect(400));

    it('400: missing password', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: DEMO.email })
        .expect(400));
  });

  // ── Products: JWT guard ───────────────────────────────────────────────────
  describe('JWT guard', () => {
    it('401: GET /api/products without token', () =>
      request(app.getHttpServer()).get('/api/products').expect(401));

    it('401: POST /api/products without token', () =>
      request(app.getHttpServer()).post('/api/products').send(VALID_PRODUCT).expect(401));

    it('401: GET /api/statistics without token', () =>
      request(app.getHttpServer()).get('/api/statistics').expect(401));
  });

  // ── Products: CRUD ────────────────────────────────────────────────────────
  describe('Products CRUD', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(DEMO);
      token = res.body.accessToken;
    });

    // POST
    it('201: creates a product', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT)
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeTruthy();
          expect(body.name).toBe('Ecler E2E');
          expect(body.pricePerUnit).toBe(14.5);
        }));

    it('400: missing name', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, name: '' })
        .expect(400));

    it('400: invalid category', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, category: 'Sandwich' })
        .expect(400));

    it('400: negative price', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, pricePerUnit: -1 })
        .expect(400));

    it('400: price exceeds 100000', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, pricePerUnit: 100001 })
        .expect(400));

    it('400: price with more than 2 decimals', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, pricePerUnit: 9.999 })
        .expect(400));

    it('400: non-integer stock', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, stock: 10.5 })
        .expect(400));

    it('400: negative stock', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, stock: -1 })
        .expect(400));

    it('400: description over 500 chars', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, description: 'A'.repeat(501) })
        .expect(400));

    it('400: ingredient over 80 chars', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, ingredients: ['A'.repeat(81)] })
        .expect(400));

    it('400: more than 50 ingredients', () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...VALID_PRODUCT,
          ingredients: Array.from({ length: 51 }, (_, i) => `Ing${i}`),
        })
        .expect(400));

    // GET all
    it('200: GET /api/products returns paginated envelope', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      return request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.data).toBeInstanceOf(Array);
          expect(body.total).toBeGreaterThanOrEqual(1);
          expect(body.page).toBe(1);
          expect(body.pageSize).toBe(6);
          expect(body.totalPages).toBeGreaterThanOrEqual(1);
        });
    });

    it('200: pagination page & pageSize query params work', async () => {
      for (let i = 0; i < 8; i++) {
        await request(app.getHttpServer())
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...VALID_PRODUCT, name: `Produs ${i}` });
      }

      const { body } = await request(app.getHttpServer())
        .get('/api/products?page=2&pageSize=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.page).toBe(2);
      expect(body.pageSize).toBe(5);
      expect(body.data.length).toBe(3); // 8 items, page 2 of 5 = remaining 3
    });

    it('200: search filter works', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      const { body } = await request(app.getHttpServer())
        .get('/api/products?search=Ecler+E2E')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.data.some((p: any) => p.name === 'Ecler E2E')).toBe(true);
    });

    it('200: category filter works', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      const { body } = await request(app.getHttpServer())
        .get(`/api/products?category=${encodeURIComponent(Category.Ecler)}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.data.every((p: any) => p.category === Category.Ecler)).toBe(true);
    });

    it('200: activeOnly=true hides inactive products', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, isActive: false });

      const { body } = await request(app.getHttpServer())
        .get('/api/products?activeOnly=true')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.data.every((p: any) => p.isActive === true)).toBe(true);
    });

    // GET one
    it('200: GET /api/products/:id returns the product', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      return request(app.getHttpServer())
        .get(`/api/products/${created.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => expect(body.id).toBe(created.id));
    });

    it('404: GET /api/products/:id with unknown id', () =>
      request(app.getHttpServer())
        .get('/api/products/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404));

    // PATCH
    it('200: PATCH /api/products/:id updates fields', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      return request(app.getHttpServer())
        .patch(`/api/products/${created.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stock: 99, name: 'Ecler Updated' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.stock).toBe(99);
          expect(body.name).toBe('Ecler Updated');
          expect(body.id).toBe(created.id);
        });
    });

    it('404: PATCH with unknown id', () =>
      request(app.getHttpServer())
        .patch('/api/products/ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ stock: 5 })
        .expect(404));

    it('400: PATCH with invalid price decimals', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      return request(app.getHttpServer())
        .patch(`/api/products/${created.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ pricePerUnit: 1.111 })
        .expect(400);
    });

    // DELETE
    it('204: DELETE /api/products/:id removes the product', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      await request(app.getHttpServer())
        .delete(`/api/products/${created.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/api/products/${created.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('404: DELETE with unknown id', () =>
      request(app.getHttpServer())
        .delete('/api/products/ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404));
  });

  // ── Statistics ─────────────────────────────────────────────────────────────
  describe('GET /api/statistics', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(DEMO);
      token = res.body.accessToken;
    });

    it('200: returns summary envelope for empty store', () =>
      request(app.getHttpServer())
        .get('/api/statistics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => {
          expect(typeof body.totalProducts).toBe('number');
          expect(typeof body.activeProducts).toBe('number');
          expect(typeof body.inactiveProducts).toBe('number');
          expect(typeof body.outOfStockProducts).toBe('number');
          expect(typeof body.totalStock).toBe('number');
          expect(typeof body.totalStockValue).toBe('number');
          expect(typeof body.averagePrice).toBe('number');
          expect(Array.isArray(body.byCategory)).toBe(true);
        }));

    it('200: reflects newly added products', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...VALID_PRODUCT, stock: 10, pricePerUnit: 10 });

      const { body } = await request(app.getHttpServer())
        .get('/api/statistics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body.totalProducts).toBe(1);
      expect(body.totalStock).toBe(10);
      expect(body.totalStockValue).toBe(100);
    });

    it('200: byCategory contains correct category', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(VALID_PRODUCT);

      const { body } = await request(app.getHttpServer())
        .get('/api/statistics')
        .set('Authorization', `Bearer ${token}`);

      const ecler = body.byCategory.find((c: any) => c.category === Category.Ecler);
      expect(ecler).toBeDefined();
      expect(ecler.count).toBeGreaterThanOrEqual(1);
    });
  });
});
