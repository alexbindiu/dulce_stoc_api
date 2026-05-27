import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn((dto) => {
      if (dto.email === 'test@test.com' && dto.password === 'correct') {
        return { accessToken: 'jwt-token', user: { email: 'test@test.com' } };
      }
      throw new Error('Unauthorized');
    }),
    register: jest.fn((dto) => {
      return { accessToken: 'jwt-token', user: { email: dto.email } };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should successfully log in a user', async () => {
    const result = await controller.login({ email: 'test@test.com', password: 'correct' });
    //expect(result.accessToken).toBeDefined();
    //expect(result.user.email).toBe('test@test.com');
  });

  it('should fail login with wrong credentials', async () => {
    await expect(controller.login({ email: 'test@test.com', password: 'wrong' }))
      .rejects.toThrow('Unauthorized');
  });
});