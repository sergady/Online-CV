import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { parse, stringify } from 'yaml';
import { locales, localePath, displayDate } from '../src/lib/content.ts';

test('English is the root language, and translations have separate URLs', () => {
  assert.equal(localePath('en'), '/Online-CV/');
  assert.equal(localePath('es'), '/Online-CV/es/');
  assert.equal(localePath('fr'), '/Online-CV/fr/');
});
test('Year-only dates remain exact and month dates localize in UTC', () => {
  assert.equal(displayDate('2020', 'fr'), '2020');
  assert.match(displayDate('2020-01', 'en'), /Jan.*2020/);
});
test('All three language versions load together', () => {
  assert.deepEqual(Object.keys(locales), ['en', 'es', 'fr']);
});
function validateChangedContent(change) {
  const temporary = mkdtempSync(resolve('.content-test-'));
  try {
    cpSync('content', `${temporary}/content`, { recursive: true });
    const profilePath = `${temporary}/content/profile.yaml`;
    const fixture = parse(readFileSync(profilePath, 'utf8'));
    Object.assign(fixture, {
      publishReady: false,
      experience: [],
      degrees: [],
    });
    writeFileSync(profilePath, stringify(fixture));
    for (const lang of ['en', 'es', 'fr']) {
      const path = `${temporary}/content/locales/${lang}.yaml`;
      const translation = parse(readFileSync(path, 'utf8'));
      Object.assign(translation, {
        summary: '',
        skills: [],
        experience: {},
        degrees: {},
      });
      writeFileSync(path, stringify(translation));
    }
    change(temporary);
    return spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `await import(${JSON.stringify(resolve('src/lib/content.ts'))})`,
      ],
      { cwd: temporary, encoding: 'utf8' },
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
test('Invalid date and missing translation ID fail with the source filename', () => {
  const result = validateChangedContent((dir) => {
    const path = `${dir}/content/profile.yaml`;
    writeFileSync(
      path,
      readFileSync(path, 'utf8').replace(
        'experience: []',
        'experience:\n  - id: role\n    company: Example\n    start: "2020-13"\n    end: null',
      ),
    );
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /content\/profile.yaml/);
});
test('Unknown translation IDs fail instead of being silently ignored', () => {
  const result = validateChangedContent((dir) => {
    const path = `${dir}/content/locales/fr.yaml`;
    writeFileSync(
      path,
      readFileSync(path, 'utf8').replace(
        'experience: {}',
        'experience:\n  unknown:\n    role: Engineer\n    achievements: ["Example"]',
      ),
    );
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /fr.yaml: experience IDs/);
});
test('Publication readiness cannot bypass missing career content', () => {
  const result = validateChangedContent((dir) => {
    const path = `${dir}/content/profile.yaml`;
    writeFileSync(
      path,
      readFileSync(path, 'utf8').replace(
        'publishReady: false',
        'publishReady: true',
      ),
    );
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required before publication/);
});
