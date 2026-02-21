import React, { useEffect, useState } from 'react';
import {
  Box,
  BoxAlignItems,
  BoxBorderColor,
  BoxBackgroundColor,
  BoxJustifyContent,
  Button,
  ButtonSize,
  ButtonVariant,
  Checkbox,
  FontFamily,
  Icon,
  IconName,
  IconSize,
  Text,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { useTodoStore } from '../stores/todoStore';

const Todos: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, loadTodos, generateStandupMarkdown, saveStandupToFile } =
    useTodoStore();
  const [newTodoText, setNewTodoText] = useState('');
  const [standupMarkdown, setStandupMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(newTodoText.trim());
      setNewTodoText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleGenerateStandup = () => {
    setIsGenerating(true);
    const markdown = generateStandupMarkdown();
    setStandupMarkdown(markdown);
    setIsGenerating(false);
  };

  const handleSaveStandup = () => {
    if (standupMarkdown) {
      saveStandupToFile(standupMarkdown);
      setStandupMarkdown(''); // Clear preview after saving
    }
  };

  return (
    <Box padding={6} className="w-full mx-auto">
      {/* Header */}
      <Box marginBottom={6} className="flex items-center justify-between max-w-6xl mx-auto">
        <Box className="flex items-center" gap={4}>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.TextDefault}
            fontFamily={FontFamily.Accent}
          >
            Standup
          </Text>
          {/* Stats */}
          {todos.length > 0 && (
            <Box gap={2} className="flex">
              <Box
                paddingVertical={1}
                paddingHorizontal={4}
                backgroundColor={BoxBackgroundColor.SuccessMuted}
                alignItems={BoxAlignItems.Center}
                justifyContent={BoxJustifyContent.Center}
                className="rounded-lg flex"
              >
                <Text
                  variant={TextVariant.HeadingMd}
                  color={TextColor.SuccessDefault}
                >
                  {todos.filter((t) => t.completed).length}
                </Text>
              </Box>

              <Box
                paddingVertical={1}
                paddingHorizontal={4}
                backgroundColor={BoxBackgroundColor.WarningMuted}
                alignItems={BoxAlignItems.Center}
                justifyContent={BoxJustifyContent.Center}
                className="rounded-lg flex"
              >
                <Text
                  variant={TextVariant.HeadingMd}
                  color={TextColor.WarningDefault}
                >
                  {todos.filter((t) => !t.completed).length}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Split Screen Layout */}
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Left Column - Todo List */}
        <Box className="flex flex-col" gap={6}>
          {/* Add Todo */}
          <Box gap={2} className="flex flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Add a new todo..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-muted rounded-md bg-default text-default"
            />
            <Button
              variant={ButtonVariant.Secondary}
              startIconName={IconName.Add}
              onClick={handleAddTodo}
              className="sm:w-auto"
            >
              Add
            </Button>
          </Box>

          {/* Todo List */}
          <Box
            borderColor={BoxBorderColor.BorderMuted}
            borderWidth={1}
            className="rounded-lg"
          >
            {todos.length === 0 ? (
              <Box
                justifyContent={BoxJustifyContent.Center}
                alignItems={BoxAlignItems.Center}
                padding={6}
                className="flex flex-col"
              >
                <Icon
                  name={IconName.CheckBold}
                  size={IconSize.Lg}
                  className="text-text-alternative mb-3"
                />
                <Text
                  variant={TextVariant.BodyMd}
                  color={TextColor.TextAlternative}
                >
                  No todos yet. Add your first task above!
                </Text>
              </Box>
            ) : (
              <Box className="flex flex-col">
                {todos.map((todo) => (
                  <Box
                    key={todo.id}
                    padding={3}
                    backgroundColor={BoxBackgroundColor.BackgroundDefault}
                    className="flex items-center justify-between group hover:bg-default-hover transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Box
                      alignItems={BoxAlignItems.Center}
                      gap={3}
                      className="flex flex-1"
                    >
                      <Checkbox
                        id={todo.text}
                        isSelected={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <Text
                        variant={TextVariant.BodyMd}
                        color={
                          todo.completed
                            ? TextColor.TextAlternative
                            : TextColor.TextDefault
                        }
                        className={todo.completed ? 'line-through' : ''}
                      >
                        {todo.text}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Column - Standup Preview */}
        <Box className="flex flex-col" gap={6}>
          {/* Actions */}
          <Box gap={2} className="flex flex-col sm:flex-row">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Lg}
              startIconName={IconName.MessageQuestion}
              onClick={handleGenerateStandup}
              isLoading={isGenerating}
              className="w-full sm:flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Standup'}
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Lg}
              startIconName={IconName.Download}
              onClick={handleSaveStandup}
              isDisabled={!standupMarkdown}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
          </Box>

          {/* Markdown Preview */}
          <Box
            borderColor={BoxBorderColor.BorderMuted}
            borderWidth={1}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            padding={4}
            className="rounded-lg min-h-[400px] overflow-auto"
          >
            {standupMarkdown ? (
              <pre className="font-mono text-sm text-default whitespace-pre-wrap">
                <code>{standupMarkdown}</code>
              </pre>
            ) : (
              <Box
                className="flex items-center justify-center"
                style={{ minHeight: '400px' }}
              >
                <Text
                  variant={TextVariant.BodyMd}
                  color={TextColor.TextAlternative}
                >
                  Click "Generate Standup" to preview
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Todos;
