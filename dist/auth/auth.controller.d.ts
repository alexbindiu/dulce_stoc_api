import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            businessName: string;
            businessType: string;
            county: string;
            role: import("./entities/role.entity").Role;
            products?: import("../products/entities/product.entity").Product[];
            orders?: import("../orders/entities/order.entity").Order[];
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        requiresOTP: boolean;
        email: string;
    }>;
    getAuditLogs(): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getObservationList(): Promise<import("./entities/observation-list.entity").ObservationList[]>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        message: string;
    }>;
    verifyOtp(body: {
        email: string;
        otp: string;
    }): Promise<import("./auth.service").AuthResult>;
}
