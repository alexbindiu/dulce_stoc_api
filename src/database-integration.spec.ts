import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './auth/entities/user.entity';
import { Product, Category } from './products/entities/product.entity';
import { Order, OrderStatus } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

describe('Database Integration & 3NF Test', () => {
  let module: TestingModule;
  let userRepo: Repository<User>;
  let productRepo: Repository<Product>;
  let orderRepo: Repository<Order>;
  let orderItemRepo: Repository<OrderItem>;

  // Înainte de toate testele, pornim o bază de date reală SQLite, dar ținută doar în memoria RAM
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:', 
          entities: [User, Product, Order, OrderItem],
          synchronize: true, 
        }),
        TypeOrmModule.forFeature([User, Product, Order, OrderItem]),
      ],
    }).compile();

    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepo = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
  });

  // La final, închidem conexiunea pentru a curăța memoria
  afterAll(async () => {
    await module.close();
  });

  it('should perform full CRUD operations and verify relational constraints (3NF)', async () => {
    // 1. CREARE USER
    const user = userRepo.create({
      firstName: 'Test', lastName: 'Database', email: 'test@db.ro', password: '123',
      businessName: 'Test Biz', businessType: 'Patiserie', county: 'București'
    });
    const savedUser = await userRepo.save(user);
    expect(savedUser.id).toBeDefined();

    // 2. CREARE PRODUS LEGAT DE USER
    const product = productRepo.create({
      userId: savedUser.id, name: 'Ecler DB', category: Category.Ecler,
      pricePerUnit: 15, stock: 10, description: 'Ecler test', ingredients: ['Lapte'], isActive: true
    });
    const savedProduct = await productRepo.save(product);
    expect(savedProduct.id).toBeDefined();

    // 3. CREARE COMANDĂ
    const order = orderRepo.create({
      userId: savedUser.id, customerName: 'Client DB', status: OrderStatus.PENDING,
      totalValue: 30, totalItems: 2
    });
    const savedOrder = await orderRepo.save(order);

    // 4. CREARE ITEM COMANDĂ (Demonstrăm relația și faptul că prețul e salvat separat - 3NF)
    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id, productId: savedProduct.id,
      quantity: 2, unitPrice: savedProduct.pricePerUnit, subtotal: 30
    });
    await orderItemRepo.save(orderItem);

    // 5. CITIRE CU RELAȚII (Aducem comanda cu tot cu user și produse)
    const foundOrder = await orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['user', 'items', 'items.product']
    });

    // Verificăm dacă baza de date a unit tabelele corect
    expect(foundOrder).toBeDefined();
    expect(foundOrder.user.email).toBe('test@db.ro');
    expect(foundOrder.items.length).toBe(1);
    expect(foundOrder.items[0].product.name).toBe('Ecler DB');

    // 6. DELETE ÎN CASCADĂ
    await userRepo.remove(savedUser);
    
    // Deoarece userul a fost șters, comenzile și produsele lui ar trebui să dispară
    const deletedOrder = await orderRepo.findOne({ where: { id: savedOrder.id } });
    expect(deletedOrder).toBeNull();
  });
});