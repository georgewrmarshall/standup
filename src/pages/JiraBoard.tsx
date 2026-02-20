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

interface JiraTicket {
  key: string;
  summary: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  assignee: string;
  sprint?: string;
  linkedPRs?: string[];
}

const JiraBoard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from Atlassian MCP
  const mockTickets: JiraTicket[] = [
    {
      key: 'DSYS-456',
      summary: 'Update Button component to support new design tokens',
      status: 'In Progress',
      priority: 'High',
      assignee: 'George Marshall',
      sprint: 'Sprint 42',
      linkedPRs: ['#123'],
    },
    {
      key: 'DSYS-457',
      summary: 'Add accessibility improvements to Modal component',
      status: 'To Do',
      priority: 'Medium',
      assignee: 'George Marshall',
      sprint: 'Sprint 42',
    },
    {
      key: 'DSYS-458',
      summary: 'Document new Text component variants',
      status: 'In Review',
      priority: 'Low',
      assignee: 'George Marshall',
      sprint: 'Sprint 42',
      linkedPRs: ['#456'],
    },
    {
      key: 'DSYS-459',
      summary: 'Performance audit of design system components',
      status: 'To Do',
      priority: 'High',
      assignee: 'George Marshall',
      sprint: 'Sprint 43',
    },
  ];

  const getPriorityBadge = (priority: JiraTicket['priority']) => {
    const variants = {
      Highest: {
        bg: BoxBackgroundColor.ErrorMuted,
        color: TextColor.ErrorDefault,
        icon: IconName.Arrow2Up,
      },
      High: {
        bg: BoxBackgroundColor.WarningMuted,
        color: TextColor.WarningDefault,
        icon: IconName.Arrow2Up,
      },
      Medium: {
        bg: BoxBackgroundColor.Default,
        color: TextColor.TextDefault,
        icon: IconName.Arrow2Right,
      },
      Low: {
        bg: BoxBackgroundColor.InfoMuted,
        color: TextColor.InfoDefault,
        icon: IconName.Arrow2Down,
      },
    };
    const config = variants[priority];
    return (
      <Box
        padding={1}
        backgroundColor={config.bg}
        className="px-2 py-1 rounded inline-flex items-center gap-1"
      >
        <Icon name={config.icon} size={IconSize.Xs} color={config.color} />
        <Text variant={TextVariant.BodyXs} color={config.color}>
          {priority}
        </Text>
      </Box>
    );
  };

  const getStatusColor = (status: JiraTicket['status']) => {
    switch (status) {
      case 'To Do':
        return 'bg-default';
      case 'In Progress':
        return 'bg-info-muted';
      case 'In Review':
        return 'bg-warning-muted';
      case 'Done':
        return 'bg-success-muted';
      default:
        return 'bg-default';
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    // In real app, sync with Jira API here
    setTimeout(() => setIsLoading(false), 1000);
  };

  const columns: JiraTicket['status'][] = [
    'To Do',
    'In Progress',
    'In Review',
    'Done',
  ];

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
            Jira Board - DSYS Project
          </Text>
          <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
            Sprint 42 - 5 days remaining
          </Text>
        </Box>
        <Box gap={2} className="flex">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Sm}
            startIconName={IconName.Add}
          >
            Create Ticket
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Sm}
            startIconName={IconName.Refresh}
            onClick={handleSync}
            isLoading={isLoading}
          >
            Sync
          </Button>
        </Box>
      </Box>

      {/* Sprint Summary */}
      <Box gap={4} className="grid grid-cols-1 md:grid-cols-4" marginBottom={6}>
        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Total Tickets
          </Text>
          <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
            {mockTickets.length}
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.InfoMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            In Progress
          </Text>
          <Text variant={TextVariant.HeadingLg} color={TextColor.InfoDefault}>
            {mockTickets.filter((t) => t.status === 'In Progress').length}
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.WarningMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            In Review
          </Text>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.WarningDefault}
          >
            {mockTickets.filter((t) => t.status === 'In Review').length}
          </Text>
        </Box>

        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.SuccessMuted}
          className="rounded-lg"
        >
          <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
            Completed
          </Text>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.SuccessDefault}
          >
            {mockTickets.filter((t) => t.status === 'Done').length}
          </Text>
        </Box>
      </Box>

      {/* Kanban Board */}
      <Box gap={4} className="grid grid-cols-1 md:grid-cols-4">
        {columns.map((column) => (
          <Box key={column}>
            <Box
              padding={3}
              className={`${getStatusColor(column)} rounded-md`}
              marginBottom={3}
            >
              <Text
                variant={TextVariant.HeadingSm}
                color={TextColor.TextDefault}
              >
                {column}
              </Text>
              <Text
                variant={TextVariant.BodySm}
                color={TextColor.TextAlternative}
              >
                {mockTickets.filter((t) => t.status === column).length} tickets
              </Text>
            </Box>

            <Box
              flexDirection={BoxFlexDirection.Column}
              gap={3}
              className="flex"
            >
              {mockTickets
                .filter((ticket) => ticket.status === column)
                .map((ticket) => (
                  <Box
                    key={ticket.key}
                    padding={3}
                    backgroundColor={BoxBackgroundColor.BackgroundDefault}
                    className="hover:shadow-md transition-shadow cursor-pointer rounded-md"
                  >
                    <Box
                      justifyContent={BoxJustifyContent.Between}
                      alignItems={BoxAlignItems.Start}
                      marginBottom={2}
                      className="flex"
                    >
                      <Text
                        variant={TextVariant.BodySm}
                        color={TextColor.PrimaryDefault}
                      >
                        {ticket.key}
                      </Text>
                      {getPriorityBadge(ticket.priority)}
                    </Box>

                    <Text
                      variant={TextVariant.BodyMd}
                      color={TextColor.TextDefault}
                      className="mb-2"
                    >
                      {ticket.summary}
                    </Text>

                    {ticket.linkedPRs && ticket.linkedPRs.length > 0 && (
                      <Box gap={1} marginBottom={2} className="flex">
                        {ticket.linkedPRs.map((pr) => (
                          <Box
                            key={pr}
                            padding={1}
                            backgroundColor={BoxBackgroundColor.InfoMuted}
                            className="px-2 py-1 rounded"
                          >
                            <Text
                              variant={TextVariant.BodyXs}
                              color={TextColor.InfoDefault}
                            >
                              PR {pr}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box
                      alignItems={BoxAlignItems.Center}
                      gap={2}
                      className="flex"
                    >
                      <Icon name={IconName.UserCircle} size={IconSize.Xs} />
                      <Text
                        variant={TextVariant.BodyXs}
                        color={TextColor.TextAlternative}
                      >
                        {ticket.assignee}
                      </Text>
                      {ticket.sprint && (
                        <>
                          <Text
                            variant={TextVariant.BodyXs}
                            color={TextColor.TextMuted}
                          >
                            •
                          </Text>
                          <Text
                            variant={TextVariant.BodyXs}
                            color={TextColor.TextAlternative}
                          >
                            {ticket.sprint}
                          </Text>
                        </>
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default JiraBoard;
