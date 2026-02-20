import React, { useState } from 'react';
import {
  Box,
  Text,
  Button,
  ButtonVariant,
  ButtonSize,
  Icon,
  IconName,
  IconSize,
  BoxBackgroundColor,
  BoxFlexDirection,
  TextVariant,
  TextColor,
  BoxJustifyContent,
  BoxAlignItems,
} from '@metamask/design-system-react';

interface PR {
  id: number;
  title: string;
  repo: string;
  status: 'open' | 'merged' | 'closed';
  reviewStatus: 'approved' | 'changes_requested' | 'pending';
  author: string;
  updatedAt: string;
  url: string;
}

const PRStatus: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from GitHub API
  const mockPRs: PR[] = [
    {
      id: 123,
      title: 'Add new Button variant for secondary actions',
      repo: 'metamask-design-system',
      status: 'open',
      reviewStatus: 'approved',
      author: 'georgewrmarshall',
      updatedAt: '2 hours ago',
      url: 'https://github.com/MetaMask/metamask-design-system/pull/123',
    },
    {
      id: 456,
      title: 'Fix type definitions for Box component',
      repo: 'metamask-design-system',
      status: 'open',
      reviewStatus: 'changes_requested',
      author: 'georgewrmarshall',
      updatedAt: '1 day ago',
      url: 'https://github.com/MetaMask/metamask-design-system/pull/456',
    },
    {
      id: 789,
      title: 'Update confirmation flow UI',
      repo: 'metamask-extension',
      status: 'merged',
      reviewStatus: 'approved',
      author: 'georgewrmarshall',
      updatedAt: 'Yesterday',
      url: 'https://github.com/MetaMask/metamask-extension/pull/789',
    },
  ];

  const getStatusBadge = (status: PR['status']) => {
    const config = {
      open: {
        bg: BoxBackgroundColor.SuccessMuted,
        color: TextColor.SuccessDefault,
        text: 'Open',
      },
      merged: {
        bg: BoxBackgroundColor.InfoMuted,
        color: TextColor.InfoDefault,
        text: 'Merged',
      },
      closed: {
        bg: BoxBackgroundColor.Default,
        color: TextColor.TextDefault,
        text: 'Closed',
      },
    };
    const { bg, color, text } = config[status];
    return (
      <Box padding={1} backgroundColor={bg} className="px-2 py-1 rounded">
        <Text variant={TextVariant.BodyXs} color={color}>
          {text}
        </Text>
      </Box>
    );
  };

  const getReviewIcon = (reviewStatus: PR['reviewStatus']) => {
    switch (reviewStatus) {
      case 'approved':
        return (
          <Icon
            name={IconName.CheckBold}
            size={IconSize.Xs}
            className="text-success-default"
          />
        );
      case 'changes_requested':
        return (
          <Icon
            name={IconName.Danger}
            size={IconSize.Xs}
            className="text-error-default"
          />
        );
      case 'pending':
        return (
          <Icon
            name={IconName.Clock}
            size={IconSize.Xs}
            className="text-warning-default"
          />
        );
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // In real app, fetch from GitHub API here
    setTimeout(() => setIsLoading(false), 1000);
  };

  const repoGroups = mockPRs.reduce(
    (acc, pr) => {
      if (!acc[pr.repo]) acc[pr.repo] = [];
      acc[pr.repo].push(pr);
      return acc;
    },
    {} as Record<string, PR[]>,
  );

  return (
    <Box padding={6} className="w-full">
      {/* Header */}
      <Box
        justifyContent={BoxJustifyContent.Between}
        alignItems={BoxAlignItems.Center}
        marginBottom={6}
        className="flex"
      >
        <Box>
          <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
            Pull Request Status
          </Text>
          <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
            Track your PRs across MetaMask repositories
          </Text>
        </Box>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Sm}
          startIconName={IconName.Refresh}
          onClick={handleRefresh}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Stats */}
      <Box gap={4} className="grid grid-cols-1 md:grid-cols-4" marginBottom={6}>
        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.SuccessMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Open PRs
          </Text>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.SuccessDefault}
          >
            2
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.InfoMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Merged Today
          </Text>
          <Text variant={TextVariant.HeadingLg} color={TextColor.InfoDefault}>
            1
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.WarningMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Awaiting Review
          </Text>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.WarningDefault}
          >
            1
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.ErrorMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Changes Requested
          </Text>
          <Text variant={TextVariant.HeadingLg} color={TextColor.ErrorDefault}>
            1
          </Text>
        </Box>
      </Box>

      {/* PRs by Repository */}
      <Box flexDirection={BoxFlexDirection.Column} gap={4} className="flex">
        {Object.entries(repoGroups).map(([repo, prs]) => (
          <Box
            key={repo}
            padding={4}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            className="rounded-lg"
          >
            <Box
              alignItems={BoxAlignItems.Center}
              gap={2}
              marginBottom={4}
              className="flex"
            >
              <Icon name={IconName.CodeCircle} size={IconSize.Sm} />
              <Text
                variant={TextVariant.HeadingSm}
                color={TextColor.TextDefault}
              >
                {repo}
              </Text>
              <Text
                variant={TextVariant.BodySm}
                color={TextColor.TextAlternative}
                className="ml-auto"
              >
                {prs.length} PR{prs.length !== 1 ? 's' : ''}
              </Text>
            </Box>

            <Box
              flexDirection={BoxFlexDirection.Column}
              gap={3}
              className="flex"
            >
              {prs.map((pr) => (
                <Box
                  key={pr.id}
                  alignItems={BoxAlignItems.Center}
                  gap={3}
                  padding={3}
                  backgroundColor={BoxBackgroundColor.BackgroundDefault}
                  className="hover:bg-hover-light transition-colors flex rounded-md"
                >
                  <Box
                    alignItems={BoxAlignItems.Center}
                    gap={2}
                    className="flex"
                  >
                    {getReviewIcon(pr.reviewStatus)}
                    <Text
                      variant={TextVariant.BodyMdMedium}
                      color={TextColor.PrimaryDefault}
                    >
                      #{pr.id}
                    </Text>
                  </Box>

                  <Box className="flex-1">
                    <Text
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                    >
                      {pr.title}
                    </Text>
                    <Text
                      variant={TextVariant.BodySm}
                      color={TextColor.TextAlternative}
                    >
                      Updated {pr.updatedAt}
                    </Text>
                  </Box>

                  {getStatusBadge(pr.status)}

                  <Button
                    variant={ButtonVariant.Link}
                    size={ButtonSize.Sm}
                    endIconName={IconName.Export}
                    href={pr.url}
                    as="a"
                    target="_blank"
                  >
                    View
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Awaiting Your Review Section */}
      <Box marginTop={6}>
        <Text
          variant={TextVariant.HeadingSm}
          color={TextColor.TextDefault}
          marginBottom={4}
        >
          Awaiting Your Review
        </Text>
        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
            No PRs currently awaiting your review
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default PRStatus;
