import React, { useEffect, useState } from 'react';
import {
  Box,
  BoxAlignItems,
  BoxBorderColor,
  BoxBackgroundColor,
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
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodoStore } from '../stores/todoStore';
import { MarkdownText } from '../components/MarkdownText';

interface SortableTodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
  id,
  text,
  completed,
  onToggle,
  onUpdate,
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
    if (!completed) {
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
        <Checkbox id={text} isSelected={completed} onChange={onToggle} />
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
                completed ? TextColor.TextAlternative : TextColor.TextDefault
              }
              className={completed ? 'line-through' : ''}
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

const Todos: React.FC = () => {
  const todos = useTodoStore((state) => state.todos);
  const loadedFrom = useTodoStore((state) => state.loadedFrom);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const reorderTodos = useTodoStore((state) => state.reorderTodos);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadTodos();
    // Only run once on mount
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderTodos(active.id as string, over.id as string);
    }
  };

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
      setShowSaveInstructions(true);
      // Keep the preview visible so user can reference it
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadFromMarkdown();
      setShowSaveInstructions(false);
      setStandupMarkdown(''); // Clear preview after reload
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <Box padding={6} className="w-full mx-auto">
      {/* Header */}
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
        {loadedFrom && (
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
            className="rounded-md"
          >
            <Text variant={TextVariant.BodySm} color={TextColor.TextDefault}>
              {loadedFrom.isToday ? '📝 ' : '📅 '}
              {loadedFrom.filename}
              {loadedFrom.isToday && ' (deduplicated)'}
            </Text>
          </Box>
        )}
      </Box>

      {/* Save Instructions Banner */}
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
              <Text variant={TextVariant.BodyMd} color={TextColor.InfoDefault} className="font-bold">
                File Downloaded!
              </Text>
              <Text variant={TextVariant.BodyMd} color={TextColor.TextDefault}>
                Save the downloaded file to <code className="px-1 py-0.5 bg-default rounded text-sm">public/standups/</code> directory,
                then click "Reload from Markdown" to sync.
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={todos.map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box className="flex flex-col">
                    {todos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        id={todo.id}
                        text={todo.text}
                        completed={todo.completed}
                        onToggle={() => toggleTodo(todo.id)}
                        onUpdate={(text) => updateTodo(todo.id, text)}
                        onDelete={() => deleteTodo(todo.id)}
                      />
                    ))}
                  </Box>
                </SortableContext>
              </DndContext>
            )}
          </Box>
        </Box>

        {/* Right Column - Standup Preview */}
        <Box className="flex flex-col" gap={6}>
          {/* Actions */}
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
              isDisabled={isReloading}
              className="w-full sm:w-auto"
            >
              {isReloading ? 'Loading...' : 'Load standup'}
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
