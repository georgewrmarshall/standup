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
  const result = run('git', ['rev-parse', '--show-toplevel'], {
    capture: true,
  });
  return result.stdout.trim();
}

function getUnpublishedStandupFiles(standupsDir) {
  const relativeDirPath = path.relative(process.cwd(), standupsDir);
  const result = run('git', ['status', '--porcelain', '--', relativeDirPath], {
    capture: true,
  });
  const output = result.stdout.trim();

  if (!output) {
    return [];
  }

  const files = [];
  for (const line of output.split('\n')) {
    const filePath = line.slice(3).trim();
    const filename = path.basename(filePath);
    if (DATE_FILENAME_REGEX.test(filename)) {
      files.push(filename);
    }
  }

  // Sort ascending by date so commits are in chronological order
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function main() {
  const repoRoot = getRepoRoot();
  process.chdir(repoRoot);

  const standupsDir = path.join(repoRoot, 'public', 'standups');
  if (!fs.existsSync(standupsDir)) {
    console.error(`Directory not found: ${standupsDir}`);
    process.exit(1);
  }

  const unpublishedFiles = getUnpublishedStandupFiles(standupsDir);
  if (unpublishedFiles.length === 0) {
    console.log('No changes to publish');
    return;
  }

  for (const filename of unpublishedFiles) {
    const relativePath = path.join('public', 'standups', filename);
    const filenameMatch = filename.match(DATE_FILENAME_REGEX);
    const standupDate = filenameMatch
      ? filenameMatch[1]
      : filename.replace(/\.md$/, '');
    const commitMessage = `chore: standup ${standupDate}`;

    console.log(`Publishing ${relativePath}`);
    run('git', ['add', '--', relativePath]);
    run('git', ['commit', '-m', commitMessage]);
  }

  run('git', ['push']);
  console.log(`Done: published ${unpublishedFiles.length} standup(s)`);
}

main();
