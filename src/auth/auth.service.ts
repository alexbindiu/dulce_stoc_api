import { ConflictException, Injectable, UnauthorizedException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ObservationList } from './entities/observation-list.entity';
import * as bcrypt from 'bcrypt';

export interface AuthResult {
  user: Omit<User, 'password' | 'products' | 'orders'>;
  accessToken: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
  @InjectRepository(User) private readonly userRepo: Repository<User>,
  @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
  @InjectRepository(AuditLog) private readonly auditLogRepo: Repository<AuditLog>, // <--- Nou
  @InjectRepository(ObservationList) private readonly obsListRepo: Repository<ObservationList>, // <--- Nou
  private readonly jwtService: JwtService,
) {}

  // Această funcție rulează singură la pornirea serverului
  async onModuleInit() {
    // 1. Creăm Permisiunile dacă nu există
    let pManage = await this.permRepo.findOne({ where: { action: 'MANAGE_OWN_BUSINESS' } });
    if (!pManage) pManage = await this.permRepo.save(this.permRepo.create({ action: 'MANAGE_OWN_BUSINESS' }));

    let pView = await this.permRepo.findOne({ where: { action: 'VIEW_ALL_BUSINESSES' } });
    if (!pView) pView = await this.permRepo.save(this.permRepo.create({ action: 'VIEW_ALL_BUSINESSES' }));

    // 2. Creăm Rolurile și le asociem permisiunile
    let roleAdmin = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
    if (!roleAdmin) roleAdmin = await this.roleRepo.save(this.roleRepo.create({ name: 'ADMIN', permissions: [pManage, pView] })); // Adminul le are pe amândouă

    let roleUser = await this.roleRepo.findOne({ where: { name: 'NORMAL_USER' } });
    if (!roleUser) roleUser = await this.roleRepo.save(this.roleRepo.create({ name: 'NORMAL_USER', permissions: [pView] })); // Userul poate doar să vadă

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('parola123', salt);

    // 3. Creăm Contul de ADMIN (Proprietar Patiserie)
    const adminEmail = 'admin@patiserie.ro';
    if (!(await this.userRepo.findOne({ where: { email: adminEmail } }))) {
      await this.userRepo.save(this.userRepo.create({
        firstName: 'Ana', lastName: 'Proprietar', email: adminEmail, 
        password: hashedPassword, // <--- Salvăm parola hash-uită!
        businessName: 'Patiseria Anei', businessType: 'Patiserie', county: 'Cluj', role: roleAdmin
      }));
    }

    // 4. Creăm Contul de USER NORMAL (Client vizitator)
    const userEmail = 'client@vizitator.ro';
    if (!(await this.userRepo.findOne({ where: { email: userEmail } }))) {
      await this.userRepo.save(this.userRepo.create({
        firstName: 'Ion', lastName: 'Client', email: userEmail, 
        password: hashedPassword, // <--- Salvăm parola hash-uită!
        businessName: 'N/A', businessType: 'Altele', county: 'Cluj', role: roleUser
      }));
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: registerDto.email } });
    if (existingUser) throw new ConflictException('Există deja un cont cu acest email.');

    const expectedRoleName = registerDto.businessName === 'N/A' ? 'NORMAL_USER' : 'ADMIN';
    const assignedRole = await this.roleRepo.findOne({ where: { name: expectedRoleName } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    const user = this.userRepo.create({
      ...registerDto,
      password: hashedPassword,
      role: assignedRole,
    });

    const savedUser = await this.userRepo.save(user);

    const payload = { sub: savedUser.id, email: savedUser.email, role: assignedRole.name };
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      accessToken: this.jwtService.sign(payload),
    };
  }

  private otpStore = new Map<string, string>(); 

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email sau parolă incorectă.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(user.email, otp);

    console.log(`Sending OTP ${otp} to ${user.email}`);

    return { 
      message: 'OTP trimis pe email. Vă rugăm să verificați.', 
      requiresOTP: true, 
      email: user.email 
    };
  }

  async verifyOtp(email: string, otp: string): Promise<AuthResult> {
    const storedOtp = this.otpStore.get(email);
    
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('OTP Invalid sau expirat.');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    this.otpStore.delete(email);
    
    return this._toResult(user); 
  }

  private _toResult(user: User): AuthResult {
    const { password, products, orders, ...userWithoutPassword } = user;
    const payload = { sub: user.id, email: user.email, role: user.role?.name };
    const accessToken = this.jwtService.sign(payload);
    return { user: userWithoutPassword, accessToken };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ?? undefined;
  }

  async getAuditLogs() {
    // Aduce ultimele 100 de acțiuni, cele mai noi primele
    return this.auditLogRepo.find({ order: { timestamp: 'DESC' }, take: 100 });
  }

  async getObservationList() {
    // Aduce lista de suspecți
    return this.obsListRepo.find({ order: { detectedAt: 'DESC' } });
  }

  private resetTokens = new Map<string, string>(); 

  async generatePasswordResetToken(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = Math.random().toString(36).substring(2, 15); 
    this.resetTokens.set(token, email);

    console.log(`EMAIL to: ${email} | to reset: https://localhost:5173/reset-password?token=${token}`);
    return { message: 'Email sent with reset instructions' };
  }

  async resetPassword(token: string, newPassword: string) {
    const email = this.resetTokens.get(token);
    if (!email) throw new UnauthorizedException('Invalid or expired token');

    const user = await this.userRepo.findOne({ where: { email } });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await this.userRepo.save(user);
    this.resetTokens.delete(token);
    return { message: 'Password reset successfully' };
  }
}