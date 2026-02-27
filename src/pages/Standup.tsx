import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  BoxBorderColor,
  BoxBackgroundColor,
  ButtonIcon,
  Text,
  TextColor,
  TextVariant,
  IconName,
  FontFamily,
} from '@metamask/design-system-react';

export const Standup: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);

  // Fetch available standup dates
  const fetchAvailableDates = async (): Promise<string[]> => {
    // This is a simple approach - we'll try to fetch a range of dates
    // In production, you might want to have an index file or API endpoint
    const dates: string[] = [];
    const today = new Date();

    // Check last 30 days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      try {
        const url = `${import.meta.env.BASE_URL}standups/${dateStr}.md`;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok && dateStr) {
          dates.push(dateStr);
        }
      } catch {
        // File doesn't exist, skip
      }
    }

    return dates.sort();
  };

  // Fetch specific standup by date
  const fetchStandup = async (dateStr: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${import.meta.env.BASE_URL}standups/${dateStr}.md`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Standup not found');
      }

      const content = await response.text();

      // Check if the response is actually markdown and not HTML
      if (
        content.trim().startsWith('<!DOCTYPE') ||
        content.trim().startsWith('<html')
      ) {
        throw new Error('Standup not found');
      }

      setMarkdownContent(content);

      // Fetch available dates and determine prev/next
      const availableDates = await fetchAvailableDates();
      const currentIndex = availableDates.indexOf(dateStr);

      if (currentIndex > 0) {
        setPrevDate(availableDates[currentIndex - 1] || null);
      } else {
        setPrevDate(null);
      }

      if (currentIndex < availableDates.length - 1) {
        setNextDate(availableDates[currentIndex + 1] || null);
      } else {
        setNextDate(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standup');
      setMarkdownContent('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchStandup(date);
    }
  }, [date]);

  if (loading) {
    return (
      <Box className="min-h-screen bg-background-default p-4">
        <Box className="max-w-4xl mx-auto">
          <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
            Loading...
          </Text>
        </Box>
      </Box>
    );
  }

  if (error || !markdownContent) {
    return (
      <Box className="min-h-screen bg-background-default p-4">
        <Box className="max-w-4xl mx-auto" gap={4}>
          <Link to="/" className="no-underline">
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              ariaLabel="Back to todos"
            />
          </Link>
          <Text variant={TextVariant.HeadingLg} color={TextColor.ErrorDefault}>
            {error || 'Standup not found'}
          </Text>
          <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
            No standup file found for {date}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-background-default p-4 md:p-6">
      <Box className="max-w-4xl mx-auto flex flex-col gap-4" gap={6}>
        {/* Header with back button and pagination */}
        <Box className="flex items-center justify-between flex-wrap gap-4">
          <Box className="flex items-center gap-3">
            <Link to="/" className="no-underline">
              <ButtonIcon
                iconName={IconName.ArrowLeft}
                ariaLabel="Back to todos"
              />
            </Link>
            <Text
              variant={TextVariant.HeadingLg}
              fontFamily={FontFamily.Accent}
              color={TextColor.TextDefault}
            >
              Standup
            </Text>
          </Box>

          {/* Pagination Navigation */}
          <Box className="flex items-center gap-1">
            <Text
              variant={TextVariant.BodyMd}
              color={TextColor.TextMuted}
              className="px-2"
            >
              {date}
            </Text>
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              ariaLabel="Previous standup"
              disabled={!prevDate}
              onClick={() => prevDate && navigate(`/standup/${prevDate}`)}
            />
            <ButtonIcon
              iconName={IconName.ArrowRight}
              ariaLabel="Next standup"
              disabled={!nextDate}
              onClick={() => nextDate && navigate(`/standup/${nextDate}`)}
            />
          </Box>
        </Box>

        {/* Markdown Content */}
        <Box
          borderColor={BoxBorderColor.BorderMuted}
          borderWidth={1}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          padding={4}
          className="rounded-lg overflow-auto"
        >
          <pre className="font-mono text-sm text-default whitespace-pre-wrap">
            <code>{markdownContent}</code>
          </pre>
        </Box>
      </Box>
    </Box>
  );
};
