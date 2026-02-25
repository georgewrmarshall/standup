import { useState, useEffect } from 'react';
import {
  Box,
  BoxAlignItems,
  BoxJustifyContent,
  BoxBackgroundColor,
  BoxBorderColor,
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariant,
  Checkbox,
  Icon,
  IconName,
  IconSize,
  Text,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import {
  fetchLatestStandup,
  parseStandupFile,
  getStandupTasks,
  type StandupTask,
} from '../utils/standupParser';
import { logError } from '../utils/errors';

interface ImportFromStandupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: string[]) => Promise<void>;
}

export function ImportFromStandupDialog({
  isOpen,
  onClose,
  onImport,
}: ImportFromStandupDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [tasks, setTasks] = useState<StandupTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStandupData();
    }
  }, [isOpen]);

  const loadStandupData = async () => {
    setLoading(true);
    setError(null);
    setSelectedTaskIds(new Set());

    try {
      const standupData = await fetchLatestStandup();

      if (!standupData) {
        setError('No standup file found for today or yesterday');
        setLoading(false);
        return;
      }

      setFilename(standupData.filename);

      const parsed = parseStandupFile(standupData.content);
      const standupTasks = getStandupTasks(parsed);

      setTasks(standupTasks);

      // Pre-select all tasks from today by default
      const todayTaskIds = standupTasks
        .filter((task) => task.source === 'today')
        .map((task) => task.id);
      setSelectedTaskIds(new Set(todayTaskIds));

      setLoading(false);
    } catch (err) {
      logError('ImportFromStandupDialog: Failed to load standup data', err);
      setError('Failed to load standup file');
      setLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      // Deselect all
      setSelectedTaskIds(new Set());
    } else {
      // Select all
      setSelectedTaskIds(new Set(tasks.map((task) => task.id)));
    }
  };

  const handleImport = async () => {
    if (selectedTaskIds.size === 0) {
      return;
    }

    setImporting(true);
    try {
      const selectedTasks = tasks
        .filter((task) => selectedTaskIds.has(task.id))
        .map((task) => task.text);

      await onImport(selectedTasks);
      onClose();
    } catch (err) {
      logError('ImportFromStandupDialog: Failed to import', err);
      setError('Failed to import todos');
    } finally {
      setImporting(false);
    }
  };

  const yesterdayTasks = tasks.filter((task) => task.source === 'yesterday');
  const todayTasks = tasks.filter((task) => task.source === 'today');

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Box
        backgroundColor={BoxBackgroundColor.BackgroundDefault}
        className="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <Box
          padding={6}
          borderColor={BoxBorderColor.BorderMuted}
          className="flex items-center justify-between border-b"
        >
          <Box>
            <Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
              Load from Standup
            </Text>
            {filename && (
              <Box marginTop={1}>
                <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
                  Source: {filename}
                </Text>
              </Box>
            )}
          </Box>
          <ButtonIcon
            iconName={IconName.Close}
            ariaLabel="Close dialog"
            onClick={onClose}
            isDisabled={importing}
          />
        </Box>

        {/* Content */}
        <Box padding={6} className="flex-1 overflow-y-auto">
          {loading && (
            <Box
              padding={8}
              alignItems={BoxAlignItems.Center}
              justifyContent={BoxJustifyContent.Center}
              className="flex flex-col"
            >
              <Icon
                name={IconName.Loading}
                size={IconSize.Lg}
                className="animate-spin"
              />
              <Box marginTop={4}>
                <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
                  Loading standup file...
                </Text>
              </Box>
            </Box>
          )}

          {error && (
            <Box
              backgroundColor={BoxBackgroundColor.ErrorMuted}
              borderColor={BoxBorderColor.ErrorDefault}
              borderWidth={1}
              padding={4}
              className="rounded-lg"
            >
              <Text variant={TextVariant.BodyMd} color={TextColor.ErrorDefault}>
                {error}
              </Text>
            </Box>
          )}

          {!loading && !error && tasks.length > 0 && (
            <Box gap={4} className="flex flex-col">
              {/* Select All Toggle */}
              <Box
                padding={3}
                borderColor={BoxBorderColor.BorderMuted}
                borderWidth={1}
                className="rounded-lg flex items-center cursor-pointer"
                onClick={handleToggleAll}
              >
                <Checkbox
                  id="select-all"
                  isSelected={selectedTaskIds.size === tasks.length}
                  onChange={() => handleToggleAll()}
                  isDisabled={importing}
                />
                <Box marginLeft={3}>
                  <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
                    {selectedTaskIds.size === tasks.length
                      ? 'Deselect All'
                      : selectedTaskIds.size > 0
                      ? `Select All (${selectedTaskIds.size}/${tasks.length} selected)`
                      : 'Select All'}
                  </Text>
                </Box>
              </Box>

              {/* Yesterday's Incomplete Tasks */}
              {yesterdayTasks.length > 0 && (
                <Box gap={2} className="flex flex-col">
                  <Text
                    variant={TextVariant.BodyMd}
                    color={TextColor.TextAlternative}
                    className="font-medium"
                  >
                    Yesterday (Incomplete) — {yesterdayTasks.length}
                  </Text>
                  {yesterdayTasks.map((task) => (
                    <Box
                      key={task.id}
                      padding={3}
                      borderColor={
                        selectedTaskIds.has(task.id)
                          ? BoxBorderColor.PrimaryDefault
                          : BoxBorderColor.BorderMuted
                      }
                      backgroundColor={
                        selectedTaskIds.has(task.id)
                          ? BoxBackgroundColor.PrimaryMuted
                          : BoxBackgroundColor.BackgroundDefault
                      }
                      borderWidth={1}
                      className="rounded-lg flex items-start cursor-pointer transition-colors"
                      onClick={() => !importing && handleToggleTask(task.id)}
                    >
                      <Checkbox
                        id={task.id}
                        isSelected={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        isDisabled={importing}
                      />
                      <Box marginLeft={3} className="flex-1">
                        <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                          {task.text}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Today's Tasks */}
              {todayTasks.length > 0 && (
                <Box gap={2} className="flex flex-col">
                  <Text
                    variant={TextVariant.BodyMd}
                    color={TextColor.TextAlternative}
                    className="font-medium"
                  >
                    Today — {todayTasks.length}
                  </Text>
                  {todayTasks.map((task) => (
                    <Box
                      key={task.id}
                      padding={3}
                      borderColor={
                        selectedTaskIds.has(task.id)
                          ? BoxBorderColor.PrimaryDefault
                          : BoxBorderColor.BorderMuted
                      }
                      backgroundColor={
                        selectedTaskIds.has(task.id)
                          ? BoxBackgroundColor.PrimaryMuted
                          : BoxBackgroundColor.BackgroundDefault
                      }
                      borderWidth={1}
                      className="rounded-lg flex items-start cursor-pointer transition-colors"
                      onClick={() => !importing && handleToggleTask(task.id)}
                    >
                      <Checkbox
                        id={task.id}
                        isSelected={selectedTaskIds.has(task.id)}
                        onChange={() => handleToggleTask(task.id)}
                        isDisabled={importing}
                      />
                      <Box marginLeft={3} className="flex-1">
                        <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                          {task.text}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {!loading && !error && tasks.length === 0 && (
            <Box
              padding={8}
              alignItems={BoxAlignItems.Center}
              justifyContent={BoxJustifyContent.Center}
              className="flex flex-col"
            >
              <Icon
                name={IconName.Info}
                size={IconSize.Lg}
                className="text-text-alternative"
              />
              <Box marginTop={4}>
                <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
                  No tasks found in standup file
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {!loading && !error && tasks.length > 0 && (
          <Box
            padding={6}
            borderColor={BoxBorderColor.BorderMuted}
            alignItems={BoxAlignItems.Center}
            className="border-t flex justify-between"
          >
            <Text variant={TextVariant.BodySm} color={TextColor.TextAlternative}>
              {selectedTaskIds.size === 0 ? (
                'Select at least one task'
              ) : (
                <>
                  {selectedTaskIds.size} {selectedTaskIds.size === 1 ? 'task' : 'tasks'}{' '}
                  will be imported
                </>
              )}
            </Text>
            <Box gap={3} className="flex">
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Md}
                onClick={onClose}
                isDisabled={importing}
              >
                Cancel
              </Button>
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Md}
                onClick={handleImport}
                isDisabled={selectedTaskIds.size === 0 || importing}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
