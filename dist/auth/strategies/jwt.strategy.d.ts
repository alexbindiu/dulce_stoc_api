import { Strategy } from 'passport-jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface RequestUser {
    id: string;
    email: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): RequestUser;
}
export {};
