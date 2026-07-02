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
  TextField,
  TextFieldSize,
  TextVariant,
  ToastSeverity,
  toast,
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
  onMoveToSection?: (section: TodoSection) => void;
  onDuplicateToYesterday?: () => void;
  onDelete: () => void;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
  id,
  text,
  completed,
  section,
  onToggle,
  onUpdate,
  onMoveToSection,
  onDuplicateToYesterday,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
    if (!(section === 'yesterday' && completed)) {
      setIsEditing(true);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      padding={3}
      className="flex items-center justify-between group hover:bg-muted active:bg-muted-pressed transition-colors last:rounded-b-lg"
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
        {section === 'backlog' ? (
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
        ) : (
          <Checkbox
            id={text}
            isSelected={completed}
            onChange={() => onToggle?.(!completed)}
          />
        )}
        {isEditing ? (
          <TextField
            autoFocus
            size={TextFieldSize.Lg}
            inputRef={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            inputProps={{
              onKeyDown: handleKeyDown,
            }}
            className="flex-1 w-full"
          />
        ) : (
          <div onClick={handleTextClick} className="flex-1 cursor-pointer">
            <MarkdownText
              text={text}
              variant={TextVariant.BodyMd}
              color={
                section === 'yesterday' && completed
                  ? TextColor.TextAlternative
                  : TextColor.TextDefault
              }
              className={
                section === 'yesterday' && completed ? 'line-through' : ''
              }
            />
          </div>
        )}
      </Box>
      <Box className="flex items-center">
        {section !== 'yesterday' && (
          <ButtonIcon
            iconName={IconName.CheckBold}
            ariaLabel="Move to yesterday"
            onClick={
              onDuplicateToYesterday ?? (() => onMoveToSection?.('yesterday'))
            }
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        {section !== 'today' && (
          <ButtonIcon
            iconName={IconName.Edit}
            ariaLabel="Move to today"
            onClick={() => onMoveToSection?.('today')}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        {section !== 'backlog' && (
          <ButtonIcon
            iconName={IconName.Bookmark}
            ariaLabel="Move to backlog"
            onClick={() => onMoveToSection?.('backlog')}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        <ButtonIcon
          iconName={IconName.Trash}
          ariaLabel="Delete todo"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </Box>
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
  onMoveToSection: (id: string, section: TodoSection) => void;
  onDuplicateToYesterday: (id: string) => void;
  onDelete: (id: string) => void;
  onClearSection?: () => void;
}

const TodoSectionList: React.FC<TodoSectionListProps> = ({
  title,
  section,
  todos,
  emptyState,
  onToggle,
  onUpdate,
  onMoveToSection,
  onDuplicateToYesterday,
  onDelete,
  onClearSection,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: section });

  return (
    <Box
      ref={setNodeRef}
      borderColor={
        isOver ? BoxBorderColor.InfoDefault : BoxBorderColor.BorderMuted
      }
      borderWidth={1}
      className="rounded-lg overflow-hidden bg-section"
    >
      <Box
        paddingVertical={3}
        paddingHorizontal={4}
        alignItems={BoxAlignItems.Center}
        justifyContent={BoxJustifyContent.Between}
        className="flex"
      >
        <Text variant={TextVariant.HeadingSm} color={TextColor.TextDefault}>
          {title}
        </Text>
        {section === 'yesterday' && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Sm}
            onClick={onClearSection}
            className="ml-auto"
          >
            Clear
          </Button>
        )}
      </Box>
      <SortableContext
        items={todos.map((todo) => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        {todos.length === 0 ? (
          <Box padding={4}>
            <Text
              variant={TextVariant.BodyMd}
              color={TextColor.TextAlternative}
            >
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
                  todo.section !== 'backlog'
                    ? () => onToggle(todo.id)
                    : undefined
                }
                onUpdate={(text) => onUpdate(todo.id, text)}
                onMoveToSection={(targetSection) =>
                  onMoveToSection(todo.id, targetSection)
                }
                onDuplicateToYesterday={
                  todo.section === 'today'
                    ? () => onDuplicateToYesterday(todo.id)
                    : undefined
                }
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
  const clearSection = useTodoStore((state) => state.clearSection);
  const duplicateToYesterday = useTodoStore(
    (state) => state.duplicateToYesterday,
  );
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
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const yesterdayTodos = todos.filter((todo) => todo.section === 'yesterday');
  const todayTodos = todos.filter((todo) => todo.section === 'today');
  const backlogTodos = todos.filter((todo) => todo.section === 'backlog');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('standup-theme');
    const shouldUseDark = storedTheme === 'dark';

    document.documentElement.classList.toggle('dark', shouldUseDark);
    setIsDarkMode(shouldUseDark);
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
      overId === 'yesterday' || overId === 'today' || overId === 'backlog'
        ? overId
        : (overTodo?.section ?? activeTodo.section);

    handleMoveTodo(
      String(active.id),
      targetSection,
      overTodo ? String(over.id) : null,
    );
  };

  const convertJiraTickets = (text: string): string => {
    const ticketPattern = /\b([A-Z]+-\d+)\b/g;
    const urlPattern = /https?:\/\/[^/]*atlassian\.net\/browse\/([A-Z]+-\d+)/g;

    let result = text;

    result = result.replace(urlPattern, (_match, ticketNumber) => {
      return `[${ticketNumber}](https://consensyssoftware.atlassian.net/browse/${ticketNumber})`;
    });

    result = result.replace(ticketPattern, (match, ticketNumber) => {
      const beforeMatch = result.substring(0, result.indexOf(match));
      if (
        beforeMatch.endsWith('[') ||
        beforeMatch.endsWith('(https://consensyssoftware.atlassian.net/browse/')
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
      toast({
        title: 'Todo added',
        severity: ToastSeverity.Success,
      });
    }
  };

  const handleAddTodoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
    toast({
      title: 'Item removed',
      severity: ToastSeverity.Danger,
    });
  };

  const handleMoveTodo = (
    id: string,
    targetSection: TodoSection,
    overId?: string | null,
  ) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }

    const movedToBacklog =
      todo.section !== 'backlog' && targetSection === 'backlog';
    moveTodo(id, targetSection, overId ?? null);

    if (movedToBacklog) {
      toast({
        title: 'Moved to backlog',
        severity: ToastSeverity.Success,
      });
    }
  };

  const handleGenerateStandup = () => {
    setIsGenerating(true);
    setStandupMarkdown(generateStandupMarkdown());
    setIsGenerating(false);
    toast({
      title: 'Standup generated',
      severity: ToastSeverity.Success,
    });
  };

  const handleSaveStandup = () => {
    if (standupMarkdown) {
      saveStandupToFile(standupMarkdown);
      toast({
        title: 'Standup saved',
        description:
          'Save the downloaded file to public/standups/, then click Load standup to sync.',
        severity: ToastSeverity.Success,
      });
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadFromMarkdown();
      setStandupMarkdown('');

      const { loadedFrom: reloadedFrom } = useTodoStore.getState();
      if (reloadedFrom) {
        toast({
          title: 'Standup loaded',
          description: reloadedFrom.filename,
          severity: ToastSeverity.Success,
        });
      } else {
        toast({
          title: 'No standup file found',
          severity: ToastSeverity.Warning,
        });
      }
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
        toast({
          title: 'Copied to clipboard',
          severity: ToastSeverity.Success,
        });
      } catch (err) {
        console.error('Failed to copy:', err);
        toast({
          title: 'Failed to copy',
          severity: ToastSeverity.Danger,
        });
      }
    }
  };

  const handleToggleDarkMode = () => {
    const nextIsDark = !isDarkMode;
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('standup-theme', nextIsDark ? 'dark' : 'light');
  };

  return (
    <Box padding={6} className="w-full mx-auto">
      <Box
        marginBottom={6}
        className="flex flex-wrap items-start justify-between gap-4 max-w-6xl mx-auto"
      >
        <Box className="flex flex-wrap items-center" gap={4}>
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
                  color={TextColor.TextDefault}
                >
                  {yesterdayTodos.length}
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
                  color={TextColor.TextDefault}
                >
                  {todayTodos.length}
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
        <Box
          alignItems={BoxAlignItems.Center}
          className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto sm:flex-nowrap sm:flex-shrink-0"
        >
          {loadedFrom && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Sm}
              asChild
              startIconName={
                loadedFrom.isToday ? IconName.File : IconName.Calendar
              }
              className="max-w-full"
            >
              <Link
                to={`/${loadedFrom.filename.replace('.md', '')}`}
                className="no-underline max-w-full"
              >
                {loadedFrom.filename}
                {loadedFrom.isToday && ' (deduplicated)'}
              </Link>
            </Button>
          )}
          <ButtonIcon
            iconName={isDarkMode ? IconName.Light : IconName.Dark}
            ariaLabel={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
            onClick={handleToggleDarkMode}
          />
        </Box>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Box className="flex flex-col" gap={6}>
          <Box gap={2} className="flex flex-col sm:flex-row">
            <TextField
              size={TextFieldSize.Lg}
              placeholder="Add a new todo..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              inputProps={{
                onKeyDown: handleAddTodoKeyDown,
              }}
              className="flex-1 w-full"
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
                  title="Yesterday"
                  section="yesterday"
                  todos={yesterdayTodos}
                  emptyState="Drag completed work here so it lands only in yesterday's update."
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onMoveToSection={handleMoveTodo}
                  onDuplicateToYesterday={duplicateToYesterday}
                  onDelete={handleDeleteTodo}
                  onClearSection={() => clearSection('yesterday')}
                />
                <TodoSectionList
                  title="Today"
                  section="today"
                  todos={todayTodos}
                  emptyState="Move something here when you're ready to work on it."
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onMoveToSection={handleMoveTodo}
                  onDuplicateToYesterday={duplicateToYesterday}
                  onDelete={handleDeleteTodo}
                />
                <TodoSectionList
                  title="Backlog"
                  section="backlog"
                  todos={backlogTodos}
                  emptyState="Drag tasks here to keep them out of today's standup."
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onMoveToSection={handleMoveTodo}
                  onDuplicateToYesterday={duplicateToYesterday}
                  onDelete={handleDeleteTodo}
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
              <Text
                variant={TextVariant.BodyMd}
                color={TextColor.TextDefault}
                className="block font-mono whitespace-pre-wrap pr-10"
              >
                {standupMarkdown}
              </Text>
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
