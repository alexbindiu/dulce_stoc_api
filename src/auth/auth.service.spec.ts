import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto'; // <--- Am adăugat acest import

// Îi spunem explicit că este de tip RegisterDto
const VALID_REGISTER: RegisterDto = {
  firstName: 'Maria', 
  lastName: 'Popescu', 
  email: 'maria@test.ro',
  password: 'parola123', 
  businessName: 'Cofetăria Mea', 
  businessType: 'Cofetărie', 
  county: 'București',
};

const DEMO_USER = {
  id: 'demo-user-1', email: 'ana@dulceco.ro', password: 'parola123',
};

// ... restul fișierului rămâne exact la fel!
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  // Falsificăm conexiunea la baza de date
  const mockUserRepo = {
    findOne: jest.fn().mockImplementation(({ where }) => {
      if (where.email === 'ana@dulceco.ro') return Promise.resolve(DEMO_USER);
      if (where.id === 'demo-user-1') return Promise.resolve(DEMO_USER);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 'new-uuid', ...user })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns user (without password) and accessToken', async () => {
      const result = await service.register(VALID_REGISTER);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user.email).toBe(VALID_REGISTER.email);
      expect((result.user as any).password).toBeUndefined();
    });

    it('throws ConflictException for duplicate email', async () => {
      // Simulăm că adresa există deja în baza de date
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 'existing-user' });
      await expect(service.register(VALID_REGISTER)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns user and accessToken for valid credentials', async () => {
      const result = await service.login({ email: 'ana@dulceco.ro', password: 'parola123' });
      expect(result.user.email).toBe('ana@dulceco.ro');
      expect(result.accessToken).toBe('mock.jwt.token');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      await expect(service.login({ email: 'ana@dulceco.ro', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for unknown email', async () => {
      await expect(service.login({ email: 'nobody@test.ro', password: 'parola123' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('returns the user for a valid id', async () => {
      const user = await service.findById('demo-user-1');
      expect(user?.email).toBe('ana@dulceco.ro');
    });

    it('returns undefined for unknown id', async () => {
      const user = await service.findById('nonexistent');
      expect(user).toBeUndefined();
    });
  });
});