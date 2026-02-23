/**
 * Parse GitHub PR/issue URLs and convert to markdown link format
 *
 * @param text - The text to parse for GitHub URLs
 * @returns The text with GitHub URLs converted to markdown links
 *
 * @example
 * parseGitHubUrl('Check out https://github.com/MetaMask/metamask-design-system/pull/924')
 * // Returns: 'Check out [924](https://github.com/MetaMask/metamask-design-system/pull/924)'
 */
export const parseGitHubUrl = (text: string): string => {
  // Match GitHub PR and issue URLs
  // Supports both /issues and /issue
  const githubUrlRegex =
    /https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/(pull|issues?)\/(\d+)/g;

  return text.replace(githubUrlRegex, (_match, _owner, _repo, _type, number) => {
    return `[${number}](${_match})`;
  });
};
