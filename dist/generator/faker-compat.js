"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFaker = getFaker;
exports.fakerSync = fakerSync;
exports.initFaker = initFaker;
let _faker = null;
async function getFaker() {
    if (!_faker) {
        const mod = await Promise.resolve().then(() => require('@faker-js/faker'));
        _faker = mod.faker;
    }
    return _faker;
}
function fakerSync() {
    if (!_faker)
        throw new Error('Call initFaker() before fakerSync()');
    return _faker;
}
async function initFaker() {
    return getFaker();
}
//# sourceMappingURL=faker-compat.js.map