import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';

function runRelease({ ready, ci, incomplete = false }) {
  const directory = mkdtempSync(resolve('.release-test-'));
  try {
    cpSync('content', `${directory}/content`, { recursive: true });
    const path = `${directory}/content/profile.yaml`;
    const profile = parse(readFileSync(path, 'utf8'));
    profile.publishReady = ready;
    writeFileSync(path, stringify(profile));
    if (incomplete) {
      const path = `${directory}/content/locales/en.yaml`;
      const locale = parse(readFileSync(path, 'utf8'));
      locale.summary = '';
      writeFileSync(path, stringify(locale));
    }
    return spawnSync(
      process.execPath,
      [resolve('scripts/validate-release.mjs'), ...(ci ? ['--ci'] : [])],
      { cwd: directory, encoding: 'utf8' },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('CI treats a valid draft as a successful build with deployment disabled', () => {
  const result = runRelease({ ready: false, ci: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'ready=false');
});
test('CI reports publication readiness for complete approved content', () => {
  const result = runRelease({ ready: true, ci: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'ready=true');
});
test('An explicit release check still rejects a draft', () => {
  const result = runRelease({ ready: false, ci: false });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Deployment disabled/);
});
test('CI rejects incomplete content even when publication is requested', () => {
  const result = runRelease({ ready: true, ci: true, incomplete: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required before publication/);
});
