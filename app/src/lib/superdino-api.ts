import type { Family, Task, Transaction, User, UserRole, Wish, WishRequest, TaskLog } from '@/types';

export interface AppSnapshot {
  user: User;
  users: User[];
  families: Family[];
  tasks: Task[];
  taskLogs: TaskLog[];
  wishes: Wish[];
  wishRequests: WishRequest[];
  transactions: Transaction[];
  eggs: number;
  streak: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/superdino', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || body.error) {
    throw new Error(body.error || 'SuperDino database request failed');
  }

  if (!body.data) {
    throw new Error('SuperDino database returned an empty response');
  }

  return body.data;
}

export const superdinoApi = {
  login: (input: { username: string; role: UserRole; password?: string; familyCode?: string }) =>
    request<AppSnapshot>({ action: 'login', ...input }),

  snapshot: (userId: string) =>
    request<AppSnapshot>({ action: 'snapshot', userId }),

  createTask: (input: { userId: string; data: Omit<Task, 'id' | 'familyId' | 'createdAt'> }) =>
    request<AppSnapshot>({ action: 'createTask', ...input }),

  createWish: (input: { userId: string; data: Omit<Wish, 'id' | 'familyId' | 'createdAt'> }) =>
    request<AppSnapshot>({ action: 'createWish', ...input }),

  submitCustomWish: (input: { userId: string; taskName: string; emoji: string; suggestedReward: number }) =>
    request<AppSnapshot>({ action: 'submitCustomWish', ...input }),

  convertWish: (input: { userId: string; wishId: string }) =>
    request<AppSnapshot>({ action: 'convertWish', ...input }),

  deleteTask: (input: { userId: string; taskId: string }) =>
    request<AppSnapshot>({ action: 'deleteTask', ...input }),

  deleteWish: (input: { userId: string; wishId: string }) =>
    request<AppSnapshot>({ action: 'deleteWish', ...input }),

  updateTask: (input: { userId: string; taskId: string; data: Partial<Omit<Task, 'id' | 'familyId' | 'createdAt'>> }) =>
    request<AppSnapshot>({ action: 'updateTask', ...input }),

  logTask: (input: { userId: string; taskId: string }) =>
    request<AppSnapshot & { earned?: { amount: number; taskName: string } }>({ action: 'logTask', ...input }),

  assignTask: (input: { userId: string; taskId: string; assignToUserId: string }) =>
    request<AppSnapshot>({ action: 'assignTask', ...input }),

  completeAssignedTask: (input: { userId: string; logId: string }) =>
    request<AppSnapshot>({ action: 'completeAssignedTask', ...input }),

  logCustomTask: (input: { userId: string; taskName: string; emoji: string; suggestedReward: number }) =>
    request<AppSnapshot>({ action: 'logCustomTask', ...input }),

  submitWish: (input: { userId: string; wishId: string }) =>
    request<AppSnapshot>({ action: 'submitWish', ...input }),

  approveTask: (input: { userId: string; logId: string; amount?: number }) =>
    request<AppSnapshot>({ action: 'approveTask', ...input }),

  rejectTask: (input: { userId: string; logId: string }) =>
    request<AppSnapshot>({ action: 'rejectTask', ...input }),

  approveWish: (input: { userId: string; requestId: string; amount?: number }) =>
    request<AppSnapshot>({ action: 'approveWish', ...input }),

  rejectWish: (input: { userId: string; requestId: string }) =>
    request<AppSnapshot>({ action: 'rejectWish', ...input }),

  cancelAssignedTask: (input: { userId: string; logId: string }) =>
    request<AppSnapshot>({ action: 'cancelAssignedTask', ...input }),
};
