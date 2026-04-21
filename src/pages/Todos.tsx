import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  BoxAlignItems,
  BoxBackgroundColor,
  BoxBorderColor,
  BoxJustifyContent,
  Button,
  ButtonHero,
  ButtonIcon,
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
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MarkdownText } from '../components/MarkdownText';
import { useTodoStore, type Todo, type TodoSection } from '../stores/todoStore';

interface SortableTodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  section: TodoSection;
  onToggle?: (isSelected: boolean) => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
  id,
  text,
  completed,
  section,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== text) {
      onUpdate(trimmedText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleTextClick = () => {
    if (!(section === 'today' && completed)) {
      setIsEditing(true);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      padding={3}
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      className="flex items-center justify-between group hover:bg-default-hover transition-colors first:rounded-t-lg last:rounded-b-lg"
    >
      <Box alignItems={BoxAlignItems.Center} gap={3} className="flex flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <Icon
            name={IconName.Menu}
            size={IconSize.Md}
            className="text-text-alternative"
          />
        </div>
        {section === 'today' ? (
          <Checkbox
            id={text}
            isSelected={completed}
            onChange={() => onToggle?.(!completed)}
          />
        ) : (
          <Box
            alignItems={BoxAlignItems.Center}
            justifyContent={BoxJustifyContent.Center}
            className="w-5 h-5"
          >
            <Icon
              name={IconName.Bookmark}
              size={IconSize.Sm}
              className="text-text-alternative"
            />
          </Box>
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 px-2 py-1 border border-primary rounded-md bg-default text-default"
          />
        ) : (
          <div onClick={handleTextClick} className="flex-1 cursor-pointer">
            <MarkdownText
              text={text}
              variant={TextVariant.BodyMd}
              color={
                section === 'today' && completed
                  ? TextColor.TextAlternative
                  : TextColor.TextDefault
              }
              className={section === 'today' && completed ? 'line-through' : ''}
            />
          </div>
        )}
      </Box>
      <ButtonIcon
        iconName={IconName.Trash}
        ariaLabel="Delete todo"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </Box>
  );
};

interface TodoSectionListProps {
  title: string;
  section: TodoSection;
  todos: Todo[];
  emptyState: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const TodoSectionList: React.FC<TodoSectionListProps> = ({
  title,
  section,
  todos,
  emptyState,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: section });

  return (
    <Box
      ref={setNodeRef}
      borderColor={isOver ? BoxBorderColor.InfoDefault : BoxBorderColor.BorderMuted}
      borderWidth={1}
      className="rounded-lg overflow-hidden"
    >
      <Box
        paddingVertical={3}
        paddingHorizontal={4}
        backgroundColor={
          section === 'today'
            ? BoxBackgroundColor.WarningMuted
            : BoxBackgroundColor.BackgroundAlternative
        }
      >
        <Text variant={TextVariant.HeadingSm} color={TextColor.TextDefault}>
          {title}
        </Text>
      </Box>
      <SortableContext
        items={todos.map((todo) => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        {todos.length === 0 ? (
          <Box padding={4}>
            <Text variant={TextVariant.BodyMd} color={TextColor.TextAlternative}>
              {emptyState}
            </Text>
          </Box>
        ) : (
          <Box className="flex flex-col">
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                id={todo.id}
                text={todo.text}
                completed={todo.completed}
                section={todo.section}
                onToggle={
                  todo.section === 'today' ? () => onToggle(todo.id) : undefined
                }
                onUpdate={(text) => onUpdate(todo.id, text)}
                onDelete={() => onDelete(todo.id)}
              />
            ))}
          </Box>
        )}
      </SortableContext>
    </Box>
  );
};

const Todos: React.FC = () => {
  const todos = useTodoStore((state) => state.todos);
  const loadedFrom = useTodoStore((state) => state.loadedFrom);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const moveTodo = useTodoStore((state) => state.moveTodo);
  const loadTodos = useTodoStore((state) => state.loadTodos);
  const reloadFromMarkdown = useTodoStore((state) => state.reloadFromMarkdown);
  const generateStandupMarkdown = useTodoStore(
    (state) => state.generateStandupMarkdown,
  );
  const saveStandupToFile = useTodoStore((state) => state.saveStandupToFile);
  const [newTodoText, setNewTodoText] = useState('');
  const [standupMarkdown, setStandupMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [showSaveInstructions, setShowSaveInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const todayTodos = todos.filter((todo) => todo.section === 'today');
  const backlogTodos = todos.filter((todo) => todo.section === 'backlog');
  const completedCount = todayTodos.filter((todo) => todo.completed).length;
  const incompleteCount = todayTodos.filter((todo) => !todo.completed).length;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadTodos();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTodo = todos.find((todo) => todo.id === active.id);
    if (!activeTodo) {
      return;
    }

    const overId = String(over.id);
    const overTodo = todos.find((todo) => todo.id === overId);
    const targetSection: TodoSection =
      overId === 'today' || overId === 'backlog'
        ? overId
        : overTodo?.section ?? activeTodo.section;

    moveTodo(
      String(active.id),
      targetSection,
      overTodo ? String(over.id) : null,
    );
  };

  const convertJiraTickets = (text: string): string => {
    const ticketPattern = /\b([A-Z]+-\d+)\b/g;
    const urlPattern = /https?:\/\/[^\/]*atlassian\.net\/browse\/([A-Z]+-\d+)/g;

    let result = text;

    result = result.replace(urlPattern, (_match, ticketNumber) => {
      return `[${ticketNumber}](https://consensyssoftware.atlassian.net/browse/${ticketNumber})`;
    });

    result = result.replace(ticketPattern, (match, ticketNumber) => {
      const beforeMatch = result.substring(0, result.indexOf(match));
      if (
        beforeMatch.endsWith('[') ||
        beforeMatch.endsWith(
          '(https://consensyssoftware.atlassian.net/browse/',
        )
      ) {
        return match;
      }
      return `[${ticketNumber}](https://consensyssoftware.atlassian.net/browse/${ticketNumber})`;
    });

    return result;
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(convertJiraTickets(newTodoText.trim()));
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
    setStandupMarkdown(generateStandupMarkdown());
    setIsGenerating(false);
  };

  const handleSaveStandup = () => {
    if (standupMarkdown) {
      saveStandupToFile(standupMarkdown);
      setShowSaveInstructions(true);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadFromMarkdown();
      setShowSaveInstructions(false);
      setStandupMarkdown('');
    } finally {
      setIsReloading(false);
    }
  };

  const handleCopy = async () => {
    if (standupMarkdown) {
      try {
        await navigator.clipboard.writeText(standupMarkdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <Box padding={6} className="w-full mx-auto">
      <Box
        marginBottom={6}
        className="flex items-center justify-between max-w-6xl mx-auto"
      >
        <Box className="flex items-center" gap={4}>
          <Text
            variant={TextVariant.HeadingLg}
            color={TextColor.TextDefault}
            fontFamily={FontFamily.Accent}
          >
            Standup
          </Text>
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
                  {completedCount}
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
                  {incompleteCount}
                </Text>
              </Box>
              <Box
                paddingVertical={1}
                paddingHorizontal={4}
                backgroundColor={BoxBackgroundColor.BackgroundAlternative}
                alignItems={BoxAlignItems.Center}
                justifyContent={BoxJustifyContent.Center}
                className="rounded-lg flex"
              >
                <Text
                  variant={TextVariant.HeadingMd}
                  color={TextColor.TextAlternative}
                >
                  {backlogTodos.length}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
        {loadedFrom && (
          <Link
            to={`/${loadedFrom.filename.replace('.md', '')}`}
            className="no-underline"
          >
            <Box
              paddingVertical={1}
              paddingHorizontal={3}
              backgroundColor={
                loadedFrom.isToday
                  ? BoxBackgroundColor.InfoMuted
                  : BoxBackgroundColor.BackgroundAlternative
              }
              borderColor={
                loadedFrom.isToday
                  ? BoxBorderColor.InfoDefault
                  : BoxBorderColor.BorderMuted
              }
              borderWidth={1}
              className="rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
                {loadedFrom.isToday ? '📝 ' : '📅 '}
                {loadedFrom.filename}
                {loadedFrom.isToday && ' (deduplicated)'}
              </Text>
            </Box>
          </Link>
        )}
      </Box>

      {showSaveInstructions && (
        <Box
          marginBottom={4}
          padding={4}
          backgroundColor={BoxBackgroundColor.InfoMuted}
          borderColor={BoxBorderColor.InfoDefault}
          borderWidth={1}
          className="rounded-lg max-w-6xl mx-auto"
        >
          <Box className="flex items-start justify-between">
            <Box gap={2} className="flex-1">
              <Text
                variant={TextVariant.BodyMd}
                color={TextColor.InfoDefault}
                className="font-bold"
              >
                File Downloaded!
              </Text>
              <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
                Save the downloaded file to{' '}
                <code className="px-1 py-0.5 bg-default rounded text-sm">
                  public/standups/
                </code>{' '}
                directory, then click "Reload from Markdown" to sync.
              </Text>
            </Box>
            <ButtonIcon
              iconName={IconName.Close}
              ariaLabel="Close"
              onClick={() => setShowSaveInstructions(false)}
            />
          </Box>
        </Box>
      )}

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Box className="flex flex-col" gap={6}>
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

          {todos.length === 0 ? (
            <Box
              borderColor={BoxBorderColor.BorderMuted}
              borderWidth={1}
              className="rounded-lg"
            >
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
            </Box>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Box className="flex flex-col" gap={4}>
                <TodoSectionList
                  title="Today"
                  section="today"
                  todos={todayTodos}
                  emptyState="Move something here when you're ready to work on it."
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
                <TodoSectionList
                  title="Backlog"
                  section="backlog"
                  todos={backlogTodos}
                  emptyState="Drag tasks here to keep them out of today's standup."
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              </Box>
            </DndContext>
          )}
        </Box>

        <Box className="flex flex-col" gap={6}>
          <Box gap={2} className="flex flex-col sm:flex-row">
            <ButtonHero
              size={ButtonSize.Lg}
              onClick={handleGenerateStandup}
              isLoading={isGenerating}
              className="w-full sm:flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Standup'}
            </ButtonHero>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Lg}
              startIconName={IconName.Upload}
              onClick={handleReload}
              isLoading={isReloading}
              loadingText="Loading..."
              className="w-full sm:w-auto"
            >
              Load standup
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

          <Box
            borderColor={BoxBorderColor.BorderMuted}
            borderWidth={1}
            backgroundColor={BoxBackgroundColor.BackgroundAlternative}
            padding={4}
            className="rounded-lg min-h-[400px] overflow-auto relative"
          >
            {standupMarkdown && (
              <Box className="absolute top-2 right-2">
                <ButtonIcon
                  iconName={IconName.Copy}
                  ariaLabel={copied ? 'Copied!' : 'Copy markdown'}
                  onClick={handleCopy}
                />
              </Box>
            )}
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
