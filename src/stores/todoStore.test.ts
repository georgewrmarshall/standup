import { describe, expect, it } from 'vitest';
import { normalizeTodoOrder, type Todo } from './todoStore';

const createTodo = (
  id: string,
  section: Todo['section'],
  completed: boolean,
): Todo => ({
  id,
  text: id,
  completed,
  section,
  createdAt: '2026-05-05T00:00:00.000Z',
});

describe('normalizeTodoOrder', () => {
  it('keeps completed yesterday items above incomplete ones', () => {
    const todos = [
      createTodo('yesterday-open', 'yesterday', false),
      createTodo('today-done', 'today', true),
      createTodo('yesterday-done', 'yesterday', true),
      createTodo('today-open', 'today', false),
    ];

    expect(normalizeTodoOrder(todos).map((todo) => todo.id)).toEqual([
      'yesterday-done',
      'yesterday-open',
      'today-done',
      'today-open',
    ]);
  });
});
