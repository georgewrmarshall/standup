import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  BoxAlignItems,
  BoxBorderColor,
  BoxBackgroundColor,
  BoxJustifyContent,
  ButtonIcon,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { MarkdownText } from '../components/MarkdownText';
import { parseStandupFile, ParsedStandup } from '../utils/standupParser';

export const Standup: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [standup, setStandup] = useState<ParsedStandup | null>(null);
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
        if (response.ok) {
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
      if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
        throw new Error('Standup not found');
      }

      const parsed = parseStandupFile(content);
      setStandup(parsed);

      // Fetch available dates and determine prev/next
      const availableDates = await fetchAvailableDates();
      const currentIndex = availableDates.indexOf(dateStr);

      if (currentIndex > 0) {
        setPrevDate(availableDates[currentIndex - 1]);
      } else {
        setPrevDate(null);
      }

      if (currentIndex < availableDates.length - 1) {
        setNextDate(availableDates[currentIndex + 1]);
      } else {
        setNextDate(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standup');
      setStandup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchStandup(date);
    }
  }, [date]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (error || !standup) {
    return (
      <Box className="min-h-screen bg-background-default p-4">
        <Box className="max-w-4xl mx-auto" gap={4}>
          <Link to="/" className="no-underline">
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              ariaLabel="Back to todos"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Md}
            />
          </Link>
          <Text variant={TextVariant.HeadingLg} color={TextColor.Error}>
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
      <Box className="max-w-4xl mx-auto" gap={6}>
        {/* Header with back button */}
        <Box
          display="flex"
          alignItems={BoxAlignItems.Center}
          justifyContent={BoxJustifyContent.SpaceBetween}
          className="flex-wrap gap-4"
        >
          <Box display="flex" alignItems={BoxAlignItems.Center} gap={3}>
            <Link to="/" className="no-underline">
              <ButtonIcon
                iconName={IconName.ArrowLeft}
                ariaLabel="Back to todos"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Md}
              />
            </Link>
            <Box gap={1}>
              <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
                Standup
              </Text>
              <Box
                paddingVertical={1}
                paddingHorizontal={3}
                backgroundColor={BoxBackgroundColor.InfoMuted}
                borderColor={BoxBorderColor.InfoDefault}
                borderWidth={1}
                className="rounded-md inline-block"
              >
                <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                  📅 {formatDate(date || '')}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Standup Content */}
        <Box
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          borderColor={BoxBorderColor.BorderMuted}
          borderWidth={1}
          className="rounded-lg p-6"
          gap={6}
        >
          {/* Yesterday Section */}
          {standup.yesterday.length > 0 && (
            <Box gap={3}>
              <Text variant={TextVariant.HeadingMd} color={TextColor.TextDefault}>
                Yesterday
              </Text>
              <Box gap={2} className="pl-4">
                {standup.yesterday.map((task, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems={BoxAlignItems.FlexStart}
                    gap={2}
                  >
                    <Icon
                      name={task.completed ? IconName.CheckBold : IconName.Close}
                      size={IconSize.Sm}
                      color={task.completed ? TextColor.SuccessDefault : TextColor.ErrorDefault}
                      className="mt-1 flex-shrink-0"
                    />
                    <MarkdownText
                      text={task.text}
                      className="flex-1"
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Today Section */}
          {standup.today.length > 0 && (
            <Box gap={3}>
              <Text variant={TextVariant.HeadingMd} color={TextColor.TextDefault}>
                Today
              </Text>
              <Box gap={2} className="pl-4">
                {standup.today.map((task, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems={BoxAlignItems.FlexStart}
                    gap={2}
                  >
                    <Icon
                      name={task.completed ? IconName.CheckBold : IconName.Close}
                      size={IconSize.Sm}
                      color={task.completed ? TextColor.SuccessDefault : TextColor.ErrorDefault}
                      className="mt-1 flex-shrink-0"
                    />
                    <MarkdownText
                      text={task.text}
                      className="flex-1"
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Blockers Section */}
          {standup.blockers.length > 0 && (
            <Box gap={3}>
              <Text variant={TextVariant.HeadingMd} color={TextColor.TextDefault}>
                Blockers
              </Text>
              <Box gap={2} className="pl-4">
                {standup.blockers.map((blocker, index) => (
                  <Box key={index} display="flex" alignItems={BoxAlignItems.FlexStart} gap={2}>
                    <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
                      •
                    </Text>
                    <MarkdownText
                      text={blocker}
                      className="flex-1"
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Backlog Section */}
          {standup.backlog.length > 0 && (
            <Box gap={3}>
              <Text variant={TextVariant.HeadingMd} color={TextColor.TextDefault}>
                Backlog
              </Text>
              <Box gap={2} className="pl-4">
                {standup.backlog.map((item, index) => (
                  <Box key={index} display="flex" alignItems={BoxAlignItems.FlexStart} gap={2}>
                    <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
                      •
                    </Text>
                    <MarkdownText
                      text={item}
                      className="flex-1"
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Pagination Navigation */}
        <Box
          display="flex"
          alignItems={BoxAlignItems.Center}
          justifyContent={BoxJustifyContent.SpaceBetween}
          className="pt-4 border-t border-muted"
        >
          <ButtonIcon
            iconName={IconName.ArrowLeft}
            ariaLabel="Previous standup"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Md}
            disabled={!prevDate}
            onClick={() => prevDate && navigate(`/standup/${prevDate}`)}
          />

          <Text variant={TextVariant.BodyMd} color={TextColor.TextMuted}>
            {date}
          </Text>

          <ButtonIcon
            iconName={IconName.ArrowRight}
            ariaLabel="Next standup"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Md}
            disabled={!nextDate}
            onClick={() => nextDate && navigate(`/standup/${nextDate}`)}
          />
        </Box>
      </Box>
    </Box>
  );
};
