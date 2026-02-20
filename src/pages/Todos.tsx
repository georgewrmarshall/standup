import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  ButtonVariant,
  ButtonSize,
  Checkbox,
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
import { useTodoStore } from '../stores/todoStore';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  linkedPR?: string;
  linkedTicket?: string;
  createdAt: string;
  completedAt?: string;
}

const Todos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedPriority, setSelectedPriority] =
    useState<Todo['priority']>('P1');
  const { todos, addTodo, toggleTodo, deleteTodo, loadTodos } = useTodoStore();

  useEffect(() => {
    loadTodos();
  }, []);

  const priorityConfig = {
    P0: {
      label: 'Urgent/Blockers',
      color: 'text-error-default',
      icon: IconName.Danger,
    },
    P1: {
      label: "Today's Goals",
      color: 'text-warning-default',
      icon: IconName.Star,
    },
    P2: {
      label: 'This Week',
      color: 'text-info-default',
      icon: IconName.Calendar,
    },
    P3: { label: 'Backlog', color: 'text-alternative', icon: IconName.Clock },
  };

  const filteredTodos = todos.filter((todo) =>
    todo.text.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedTodos = filteredTodos.reduce(
    (acc, todo) => {
      if (!acc[todo.priority]) acc[todo.priority] = [];
      acc[todo.priority].push(todo);
      return acc;
    },
    {} as Record<Todo['priority'], Todo[]>,
  );

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo({
        text: newTodoText,
        priority: selectedPriority,
      });
      setNewTodoText('');
    }
  };

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
            Daily Todos
          </Text>
          <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Text>
        </Box>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Sm}
          startIconName={IconName.Export}
        >
          Export to Markdown
        </Button>
      </Box>

      {/* Add Todo Section */}
      <Box
        padding={4}
        backgroundColor={BoxBackgroundColor.BackgroundAlternative}
        marginBottom={6}
        className="rounded-lg"
      >
        <Box gap={3} alignItems={BoxAlignItems.End} className="flex">
          <Box className="flex-1">
            <Text
              variant={TextVariant.BodySm}
              color={TextColor.TextAlternative}
              className="mb-2"
            >
              Add New Todo
            </Text>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Enter your todo..."
              className="w-full px-3 py-2 border border-muted rounded-md bg-default text-default"
            />
          </Box>
          <Box>
            <Text
              variant={TextVariant.BodySm}
              color={TextColor.TextAlternative}
              className="mb-2"
            >
              Priority
            </Text>
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as Todo['priority'])
              }
              className="px-3 py-2 border border-muted rounded-md bg-default text-default"
            >
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {key} - {config.label}
                </option>
              ))}
            </select>
          </Box>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Md}
            onClick={handleAddTodo}
            startIconName={IconName.Add}
          >
            Add Todo
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box marginBottom={4}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search todos..."
          className="w-full px-3 py-2 border border-muted rounded-md bg-default text-default"
        />
      </Box>

      {/* Todo Groups */}
      <Box flexDirection={BoxFlexDirection.Column} gap={4} className="flex">
        {(['P0', 'P1', 'P2', 'P3'] as const).map((priority) => {
          const todosInGroup = groupedTodos[priority] || [];
          const config = priorityConfig[priority];

          return (
            <Box
              key={priority}
              padding={4}
              backgroundColor={BoxBackgroundColor.BackgroundAlternative}
              className="rounded-lg"
            >
              <Box
                alignItems={BoxAlignItems.Center}
                gap={2}
                marginBottom={3}
                className="flex"
              >
                <Icon
                  name={config.icon}
                  size={IconSize.Sm}
                  className={config.color}
                />
                <Text
                  variant={TextVariant.HeadingSm}
                  color={TextColor.TextDefault}
                >
                  {priority} - {config.label}
                </Text>
                <Text
                  variant={TextVariant.BodySm}
                  color={TextColor.TextAlternative}
                  className="ml-auto"
                >
                  {todosInGroup.filter((t) => !t.completed).length} of{' '}
                  {todosInGroup.length} remaining
                </Text>
              </Box>

              {todosInGroup.length === 0 ? (
                <Text
                  variant={TextVariant.BodySm}
                  color={TextColor.TextAlternative}
                >
                  No todos in this category
                </Text>
              ) : (
                <Box
                  flexDirection={BoxFlexDirection.Column}
                  gap={2}
                  className="flex"
                >
                  {todosInGroup.map((todo) => (
                    <Box
                      key={todo.id}
                      alignItems={BoxAlignItems.Center}
                      gap={3}
                      padding={2}
                      backgroundColor={
                        todo.completed
                          ? BoxBackgroundColor.BackgroundAlternative
                          : undefined
                      }
                      className="group hover:bg-hover-light transition-colors flex rounded"
                    >
                      <Checkbox
                        id={todo.id}
                        isSelected={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <Text
                        variant={TextVariant.BodyMd}
                        color={
                          todo.completed
                            ? TextColor.TextMuted
                            : TextColor.TextDefault
                        }
                        className={`flex-1 ${todo.completed ? 'line-through' : ''}`}
                      >
                        {todo.text}
                      </Text>
                      {todo.linkedPR && (
                        <Box
                          padding={1}
                          backgroundColor={BoxBackgroundColor.InfoMuted}
                          className="rounded px-2 py-1"
                        >
                          <Text
                            variant={TextVariant.BodyXs}
                            color={TextColor.InfoDefault}
                          >
                            PR: {todo.linkedPR}
                          </Text>
                        </Box>
                      )}
                      {todo.linkedTicket && (
                        <Box
                          padding={1}
                          backgroundColor={BoxBackgroundColor.WarningMuted}
                          className="rounded px-2 py-1"
                        >
                          <Text
                            variant={TextVariant.BodyXs}
                            color={TextColor.WarningDefault}
                          >
                            {todo.linkedTicket}
                          </Text>
                        </Box>
                      )}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-error-default hover:text-error-default/80"
                      >
                        <Icon name={IconName.Trash} size={IconSize.Xs} />
                      </button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Todos;
