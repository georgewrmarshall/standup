import React, { useState } from 'react';
import {
  Box,
  BoxAlignItems,
  BoxBackgroundColor,
  BoxFlexDirection,
  BoxJustifyContent,
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { format } from 'date-fns';

const StandupGenerator: React.FC = () => {
  const [standupMessage, setStandupMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateStandup = async () => {
    setIsGenerating(true);

    // In real app, this would use the skills and MCP to generate actual standup
    setTimeout(() => {
      const message = `Team Standup Reply:

**Yesterday** ✅
- Completed Button component migration for new design tokens
- Merged PR #123: Add new Button variant (metamask-design-system)
- Reviewed and approved 3 PRs from team members
- Updated DSYS-455 documentation

**Today** 💻
- Continue work on DSYS-456: Update Button component props
- Review pending PR #456 that has changes requested
- Start DSYS-457: Add accessibility improvements to Modal
- Sync with design team on new component requirements
- Update sprint board with progress

**Blockers** 🚫
- PR #456: Need clarification on design requirement from @designteam
- Waiting for API endpoint confirmation for DSYS-458

[Jira Board](https://consensyssoftware.atlassian.net/jira/software/c/projects/DSYS)`;

      setStandupMessage(message);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(standupMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const saveStandup = () => {
    // In real app, save to file system
    const date = format(new Date(), 'yyyy-MM-dd');
    const blob = new Blob([standupMessage], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standup-${date}.md`;
    a.click();
  };

  return (
    <Box padding={6} className="w-full">
      {/* Header */}
      <Box marginBottom={6}>
        <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
          Standup Generator
        </Text>
        <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
          Generate your daily standup message for Slack
        </Text>
      </Box>

      {/* Instructions */}
      <Box
        padding={4}
        backgroundColor={BoxBackgroundColor.InfoMuted}
        marginBottom={6}
        className="rounded-lg"
      >
        <Box alignItems={BoxAlignItems.Start} gap={3} className="flex">
          <Icon
            name={IconName.Info}
            size={IconSize.Md}
            className="text-info-default mt-1"
          />
          <Box>
            <Text
              variant={TextVariant.BodyMdMedium}
              color={TextColor.InfoDefault}
              className="mb-2"
            >
              How it works
            </Text>
            <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
              This tool automatically gathers information from your todos,
              GitHub PRs, and Jira tickets to generate a formatted standup
              message following the team template.
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Generate Button */}
      <Box
        justifyContent={BoxJustifyContent.Center}
        marginBottom={6}
        className="flex"
      >
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          startIconName={IconName.MessageQuestion}
          onClick={generateStandup}
          isLoading={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Standup Message'}
        </Button>
      </Box>

      {/* Generated Message */}
      {standupMessage && (
        <Box
          padding={4}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          className="rounded-lg"
        >
          <Box
            justifyContent={BoxJustifyContent.Between}
            alignItems={BoxAlignItems.Center}
            marginBottom={4}
            className="flex"
          >
            <Text variant={TextVariant.HeadingSm} color={TextColor.TextDefault}>
              Generated Standup - {format(new Date(), 'MMMM d, yyyy')}
            </Text>
            <Box gap={2} className="flex">
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Sm}
                startIconName={IconName.Copy}
                onClick={copyToClipboard}
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Sm}
                startIconName={IconName.Save}
                onClick={saveStandup}
              >
                Save
              </Button>
            </Box>
          </Box>

          <Box
            padding={4}
            backgroundColor={BoxBackgroundColor.BackgroundDefault}
            className="font-mono rounded-md"
          >
            <pre className="whitespace-pre-wrap text-sm text-default">
              {standupMessage}
            </pre>
          </Box>

          {/* Quick Stats */}
          <Box gap={4} className="grid grid-cols-3" marginTop={4}>
            <Box
              padding={3}
              backgroundColor={BoxBackgroundColor.SuccessMuted}
              className="text-center rounded-md"
            >
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
              >
                Completed
              </Text>
              <Text
                variant={TextVariant.HeadingSm}
                color={TextColor.SuccessDefault}
              >
                4 items
              </Text>
            </Box>

            <Box
              padding={3}
              backgroundColor={BoxBackgroundColor.InfoMuted}
              className="text-center rounded-md"
            >
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
              >
                Planned
              </Text>
              <Text
                variant={TextVariant.HeadingSm}
                color={TextColor.InfoDefault}
              >
                5 items
              </Text>
            </Box>

            <Box
              padding={3}
              backgroundColor={BoxBackgroundColor.WarningMuted}
              className="text-center rounded-md"
            >
              <Text
                variant={TextVariant.BodyXs}
                color={TextColor.TextAlternative}
              >
                Blockers
              </Text>
              <Text
                variant={TextVariant.HeadingSm}
                color={TextColor.WarningDefault}
              >
                2 items
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Tips */}
      <Box marginTop={6}>
        <Text
          variant={TextVariant.HeadingSm}
          color={TextColor.TextDefault}
          className="mb-2"
        >
          Tips for Better Standups
        </Text>
        <Box flexDirection={BoxFlexDirection.Column} gap={3} className="flex">
          <Box
            padding={3}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            className="rounded-md"
          >
            <Box alignItems={BoxAlignItems.Start} gap={2} className="flex">
              <Icon
                name={IconName.CheckBold}
                size={IconSize.Xs}
                className="text-success-default mt-1"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Keep your todos updated throughout the day for accurate standup
                generation
              </Text>
            </Box>
          </Box>

          <Box
            padding={3}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            className="rounded-md"
          >
            <Box alignItems={BoxAlignItems.Start} gap={2} className="flex">
              <Icon
                name={IconName.CheckBold}
                size={IconSize.Xs}
                className="text-success-default mt-1"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Link your todos to PRs and Jira tickets for better context
              </Text>
            </Box>
          </Box>

          <Box
            padding={3}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            className="rounded-md"
          >
            <Box alignItems={BoxAlignItems.Start} gap={2} className="flex">
              <Icon
                name={IconName.CheckBold}
                size={IconSize.Xs}
                className="text-success-default mt-1"
              />
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                Review and customize the generated message before posting to
                Slack
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StandupGenerator;
