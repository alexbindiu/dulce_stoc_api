// Lazy wrapper so Jest (CommonJS) never has to directly import the ESM faker
// bundle at module evaluation time. Tests can mock this file instead.
let _faker: any = null;

export async function getFaker() {
  if (!_faker) {
    const mod = await import('@faker-js/faker');
    _faker = mod.faker;
  }
  return _faker;
}

// Sync version used at runtime (after bootstrap); throws if called before init
export function fakerSync(): any {
  if (!_faker) throw new Error('Call initFaker() before fakerSync()');
  return _faker;
}

export async function initFaker() {
  return getFaker();
}
