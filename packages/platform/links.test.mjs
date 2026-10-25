import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siblingAppUrl } from './links.mjs';
test('switches sibling hosts without forwarding private paths or tokens', () => {
  assert.equal(siblingAppUrl('teacher', {href:'https://crm.jenga.ru/students?token=secret#x'}), 'https://teacher.jenga.ru/');
  assert.equal(siblingAppUrl('crm', {href:'https://teacher.staging.example.org/'}), 'https://crm.staging.example.org/');
});
test('local apps and custom deployment overrides', () => {
  assert.equal(siblingAppUrl('teacher', {href:'http://localhost:5173/'}), 'http://localhost:5174/');
  assert.equal(siblingAppUrl('crm', {href:'https://unrelated.example/'}), null);
  assert.equal(siblingAppUrl('crm', {href:'https://teacher.jenga.ru/'}, 'javascript:alert(1)'), 'https://crm.jenga.ru/');
  assert.equal(siblingAppUrl('crm', {href:'https://preview.example/'}, 'https://crm.example.org'), 'https://crm.example.org/');
});
