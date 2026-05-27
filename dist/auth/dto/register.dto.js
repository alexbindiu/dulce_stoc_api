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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = exports.BUSINESS_TYPES = void 0;
const class_validator_1 = require("class-validator");
exports.BUSINESS_TYPES = ['Patiserie', 'Cofetărie', 'Brutărie', 'Altele'];
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Prenumele este obligatoriu.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Prenumele trebuie să aibă minim 2 caractere.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numele este obligatoriu.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Numele trebuie să aibă minim 2 caractere.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalid.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Parola este obligatorie.' }),
    (0, class_validator_1.MinLength)(8, { message: 'Parola trebuie să aibă minim 8 caractere.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numele afacerii este obligatoriu.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "businessName", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.BUSINESS_TYPES, { message: 'Tip de afacere invalid.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "businessType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Județul este obligatoriu.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "county", void 0);
//# sourceMappingURL=register.dto.js.map