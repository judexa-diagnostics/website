// Form input checks (src/formCheck.js), same cases as the server. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tidy, textProblem, isEmail, isWebsite } from '../src/formCheck.js';

test('refuses control, invisible and markup characters', () => {
  for (const bad of ['Fix\x00Phone', 'Fix\x07Phone', 'Fix​Phone', 'Fix‮Phone', 'Fix﻿Phone',
    'FixPhone', '<b>Fix</b>', 'Fix `rm`', 'Fix {x}', 'Fix\\Phone']) {
    assert.match(textProblem(bad, 'Shop name'), /character/, JSON.stringify(bad));
  }
  assert.equal(textProblem('---', 'Shop name'), 'Enter the shop name.');
  assert.equal(textProblem('', 'Street 2', false), '');
  assert.equal(textProblem('---', 'Suite', false, 'Enter the suite, or leave it empty.'), 'Enter the suite, or leave it empty.');
});

test('ordinary names still work', () => {
  for (const ok of ["Joe's Phones & Repair", 'Café Móvil', 'Fix-It #4 (Downtown)', 'A+ Phones, Inc.', '手机店', 'Fix\r\nMy\tPhone']) {
    assert.equal(textProblem(ok, 'Shop name'), '', ok);
  }
  assert.equal(tidy(' Ｆｉｘ \n Phone '), 'Fix Phone');
});

test('emails', () => {
  for (const bad of ['a@b', 'a b@shop.test', 'a@shop.test\r\nBcc: x@y.test', '"a"@shop.test', 'a,b@shop.test',
    '<a@shop.test>', '.a@shop.test', 'a.@shop.test', 'a..b@shop.test', 'a@-shop.test', 'a@shop.t3st', 'pät@shop.test']) {
    assert.equal(isEmail(bad), false, bad);
  }
  for (const ok of ['pat@shop.test', "o'neil+shop@mail.shop.co", 'a_b-c.d%e@x-y.example']) assert.equal(isEmail(ok), true, ok);
});

test('websites', () => {
  for (const bad of ['javascript:alert(1)', 'ftp://shop.test', 'https://user:pw@shop.test', 'https://shop',
    'https://shop test.com', 'https://<x>.com', 'data:text/html,hi', 'https://-shop.test']) {
    assert.equal(isWebsite(bad), false, bad);
  }
  for (const ok of ['fixmyphone.test', 'http://shop.test:8080/about?x=1', 'https://www.shop.co']) assert.equal(isWebsite(ok), true, ok);
});
