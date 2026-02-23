import { Text, TextButton, TextColor, TextVariant } from '@metamask/design-system-react';

interface MarkdownTextProps {
  text: string;
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
}

/**
 * Renders text with markdown links as TextButton components
 * while maintaining MetaMask Design System styling
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({
  text,
  variant = TextVariant.BodyMd,
  color = TextColor.TextDefault,
  className = '',
}) => {
  // Parse markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the link as a TextButton with asChild to render as <a> tag
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <TextButton key={`link-${keyIndex++}`} asChild className="min-w-0">
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          {linkText}
        </a>
      </TextButton>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no links were found, just return the original text
  if (parts.length === 0) {
    parts.push(text);
  }

  return (
    <Text variant={variant} color={color} className={className}>
      {parts}
    </Text>
  );
};
