import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/database/repository.js';

test('hashPassword produces a valid salt:derivedKey pair and changes on each call', () => {
  const password = 'SuperSecretPassword123';
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  assert.ok(hash1.includes(':'));
  assert.ok(hash2.includes(':'));
  // Different salts mean different outputs
  assert.notEqual(hash1, hash2);

  const [salt1, key1] = hash1.split(':');
  assert.equal(salt1.length, 32); // 16 bytes hex = 32 chars
  assert.equal(key1.length, 128); // 64 bytes hex = 128 chars
});

test('verifyPassword validates correct passwords and rejects wrong ones', () => {
  const password = 'MySecureDevOpsKey!';
  const hash = hashPassword(password);

  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword('WrongPassword', hash), false);
  assert.equal(verifyPassword('mysecuredevopskey!', hash), false);
  assert.equal(verifyPassword('', hash), false);
  assert.equal(verifyPassword(password, 'malformed'), false);
});
