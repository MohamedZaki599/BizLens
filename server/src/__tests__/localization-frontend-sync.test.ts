/**
 * Frontend Translation Key Inventory Test
 *
 * Reads the client-side i18n translation dictionaries and verifies that every
 * key in the backend LOCALIZATION_KEYS registry has a corresponding entry in
 * the frontend dictionary for both 'en' and 'ar' namespaces.
 *
 * This ensures the backend never emits a localization key that the frontend
 * cannot resolve — preventing untranslated UI strings in production.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LOCALIZATION_KEYS } from '../intelligence/localization/key-registry';

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Resolve the client i18n directory relative to the server test location.
 * Monorepo structure: project/server/src/__tests__/ → project/client/src/lib/i18n/
 */
function resolveClientI18nPath(...segments: string[]): string {
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  return path.join(projectRoot, 'client', 'src', 'lib', 'i18n', ...segments);
}

/**
 * Extract all translation keys from a TypeScript source file.
 * Scans for all quoted keys used as object property names: 'key.name': or "key.name":
 * This captures keys from all exported objects in the file.
 */
function extractAllKeysFromFile(filePath: string): Set<string> {
  const source = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set<string>();
  const keyPattern = /^\s*['"]([a-zA-Z0-9_.{}\-]+)['"]\s*:/gm;
  let match: RegExpExecArray | null;
  while ((match = keyPattern.exec(source)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/**
 * Parse import statements from core.ts to discover all spread translation modules.
 * Returns resolved file paths for each imported module.
 */
function discoverTranslationModules(coreSource: string, i18nDir: string): string[] {
  const modules: string[] = [];
  // Match: import { ... } from './path/to/module';
  const importPattern = /import\s*\{[^}]+\}\s*from\s*['"](\.[^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(coreSource)) !== null) {
    const importPath = match[1];
    // Resolve relative to i18n directory, add .ts extension if needed
    const resolved = path.resolve(i18nDir, importPath.endsWith('.ts') ? importPath : `${importPath}.ts`);
    if (fs.existsSync(resolved)) {
      modules.push(resolved);
    }
  }
  return modules;
}

/**
 * Extract keys from the inline `en` or `ar` object in core.ts.
 * These are defined as: const en: Dict = { ... };
 */
function extractInlineDictKeys(coreSource: string, varName: 'en' | 'ar'): Set<string> {
  const keys = new Set<string>();

  // Find the start of the object literal
  const startPattern = new RegExp(`const\\s+${varName}:\\s*Dict\\s*=\\s*\\{`);
  const startMatch = startPattern.exec(coreSource);
  if (!startMatch) return keys;

  const startIdx = startMatch.index + startMatch[0].length;

  // Find the matching closing brace by counting braces
  let depth = 1;
  let idx = startIdx;
  while (idx < coreSource.length && depth > 0) {
    if (coreSource[idx] === '{') depth++;
    if (coreSource[idx] === '}') depth--;
    idx++;
  }

  const objectBody = coreSource.slice(startIdx, idx - 1);

  // Extract keys from the object body (excluding spread operators)
  const lines = objectBody.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip spread operators and comments
    if (trimmed.startsWith('...') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      continue;
    }
    const keyMatch = /^['"]([a-zA-Z0-9_.{}\-]+)['"]\s*:/.exec(trimmed);
    if (keyMatch) {
      keys.add(keyMatch[1]);
    }
  }

  return keys;
}

/**
 * Identify which exports in a module are spread into the en vs ar dictionaries.
 * Parses the spread operators in core.ts to map export names to languages.
 */
function identifySpreadExports(
  coreSource: string,
  varName: 'en' | 'ar',
): string[] {
  const exports: string[] = [];
  const startPattern = new RegExp(`const\\s+${varName}:\\s*Dict\\s*=\\s*\\{`);
  const startMatch = startPattern.exec(coreSource);
  if (!startMatch) return exports;

  const startIdx = startMatch.index + startMatch[0].length;
  let depth = 1;
  let idx = startIdx;
  while (idx < coreSource.length && depth > 0) {
    if (coreSource[idx] === '{') depth++;
    if (coreSource[idx] === '}') depth--;
    idx++;
  }

  const objectBody = coreSource.slice(startIdx, idx - 1);
  const spreadPattern = /\.\.\.(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = spreadPattern.exec(objectBody)) !== null) {
    exports.push(match[1]);
  }
  return exports;
}

/**
 * Extract keys from a specific named export in a file.
 */
function extractKeysFromNamedExport(filePath: string, exportName: string): Set<string> {
  const source = fs.readFileSync(filePath, 'utf-8');
  // Find the export block
  const exportPattern = new RegExp(
    `export\\s+const\\s+${exportName}[^{]*\\{([\\s\\S]*?)\\}\\s*(as\\s+const)?\\s*;`,
  );
  const match = exportPattern.exec(source);
  if (!match) return new Set();

  const keys = new Set<string>();
  const keyPattern = /['"]([a-zA-Z0-9_.{}\-]+)['"]\s*:/g;
  let keyMatch: RegExpExecArray | null;
  while ((keyMatch = keyPattern.exec(match[1])) !== null) {
    keys.add(keyMatch[1]);
  }
  return keys;
}

/**
 * Find which file exports a given identifier by checking all module files.
 */
function findExportFile(exportName: string, moduleFiles: string[]): string | null {
  for (const filePath of moduleFiles) {
    const source = fs.readFileSync(filePath, 'utf-8');
    if (source.includes(`export const ${exportName}`) || source.includes(`export { ${exportName}`)) {
      return filePath;
    }
  }
  return null;
}

// ─── Test Setup ───────────────────────────────────────────────────────────

describe('Frontend Translation Key Inventory (LOCALIZATION_KEYS ↔ Frontend Sync)', () => {
  let enKeys: Set<string>;
  let arKeys: Set<string>;

  before(() => {
    const i18nDir = resolveClientI18nPath();
    const corePath = resolveClientI18nPath('core.ts');
    const coreSource = fs.readFileSync(corePath, 'utf-8');

    // Extract inline keys from en and ar objects
    const enInline = extractInlineDictKeys(coreSource, 'en');
    const arInline = extractInlineDictKeys(coreSource, 'ar');

    // Discover all imported translation modules
    const moduleFiles = discoverTranslationModules(coreSource, i18nDir);

    // Identify which exports are spread into en and ar
    const enSpreads = identifySpreadExports(coreSource, 'en');
    const arSpreads = identifySpreadExports(coreSource, 'ar');

    // Extract keys from each spread export
    const enFromSpreads = new Set<string>();
    for (const exportName of enSpreads) {
      const file = findExportFile(exportName, moduleFiles);
      if (file) {
        for (const key of extractKeysFromNamedExport(file, exportName)) {
          enFromSpreads.add(key);
        }
      }
    }

    const arFromSpreads = new Set<string>();
    for (const exportName of arSpreads) {
      const file = findExportFile(exportName, moduleFiles);
      if (file) {
        for (const key of extractKeysFromNamedExport(file, exportName)) {
          arFromSpreads.add(key);
        }
      }
    }

    // Combine all keys per language
    enKeys = new Set([...enInline, ...enFromSpreads]);
    arKeys = new Set([...arInline, ...arFromSpreads]);
  });

  it('frontend en dictionary contains keys (sanity check)', () => {
    assert.ok(enKeys.size > 0, 'Expected en dictionary to have keys but found none');
  });

  it('frontend ar dictionary contains keys (sanity check)', () => {
    assert.ok(arKeys.size > 0, 'Expected ar dictionary to have keys but found none');
  });

  describe('Every LOCALIZATION_KEYS entry exists in frontend en dictionary', () => {
    const registryKeys = Object.keys(LOCALIZATION_KEYS);

    it('all backend localization keys have en translations', () => {
      const missingFromEn: string[] = [];

      for (const key of registryKeys) {
        if (!enKeys.has(key)) {
          missingFromEn.push(key);
        }
      }

      assert.equal(
        missingFromEn.length,
        0,
        `${missingFromEn.length} LOCALIZATION_KEYS missing from frontend EN dictionary:\n` +
          missingFromEn.map((k) => `  - ${k}`).join('\n'),
      );
    });
  });

  describe('Every LOCALIZATION_KEYS entry exists in frontend ar dictionary', () => {
    const registryKeys = Object.keys(LOCALIZATION_KEYS);

    it('all backend localization keys have ar translations', () => {
      const missingFromAr: string[] = [];

      for (const key of registryKeys) {
        if (!arKeys.has(key)) {
          missingFromAr.push(key);
        }
      }

      assert.equal(
        missingFromAr.length,
        0,
        `${missingFromAr.length} LOCALIZATION_KEYS missing from frontend AR dictionary:\n` +
          missingFromAr.map((k) => `  - ${k}`).join('\n'),
      );
    });
  });

  describe('Reports missing keys by namespace', () => {
    const registryKeys = Object.keys(LOCALIZATION_KEYS);
    const namespaces = [...new Set(registryKeys.map((k) => k.split('.')[0]))];

    for (const ns of namespaces) {
      const nsKeys = registryKeys.filter((k) => k.startsWith(`${ns}.`));

      it(`namespace "${ns}" — all ${nsKeys.length} keys present in en`, () => {
        const missing = nsKeys.filter((k) => !enKeys.has(k));
        assert.equal(
          missing.length,
          0,
          `${missing.length} keys from "${ns}" namespace missing in EN:\n` +
            missing.map((k) => `  - ${k}`).join('\n'),
        );
      });

      it(`namespace "${ns}" — all ${nsKeys.length} keys present in ar`, () => {
        const missing = nsKeys.filter((k) => !arKeys.has(k));
        assert.equal(
          missing.length,
          0,
          `${missing.length} keys from "${ns}" namespace missing in AR:\n` +
            missing.map((k) => `  - ${k}`).join('\n'),
        );
      });
    }
  });
});
