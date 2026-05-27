export declare const BUSINESS_TYPES: readonly ["Patiserie", "Cofetărie", "Brutărie", "Altele"];
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
    businessType: BusinessType;
    county: string;
}
