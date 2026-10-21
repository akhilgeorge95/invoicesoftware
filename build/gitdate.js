/* build/gitdate.js — per-file last-modified dates derived from git.

   Shared by sitemap.js (for <lastmod>) and the generators (for schema
   dateModified). Both need the same answer, and the build clock is the wrong
   source: stamping every page with today's date on every build tells a crawler
   nothing about what actually changed, so it learns to ignore the field.

   A file that differs from HEAD gets today; everything else gets the date of
   the commit that last touched it. Outside a git checkout it falls back to
   filesystem mtimes. */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

let cached = null;

function index() {
  if (cached) return cached;

  const today = new Date().toISOString().slice(0, 10);
  const dirty = new Set();
  const map = new Map();

  try {
    const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    for (const line of status.split('\n')) {
      const p = line.slice(3).trim().replace(/^"|"$/g, '');
      if (p) dirty.add(p);
    }

    const log = execFileSync('git', ['log', '--pretty=format:%cI', '--name-only', '--no-renames'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    let when = null;
    for (const line of log.split('\n')) {
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) { when = line.slice(0, 10); continue; }
      if (when && line && !map.has(line)) map.set(line, when);   // log is newest-first
    }
  } catch (e) {
    // not a git checkout — mtimes it is
  }

  cached = {
    today,
    /* Latest date across several files. Use this for a GENERATED page: its
       dateModified must come from the sources it is built from, not from the
       output file. The output is written after this is computed, so git still
       sees the previous version and would report a stale date until the next
       build — keying off the source removes that ordering dependency. */
    latest(...files) {
      return files.map(f => this.get(f)).sort().pop();
    },
    get(f) {
      if (dirty.has(f)) return today;
      if (map.has(f)) return map.get(f);
      try { return fs.statSync(path.join(ROOT, f)).mtime.toISOString().slice(0, 10); }
      catch (e) { return today; }
    },
  };
  return cached;
}

module.exports = { index };
