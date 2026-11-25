import { beforeEach, expect, it } from 'vitest';
import { useAuthStore } from '../src/state/auth/store';
import { useToastState } from '../src/components/design-system/toast/store';

beforeEach(() => {
  useAuthStore.getState().actions.clearAuth();
  useToastState.getState().clearToasts();
});
it('signs in and clears all authentication fields', () => {
  useAuthStore.getState().actions.loginSuccess({ accessToken: 'test', currentUserId: '1' });
  expect(useAuthStore.getState().isAuthenticated).toBe(true);
  useAuthStore.getState().actions.clearAuth();
  expect(useAuthStore.getState()).toMatchObject({
    isAuthenticated: false,
    accessToken: undefined,
    currentUserId: undefined,
  });
  expect(useAuthStore.use.currentUserId).toBeTypeOf('function');
});

it('generates unique toast ids and removes only the selected toast', () => {
  useToastState.getState().addToast('First');
  useToastState.getState().addToast('Second');
  const [first, second] = useToastState.getState().toasts;
  expect(first.id).not.toBe(second.id);
  useToastState.getState().removeToast(first.id);
  expect(useToastState.getState().toasts).toEqual([second]);
});

it('clears shared toast notifications at the session boundary', () => {
  useToastState.getState().addToast('First');
  useToastState.getState().addToast('Second');
  useToastState.getState().clearToasts();
  expect(useToastState.getState().toasts).toEqual([]);
});
