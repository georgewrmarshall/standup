import React from 'react';
import {
  Box,
  Text,
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
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const stats = [
    {
      label: 'Open Todos',
      value: '12',
      icon: IconName.CheckBold,
      color: 'text-info-default',
    },
    {
      label: 'Bugs to Fix',
      value: '3',
      icon: IconName.Danger,
      color: 'text-warning-default',
    },
    {
      label: 'Completed Today',
      value: '4',
      icon: IconName.CheckBold,
      color: 'text-success-default',
    },
    {
      label: 'Blockers',
      value: '2',
      icon: IconName.Danger,
      color: 'text-error-default',
    },
  ];

  return (
    <Box padding={6} className="w-full">
      {/* Header */}
      <Box marginBottom={6}>
        <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
          Welcome back, George
        </Text>
        <Text
          variant={TextVariant.BodyMd}
          color={TextColor.TextAlternative}
          className="mt-1"
        >
          {today}
        </Text>
      </Box>

      {/* Stats Grid */}
      <Box
        gap={4}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        marginBottom={6}
      >
        {stats.map((stat) => (
          <Box
            key={stat.label}
            padding={4}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            className="rounded-lg"
          >
            <Box
              justifyContent={BoxJustifyContent.Between}
              alignItems={BoxAlignItems.Start}
              marginBottom={3}
              className="flex"
            >
              <Text
                variant={TextVariant.BodySm}
                color={TextColor.TextAlternative}
              >
                {stat.label}
              </Text>
              <Icon
                name={stat.icon}
                size={IconSize.Sm}
                className={stat.color}
              />
            </Box>
            <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
              {stat.value}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Quick Actions */}
      <Box marginBottom={6}>
        <Text
          variant={TextVariant.HeadingSm}
          color={TextColor.TextDefault}
          marginBottom={4}
        >
          Quick Actions
        </Text>
        <Box gap={4} className="grid grid-cols-1 md:grid-cols-3">
          <Box
            padding={4}
            backgroundColor={BoxBackgroundColor.PrimaryDefault}
            className="cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
          >
            <Box alignItems={BoxAlignItems.Center} gap={3} className="flex">
              <Icon
                name={IconName.Add}
                size={IconSize.Md}
                color={TextColor.PrimaryInverse}
              />
              <Text
                variant={TextVariant.BodyMdMedium}
                color={TextColor.PrimaryInverse}
              >
                Add Todo
              </Text>
            </Box>
          </Box>

          <Box
            padding={4}
            backgroundColor={BoxBackgroundColor.SuccessDefault}
            className="cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
          >
            <Box alignItems={BoxAlignItems.Center} gap={3} className="flex">
              <Icon
                name={IconName.MessageQuestion}
                size={IconSize.Md}
                color={TextColor.SuccessInverse}
              />
              <Text
                variant={TextVariant.BodyMdMedium}
                color={TextColor.SuccessInverse}
              >
                Generate Standup
              </Text>
            </Box>
          </Box>

          <Box
            padding={4}
            backgroundColor={BoxBackgroundColor.InfoDefault}
            className="cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
          >
            <Box alignItems={BoxAlignItems.Center} gap={3} className="flex">
              <Icon
                name={IconName.Refresh}
                size={IconSize.Md}
                color={TextColor.InfoInverse}
              />
              <Text
                variant={TextVariant.BodyMdMedium}
                color={TextColor.InfoInverse}
              >
                Sync All
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Text
          variant={TextVariant.HeadingSm}
          color={TextColor.TextDefault}
          marginBottom={4}
        >
          Recent Activity
        </Text>
        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          className="rounded-lg"
        >
          <Box flexDirection={BoxFlexDirection.Column} gap={3} className="flex">
            <Box alignItems={BoxAlignItems.Center} gap={2} className="flex">
              <Icon
                name={IconName.CheckBold}
                size={IconSize.Xs}
                className="text-success-default"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Completed: Design system release PR #921
              </Text>
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
                className="ml-auto"
              >
                Yesterday
              </Text>
            </Box>
            <Box alignItems={BoxAlignItems.Center} gap={2} className="flex">
              <Icon
                name={IconName.CodeCircle}
                size={IconSize.Xs}
                className="text-info-default"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Migration doc PR #924 ready for review
              </Text>
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
                className="ml-auto"
              >
                Yesterday
              </Text>
            </Box>
            <Box alignItems={BoxAlignItems.Center} gap={2} className="flex">
              <Icon
                name={IconName.Danger}
                size={IconSize.Xs}
                className="text-warning-default"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Reverted TextField placeholder alignment fix
              </Text>
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
                className="ml-auto"
              >
                Yesterday
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
