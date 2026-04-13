import { describe, expect, it } from 'vitest';

import { parseGitHubUrl } from './urlParser';

describe('parseGitHubUrl', () => {
  it('converts a GitHub PR URL to a numbered markdown link', () => {
    const result = parseGitHubUrl(
      'See https://github.com/MetaMask/metamask-design-system/pull/1042 for details',
    );
    expect(result).toBe(
      'See [1042](https://github.com/MetaMask/metamask-design-system/pull/1042) for details',
    );
  });

  it('converts a GitHub issue URL to a numbered markdown link', () => {
    const result = parseGitHubUrl(
      'See https://github.com/org/repo/issues/99',
    );
    expect(result).toBe('See [99](https://github.com/org/repo/issues/99)');
  });

  it('converts a non-GitHub URL using the domain as link text', () => {
    const result = parseGitHubUrl('Check https://example.com/path for details');
    expect(result).toBe(
      'Check [example.com](https://example.com/path) for details',
    );
  });

  it('removes www. prefix from domain in non-GitHub links', () => {
    const result = parseGitHubUrl('Visit https://www.example.com/page');
    expect(result).toBe('Visit [example.com](https://www.example.com/page)');
  });

  it('does not double-convert a URL already wrapped in a markdown link', () => {
    const input = 'See [example.com](https://example.com/page)';
    expect(parseGitHubUrl(input)).toBe(input);
  });

  it('handles multiple URLs of different types in the same string', () => {
    const result = parseGitHubUrl(
      'PR https://github.com/org/repo/pull/1 and docs https://example.com',
    );
    expect(result).toBe(
      'PR [1](https://github.com/org/repo/pull/1) and docs [example.com](https://example.com)',
    );
  });

  it('returns the raw URL when URL parsing throws', () => {
    // An unclosed IPv6 bracket causes new URL() to throw
    const result = parseGitHubUrl('See https://[invalid-ipv6 for details');
    expect(result).toBe('See https://[invalid-ipv6 for details');
  });

  it('returns text unchanged when no URLs are present', () => {
    expect(parseGitHubUrl('No URLs here')).toBe('No URLs here');
  });
});
