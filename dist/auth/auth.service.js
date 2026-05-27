"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const observation_list_entity_1 = require("./entities/observation-list.entity");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userRepo, roleRepo, permRepo, auditLogRepo, obsListRepo, jwtService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.permRepo = permRepo;
        this.auditLogRepo = auditLogRepo;
        this.obsListRepo = obsListRepo;
        this.jwtService = jwtService;
        this.otpStore = new Map();
        this.resetTokens = new Map();
    }
    async onModuleInit() {
        let pManage = await this.permRepo.findOne({ where: { action: 'MANAGE_OWN_BUSINESS' } });
        if (!pManage)
            pManage = await this.permRepo.save(this.permRepo.create({ action: 'MANAGE_OWN_BUSINESS' }));
        let pView = await this.permRepo.findOne({ where: { action: 'VIEW_ALL_BUSINESSES' } });
        if (!pView)
            pView = await this.permRepo.save(this.permRepo.create({ action: 'VIEW_ALL_BUSINESSES' }));
        let roleAdmin = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
        if (!roleAdmin)
            roleAdmin = await this.roleRepo.save(this.roleRepo.create({ name: 'ADMIN', permissions: [pManage, pView] }));
        let roleUser = await this.roleRepo.findOne({ where: { name: 'NORMAL_USER' } });
        if (!roleUser)
            roleUser = await this.roleRepo.save(this.roleRepo.create({ name: 'NORMAL_USER', permissions: [pView] }));
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('parola123', salt);
        const adminEmail = 'admin@patiserie.ro';
        if (!(await this.userRepo.findOne({ where: { email: adminEmail } }))) {
            await this.userRepo.save(this.userRepo.create({
                firstName: 'Ana', lastName: 'Proprietar', email: adminEmail,
                password: hashedPassword,
                businessName: 'Patiseria Anei', businessType: 'Patiserie', county: 'Cluj', role: roleAdmin
            }));
        }
        const userEmail = 'client@vizitator.ro';
        if (!(await this.userRepo.findOne({ where: { email: userEmail } }))) {
            await this.userRepo.save(this.userRepo.create({
                firstName: 'Ion', lastName: 'Client', email: userEmail,
                password: hashedPassword,
                businessName: 'N/A', businessType: 'Altele', county: 'Cluj', role: roleUser
            }));
        }
    }
    async register(registerDto) {
        const existingUser = await this.userRepo.findOne({ where: { email: registerDto.email } });
        if (existingUser)
            throw new common_1.ConflictException('Există deja un cont cu acest email.');
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
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Email sau parolă incorectă.');
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
    async verifyOtp(email, otp) {
        const storedOtp = this.otpStore.get(email);
        if (!storedOtp || storedOtp !== otp) {
            throw new common_1.UnauthorizedException('OTP Invalid sau expirat.');
        }
        const user = await this.userRepo.findOne({ where: { email } });
        this.otpStore.delete(email);
        return this._toResult(user);
    }
    _toResult(user) {
        const { password, products, orders, ...userWithoutPassword } = user;
        const payload = { sub: user.id, email: user.email, role: user.role?.name };
        const accessToken = this.jwtService.sign(payload);
        return { user: userWithoutPassword, accessToken };
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        return user ?? undefined;
    }
    async getAuditLogs() {
        return this.auditLogRepo.find({ order: { timestamp: 'DESC' }, take: 100 });
    }
    async getObservationList() {
        return this.obsListRepo.find({ order: { detectedAt: 'DESC' } });
    }
    async generatePasswordResetToken(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const token = Math.random().toString(36).substring(2, 15);
        this.resetTokens.set(token, email);
        console.log(`EMAIL to: ${email} | to reset: https://localhost:5173/reset-password?token=${token}`);
        return { message: 'Email sent with reset instructions' };
    }
    async resetPassword(token, newPassword) {
        const email = this.resetTokens.get(token);
        if (!email)
            throw new common_1.UnauthorizedException('Invalid or expired token');
        const user = await this.userRepo.findOne({ where: { email } });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await this.userRepo.save(user);
        this.resetTokens.delete(token);
        return { message: 'Password reset successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(4, (0, typeorm_1.InjectRepository)(observation_list_entity_1.ObservationList)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map