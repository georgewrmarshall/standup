import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DATE_FILENAME_REGEX = /^(\d{4}-\d{2}-\d{2})\.md$/;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.status !== 0 && !options.allowFailure) {
    const stderr = options.capture ? (result.stderr || '').trim() : '';
    if (stderr) {
      console.error(stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result;
}

function getRepoRoot() {
  const result = run('git', ['rev-parse', '--show-toplevel'], { capture: true });
  return result.stdout.trim();
}

function getLatestStandupFile(standupsDir) {
  const entries = fs
    .readdirSync(standupsDir)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(standupsDir, filename);
      const stat = fs.statSync(filePath);
      return { filename, mtimeMs: stat.mtimeMs };
    });

  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => {
    if (b.mtimeMs !== a.mtimeMs) {
      return b.mtimeMs - a.mtimeMs;
    }
    return b.filename.localeCompare(a.filename);
  });

  return entries[0].filename;
}

function main() {
  const repoRoot = getRepoRoot();
  process.chdir(repoRoot);

  const standupsDir = path.join(repoRoot, 'public', 'standups');
  if (!fs.existsSync(standupsDir)) {
    console.error(`Directory not found: ${standupsDir}`);
    process.exit(1);
  }

  const latestFilename = getLatestStandupFile(standupsDir);
  if (!latestFilename) {
    console.error('No standup markdown files found in public/standups');
    process.exit(1);
  }

  const relativePath = path.join('public', 'standups', latestFilename);
  const filenameMatch = latestFilename.match(DATE_FILENAME_REGEX);
  const standupDate = filenameMatch ? filenameMatch[1] : latestFilename.replace(/\.md$/, '');
  const commitMessage = `chore: standup ${standupDate}`;

  const statusResult = run('git', ['status', '--porcelain', '--', relativePath], { capture: true });
  if (!statusResult.stdout.trim()) {
    console.log(`No changes to publish for ${relativePath}`);
    return;
  }

  console.log(`Publishing ${relativePath}`);
  run('git', ['add', '--', relativePath]);
  run('git', ['commit', '-m', commitMessage]);
  run('git', ['push']);
  console.log(`Done: ${commitMessage}`);
}

main();
