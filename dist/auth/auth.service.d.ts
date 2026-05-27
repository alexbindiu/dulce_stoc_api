import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ObservationList } from './entities/observation-list.entity';
export interface AuthResult {
    user: Omit<User, 'password' | 'products' | 'orders'>;
    accessToken: string;
}
export declare class AuthService implements OnModuleInit {
    private readonly userRepo;
    private readonly roleRepo;
    private readonly permRepo;
    private readonly auditLogRepo;
    private readonly obsListRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>, permRepo: Repository<Permission>, auditLogRepo: Repository<AuditLog>, obsListRepo: Repository<ObservationList>, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            businessName: string;
            businessType: string;
            county: string;
            role: Role;
            products?: import("../products/entities/product.entity").Product[];
            orders?: import("../orders/entities/order.entity").Order[];
        };
        accessToken: string;
    }>;
    private otpStore;
    login(dto: LoginDto): Promise<{
        message: string;
        requiresOTP: boolean;
        email: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<AuthResult>;
    private _toResult;
    findById(id: string): Promise<User | undefined>;
    getAuditLogs(): Promise<AuditLog[]>;
    getObservationList(): Promise<ObservationList[]>;
    private resetTokens;
    generatePasswordResetToken(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
