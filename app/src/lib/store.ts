'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Family, User, Task, TaskLog, Wish, WishRequest, Transaction, UserRole } from '@/types';
import { type AppSnapshot, superdinoApi } from '@/lib/superdino-api';

const DEFAULT_FAMILY_ID = 'f1';
const DEFAULT_FAMILY_CODE = 'DINO-F1';

// Initial seed data (same as prototype)
const INITIAL_TASKS: Task[] = [
  { id: 't1', name: 'Brush teeth', emoji: '🦷', reward: 2, category: 'morning', autoApprove: true, color: 'oklch(0.92 0.06 240)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't2', name: 'Make my bed', emoji: '🛏️', reward: 3, category: 'morning', autoApprove: true, color: 'oklch(0.94 0.06 90)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't3', name: 'Read 20 minutes', emoji: '📚', reward: 5, category: 'school', autoApprove: false, color: 'oklch(0.93 0.07 30)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't4', name: 'Feed the dog', emoji: '🐶', reward: 4, category: 'home', autoApprove: true, color: 'oklch(0.93 0.07 60)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't5', name: 'Tidy my room', emoji: '🧹', reward: 6, category: 'home', autoApprove: false, color: 'oklch(0.93 0.06 145)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't6', name: 'Help with dinner', emoji: '🥗', reward: 4, category: 'kind', autoApprove: false, color: 'oklch(0.92 0.07 145)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't7', name: 'Practice piano', emoji: '🎵', reward: 5, category: 'school', autoApprove: false, color: 'oklch(0.93 0.06 280)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 't8', name: 'Be kind to bro', emoji: '💚', reward: 3, category: 'kind', autoApprove: true, color: 'oklch(0.93 0.07 30)', familyId: 'f1', createdAt: new Date().toISOString() },
];

const INITIAL_WISH_CATALOG: Wish[] = [
  { id: 'w1', name: 'Movie night', emoji: '🎬', cost: 12, category: 'normal', color: 'oklch(0.92 0.07 280)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 'w2', name: 'Ice cream trip', emoji: '🍦', cost: 8, category: 'normal', color: 'oklch(0.94 0.07 30)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 'w3', name: 'New book', emoji: '📖', cost: 20, category: 'normal', color: 'oklch(0.92 0.07 145)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 'w4', name: 'Park playdate', emoji: '🛝', cost: 15, category: 'normal', color: 'oklch(0.93 0.07 90)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 'w5', name: 'Stay up late', emoji: '🌙', cost: 10, category: 'normal', color: 'oklch(0.92 0.06 240)', familyId: 'f1', createdAt: new Date().toISOString() },
  { id: 'w6', name: 'Pick dinner', emoji: '🍕', cost: 6, category: 'normal', color: 'oklch(0.94 0.07 60)', familyId: 'f1', createdAt: new Date().toISOString() },
];

const INITIAL_FAMILIES: Family[] = [
  { id: DEFAULT_FAMILY_ID, name: 'Dino Family', code: DEFAULT_FAMILY_CODE, createdAt: new Date().toISOString() },
];

const INITIAL_USERS: User[] = [
  { id: 'parent-demo', username: 'parent', name: 'Parent', role: 'parent', familyId: DEFAULT_FAMILY_ID, createdAt: new Date().toISOString() },
  { id: 'kid-demo', username: 'mia', name: 'Mia', role: 'child', familyId: DEFAULT_FAMILY_ID, createdAt: new Date().toISOString() },
];

const INITIAL_LOGS: TaskLog[] = [];

const INITIAL_WISH_REQUESTS: WishRequest[] = [];

const INITIAL_TX: Transaction[] = [];

const getFamilyId = (user: User | null) => user?.familyId || DEFAULT_FAMILY_ID;

const getChildUser = (state: Pick<AppState, 'user' | 'users' | 'activeChildId'>) => {
  if (state.user?.role === 'child') return state.user;
  const familyId = getFamilyId(state.user);
  return (
    state.users.find((u) => u.id === state.activeChildId && u.role === 'child' && u.familyId === familyId) ||
    state.users.find((u) => u.role === 'child' && u.familyId === familyId) ||
    null
  );
};

type PersistedAppState = Pick<
  AppState,
  | 'user'
  | 'users'
  | 'families'
  | 'activeChildId'
  | 'viewRole'
  | 'authStage'
  | 'pendingRole'
  | 'eggs'
  | 'tasks'
  | 'taskLogs'
  | 'wishes'
  | 'wishRequests'
  | 'transactions'
  | 'streak'
>;

const normalizePersistedState = (state: Partial<AppState>, shouldResetProgress: boolean): PersistedAppState => ({
  user: state.user ?? null,
  users: state.users?.length ? state.users : INITIAL_USERS,
  families: state.families?.length ? state.families : INITIAL_FAMILIES,
  activeChildId: state.activeChildId || 'kid-demo',
  viewRole: state.viewRole ?? state.user?.role ?? null,
  authStage: state.authStage ?? (state.user ? 'done' : 'pick'),
  pendingRole: state.pendingRole ?? null,
  eggs: shouldResetProgress ? 0 : state.eggs ?? 0,
  tasks: state.tasks?.length ? state.tasks : INITIAL_TASKS,
  taskLogs: shouldResetProgress ? [] : state.taskLogs ?? [],
  wishes: state.wishes?.length ? state.wishes : INITIAL_WISH_CATALOG,
  wishRequests: shouldResetProgress ? [] : state.wishRequests ?? [],
  transactions: shouldResetProgress ? [] : state.transactions ?? [],
  streak: shouldResetProgress ? 0 : state.streak ?? 0,
});

const snapshotToState = (snapshot: AppSnapshot) => ({
  user: snapshot.user,
  users: snapshot.users,
  families: snapshot.families,
  activeChildId:
    snapshot.user.role === 'child'
      ? snapshot.user.id
      : snapshot.users.find((u) => u.role === 'child' && u.familyId === snapshot.user.familyId)?.id ?? null,
  viewRole: snapshot.user.role,
  authStage: 'done' as const,
  pendingRole: null,
  eggs: snapshot.eggs,
  tasks: snapshot.tasks,
  taskLogs: snapshot.taskLogs,
  wishes: snapshot.wishes,
  wishRequests: snapshot.wishRequests,
  transactions: snapshot.transactions,
  streak: snapshot.streak,
});

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Database request failed';

interface AppState {
  // Auth
  user: User | null;
  users: User[];
  families: Family[];
  activeChildId: string | null;
  viewRole: UserRole | null;
  authStage: 'pick' | 'login' | 'done';
  pendingRole: UserRole | null;

  // Data
  eggs: number;
  tasks: Task[];
  taskLogs: TaskLog[];
  wishes: Wish[];
  wishRequests: WishRequest[];
  transactions: Transaction[];
  streak: number;

  // UI state
  toast: string | null;
  celebrate: { amount: number; taskName: string } | null;
  justEarned: boolean;
  loading: boolean;

  // Actions
  setAuthStage: (stage: 'pick' | 'login' | 'done') => void;
  setPendingRole: (role: UserRole | null) => void;
  login: (username: string, role: UserRole, options?: { familyCode?: string; password?: string }) => void;
  logout: () => void;
  switchRole: () => void;
  setActiveChild: (childId: string) => void;
  refreshFromDb: () => void;

  // Child actions
  logTask: (taskId: string) => void;
  logCustomTask: (taskName: string, emoji: string, suggestedReward: number) => void;
  completeAssignedTask: (logId: string) => void;
  submitWish: (wishId: string) => void;
  submitCustomWish: (name: string, emoji: string, cost: number) => void;

  // Parent actions
  approveTask: (logId: string, amount?: number) => void;
  rejectTask: (logId: string) => void;
  assignTask: (taskId: string, childId: string) => void;
  approveWish: (requestId: string, amount?: number) => void;
  rejectWish: (requestId: string) => void;
  createTask: (data: Omit<Task, 'id' | 'familyId' | 'createdAt'>) => void;
  createWish: (data: Omit<Wish, 'id' | 'familyId' | 'createdAt'>) => void;
  convertWishToNormal: (wishId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteWish: (wishId: string) => void;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id' | 'familyId' | 'createdAt'>>) => void;

  // UI
  showToast: (message: string) => void;
  clearToast: () => void;
  clearCelebrate: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      users: INITIAL_USERS,
      families: INITIAL_FAMILIES,
      activeChildId: 'kid-demo',
      viewRole: null,
      authStage: 'pick',
      pendingRole: null,
      eggs: 0,
      tasks: INITIAL_TASKS,
      taskLogs: INITIAL_LOGS,
      wishes: INITIAL_WISH_CATALOG,
      wishRequests: INITIAL_WISH_REQUESTS,
      transactions: INITIAL_TX,
      streak: 0,
      toast: null,
      celebrate: null,
      justEarned: false,
      loading: false,

      // Auth actions
      setAuthStage: (stage) => set({ authStage: stage }),
      setPendingRole: (role) => set({ pendingRole: role }),

      login: async (username, role, options) => {
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.login({ username, role, password: options?.password, familyCode: options?.familyCode });
          set({ ...snapshotToState(snapshot), loading: false });
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      logout: () => {
        const state = get();
        const role = state.viewRole || state.user?.role || state.pendingRole || 'parent';

        set({
          user: null,
          viewRole: null,
          authStage: 'login',
          pendingRole: role,
          toast: 'Logged out. See you soon!',
        });

        setTimeout(() => set({ toast: null }), 2000);
      },

      switchRole: () => {
        const state = get();
        const newRole = state.viewRole === 'child' ? 'parent' : 'child';
        set({ viewRole: newRole });
        // Auto-refresh to get latest data when switching roles
        const userId = state.user?.id;
        if (userId) {
          set({ loading: true });
          superdinoApi.snapshot(userId).then((snapshot) => {
            set({ ...snapshotToState(snapshot), loading: false, viewRole: newRole });
          }).catch(() => {
            set({ loading: false });
          });
        }
      },

      setActiveChild: (childId) => set({ activeChildId: childId }),

      refreshFromDb: async () => {
        const userId = get().user?.id;
        if (!userId) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.snapshot(userId);
          set({ ...snapshotToState(snapshot), loading: false });
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      // Child actions
      logTask: async (taskId) => {
        const state = get();
        const child = getChildUser(state);
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || !child || task.familyId !== getFamilyId(child)) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.logTask({ userId: child.id, taskId });
          set({
            ...snapshotToState(snapshot),
            loading: false,
            celebrate: snapshot.earned ? { amount: snapshot.earned.amount, taskName: snapshot.earned.taskName } : null,
            justEarned: Boolean(snapshot.earned),
            toast: snapshot.earned ? null : `Logged "${task.name}" — waiting for parent ⏳`,
          });

          setTimeout(() => set({ justEarned: false }), 1500);
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      logCustomTask: async (taskName, emoji, suggestedReward) => {
        const state = get();
        const child = getChildUser(state);
        if (!child) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.logCustomTask({
            userId: child.id,
            taskName,
            emoji,
            suggestedReward,
          });
          set({
            ...snapshotToState(snapshot),
            loading: false,
            toast: `Custom task "${taskName}" sent for approval ⏳`,
          });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      completeAssignedTask: async (logId) => {
        const state = get();
        const child = getChildUser(state);
        if (!child) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.completeAssignedTask({ userId: child.id, logId });
          set({
            ...snapshotToState(snapshot),
            loading: false,
            toast: 'Marked as done — waiting for parent approval ⏳',
          });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      submitWish: async (wishId) => {
        const state = get();
        const child = getChildUser(state);
        const wish = state.wishes.find((w) => w.id === wishId);
        if (!wish || !child || wish.familyId !== getFamilyId(child) || state.eggs < wish.cost) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.submitWish({ userId: child.id, wishId });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Wish sent! A grown-up will check it ✨' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      submitCustomWish: async (name, emoji, cost) => {
        const state = get();
        const child = getChildUser(state);
        if (!child) return;

        set({ loading: true });
        try {
          const snapshot = await superdinoApi.submitCustomWish({
            userId: child.id,
            taskName: name,
            emoji,
            suggestedReward: cost,
          });
          set({ ...snapshotToState(snapshot), loading: false, toast: `New wish "${name}" sent for approval ✨` });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      // Parent actions
      approveTask: async (logId, amount) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.approveTask({ userId: state.user.id, logId, amount });
          set({ ...snapshotToState(snapshot), loading: false, justEarned: true });
          setTimeout(() => set({ justEarned: false }), 1500);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      rejectTask: async (logId) => {
        const userId = get().user?.id;
        if (!userId) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.rejectTask({ userId, logId });
          set({ ...snapshotToState(snapshot), loading: false });
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      assignTask: async (taskId, childId) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.assignTask({ userId: state.user.id, taskId, assignToUserId: childId });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Task assigned to kid 📋' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      approveWish: async (requestId, amount) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.approveWish({ userId: state.user.id, requestId, amount });
          set({ ...snapshotToState(snapshot), loading: false });
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      rejectWish: async (requestId) => {
        const userId = get().user?.id;
        if (!userId) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.rejectWish({ userId, requestId });
          set({ ...snapshotToState(snapshot), loading: false });
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      createTask: async (data) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.createTask({ userId: state.user.id, data });
          set({
            ...snapshotToState(snapshot),
            loading: false,
            toast: `Task "${data.name}" added · ${data.autoApprove ? 'Auto-approved' : 'Approval required'}`,
          });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      createWish: async (data) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.createWish({ userId: state.user.id, data });
          set({ ...snapshotToState(snapshot), loading: false, toast: `Wish "${data.name}" added to catalog ⭐` });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      convertWishToNormal: async (wishId) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.convertWish({ userId: state.user.id, wishId });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Wish converted to catalog ⭐' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      deleteTask: async (taskId) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.deleteTask({ userId: state.user.id, taskId });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Task deleted' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      deleteWish: async (wishId) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.deleteWish({ userId: state.user.id, wishId });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Wish deleted' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      updateTask: async (taskId, data) => {
        const state = get();
        if (!state.user) return;
        set({ loading: true });
        try {
          const snapshot = await superdinoApi.updateTask({ userId: state.user.id, taskId, data });
          set({ ...snapshotToState(snapshot), loading: false, toast: 'Task updated' });
          setTimeout(() => set({ toast: null }), 15000);
        } catch (error) {
          set({ toast: getErrorMessage(error), loading: false });
          setTimeout(() => set({ toast: null }), 15000);
        }
      },

      // UI
      showToast: (message) => {
        set({ toast: message });
        setTimeout(() => set({ toast: null }), 15000);
      },
      clearToast: () => set({ toast: null }),
      clearCelebrate: () => set({ celebrate: null }),
    }),
    {
      name: 'superdino-storage',
      partialize: (state) => ({
        user: state.user,
        users: state.users,
        families: state.families,
        activeChildId: state.activeChildId,
        viewRole: state.viewRole,
        authStage: state.authStage,
        pendingRole: state.pendingRole,
        eggs: state.eggs,
        tasks: state.tasks,
        taskLogs: state.taskLogs,
        wishes: state.wishes,
        wishRequests: state.wishRequests,
        transactions: state.transactions,
        streak: state.streak,
      }),
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<AppState>;
        return normalizePersistedState(state, version < 2);
      },
    }
  )
);
