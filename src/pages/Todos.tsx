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
  const { todos, addTodo, toggleTodo, deleteTodo, loadTodos, generateStandup } =
    useTodoStore();
  const [newTodoText, setNewTodoText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

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

  const handleGenerateStandup = async () => {
    setIsGenerating(true);
    await generateStandup();
    setIsGenerating(false);
  };

  return (
    <Box padding={6} className="w-full max-w-4xl mx-auto">
      <Box
        marginBottom={6}
        justifyContent={BoxJustifyContent.Between}
        className="flex"
      >
        <Box className="flex" gap={4}>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.TextDefault}
            fontFamily={FontFamily.Accent}
          >
            Standup
          </Text>
          {/* Stats */}
          {todos.length > 0 && (
            <Box gap={2} className="grid grid-cols-2">
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
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          startIconName={IconName.MessageQuestion}
          onClick={handleGenerateStandup}
          isLoading={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Standup'}
        </Button>
      </Box>

      {/* Add Todo */}
      <Box marginBottom={6}>
        <Box gap={2} className="flex">
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
          >
            Add
          </Button>
        </Box>
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
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Sm}
                  startIconName={IconName.Trash}
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  isDanger
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Todos;
