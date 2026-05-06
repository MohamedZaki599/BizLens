#!/usr/bin/env node
/**
 * Workspace fix-up for Prisma 5.x + npm workspaces.
 *
 * Prisma's generator checks that `@prisma/client` lives "near" the `prisma`
 * CLI (specifically inside the same `node_modules`). With npm workspaces it
 * gets hoisted to the repo root, so Prisma fails the check and refuses to
 * generate. We mirror it back into `server/node_modules/@prisma/client` via a
 * symlink so generate works without copying files.
 *
 * This script is idempotent and safe to run on every install.
 */

const fs = require('node:fs');
const path = require('node:path');

const here = path.resolve(__dirname, '..');
const localPrismaDir = path.join(here, 'node_modules', '@prisma');

const candidates = [
  // npm workspaces typically hoist to the repo root.
  path.resolve(here, '..', 'node_modules', '@prisma'),
];

const tryLink = () => {
  const prismaScopeSource = path.resolve(here, '..', 'node_modules', '@prisma');
  const dotPrismaSource = path.resolve(here, '..', 'node_modules', '.prisma');

  const nodeModulesDir = path.join(here, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
  }

  const link = (source, targetName) => {
    const target = path.join(nodeModulesDir, targetName);
    if (!fs.existsSync(source)) {
      console.warn(`[link-prisma-client] ${source} not found; skipping link.`);
      return;
    }

    try {
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink() || stat.isFile()) {
        fs.unlinkSync(target);
      } else if (stat.isDirectory()) {
        fs.rmSync(target, { recursive: true });
      }
    } catch (_err) {
      // doesn't exist
    }

    fs.symlinkSync(source, target, 'dir');
    console.log(`[link-prisma-client] linked ${source} → ${target}`);
  };

  const prismaDir = path.join(nodeModulesDir, '@prisma');
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  link(path.join(prismaScopeSource, 'client'), path.join('@prisma', 'client'));
  link(dotPrismaSource, '.prisma');
};

try {
  tryLink();
} catch (err) {
  console.warn('[link-prisma-client] failed:', err && err.message ? err.message : err);
}
