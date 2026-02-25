/**
 * Parse URLs and convert to markdown link format
 *
 * For GitHub PR/issue URLs, uses just the number as the link text
 * For other URLs, uses the domain name as the link text
 *
 * @param text - The text to parse for URLs
 * @returns The text with URLs converted to markdown links
 *
 * @example
 * parseGitHubUrl('Check out https://github.com/MetaMask/metamask-design-system/pull/924')
 * // Returns: 'Check out [924](https://github.com/MetaMask/metamask-design-system/pull/924)'
 *
 * parseGitHubUrl('See https://example.com for details')
 * // Returns: 'See [example.com](https://example.com) for details'
 */
export const parseGitHubUrl = (text: string): string => {
  // First, handle GitHub PR and issue URLs with number as link text
  // Supports both /issues and /issue
  const githubUrlRegex =
    /https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/(pull|issues?)\/(\d+)/g;

  let result = text.replace(githubUrlRegex, (_match, _owner, _repo, _type, number) => {
    return `[${number}](${_match})`;
  });

  // Then, handle any other HTTP/HTTPS URLs not already converted
  // Match URLs that aren't already part of a markdown link
  const urlRegex = /(?<!\]\()https?:\/\/[^\s\)]+/g;

  result = result.replace(urlRegex, (url) => {
    // Extract domain name for link text
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      return `[${domain}](${url})`;
    } catch {
      // If URL parsing fails, just use the URL as-is
      return url;
    }
  });

  return result;
};
