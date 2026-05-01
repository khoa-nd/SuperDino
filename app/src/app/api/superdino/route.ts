import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';
import { createHash } from 'crypto';
import type { Family, Task, TaskCategory, TaskLog, TaskLogStatus, Transaction, User, UserRole, Wish, WishCategory, WishRequest, WishRequestStatus } from '@/types';

export const dynamic = 'force-dynamic';

const STARTER_TASKS: Omit<Task, 'id' | 'familyId' | 'createdAt'>[] = [
  { name: 'Brush teeth', emoji: '🦷', reward: 2, category: 'morning', autoApprove: true, color: 'oklch(0.92 0.06 240)' },
  { name: 'Make my bed', emoji: '🛏️', reward: 3, category: 'morning', autoApprove: true, color: 'oklch(0.94 0.06 90)' },
  { name: 'Read 20 minutes', emoji: '📚', reward: 5, category: 'school', autoApprove: false, color: 'oklch(0.93 0.07 30)' },
  { name: 'Feed the dog', emoji: '🐶', reward: 4, category: 'home', autoApprove: true, color: 'oklch(0.93 0.07 60)' },
  { name: 'Tidy my room', emoji: '🧹', reward: 6, category: 'home', autoApprove: false, color: 'oklch(0.93 0.06 145)' },
  { name: 'Help with dinner', emoji: '🥗', reward: 4, category: 'kind', autoApprove: false, color: 'oklch(0.92 0.07 145)' },
  { name: 'Practice piano', emoji: '🎵', reward: 5, category: 'school', autoApprove: false, color: 'oklch(0.93 0.06 280)' },
  { name: 'Be kind to bro', emoji: '💚', reward: 3, category: 'kind', autoApprove: true, color: 'oklch(0.93 0.07 30)' },
];

const STARTER_WISHES: Omit<Wish, 'id' | 'familyId' | 'createdAt'>[] = [
  { name: 'Movie night', emoji: '🎬', cost: 12, category: 'normal', color: 'oklch(0.92 0.07 280)' },
  { name: 'Ice cream trip', emoji: '🍦', cost: 8, category: 'normal', color: 'oklch(0.94 0.07 30)' },
  { name: 'New book', emoji: '📖', cost: 20, category: 'normal', color: 'oklch(0.92 0.07 145)' },
  { name: 'Park playdate', emoji: '🛝', cost: 15, category: 'normal', color: 'oklch(0.93 0.07 90)' },
  { name: 'Stay up late', emoji: '🌙', cost: 10, category: 'normal', color: 'oklch(0.92 0.06 240)' },
  { name: 'Pick dinner', emoji: '🍕', cost: 6, category: 'normal', color: 'oklch(0.94 0.07 60)' },
];

type DbFamily = { id: string; name: string; code: string; created_at: string };
type DbProfile = { id: string; username: string; name: string; role: UserRole; family_id: string | null; password_hash: string | null; created_at: string };
type DbTask = { id: string; name: string; emoji: string; reward: number; category: TaskCategory; auto_approve: boolean; color: string; family_id: string; created_at: string };
type DbWish = { id: string; name: string; emoji: string; cost: number; category?: WishCategory; color: string; family_id: string; created_at: string };
type DbTaskLog = { id: string; task_id: string; user_id: string; status: TaskLogStatus; timestamp: string };
type DbWishRequest = { id: string; wish_id: string; user_id: string; status: WishRequestStatus; timestamp: string };
type DbTransaction = { id: string; user_id: string; type: 'earn' | 'spend'; amount: number; label: string; timestamp: string };

type RequestPayload = {
  action?: string;
  userId?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  familyCode?: string;
  taskId?: string;
  wishId?: string;
  logId?: string;
  requestId?: string;
  assignToUserId?: string;
  taskName?: string;
  emoji?: string;
  suggestedReward?: number;
  amount?: number;
  data?: Partial<Task & Wish>;
};

const id = () => `${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;

const hashPassword = (password: string, username: string) =>
  createHash('sha256').update(`superdino-${username}-${password}`).digest('hex');

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const getChildBalance = async (db: ReturnType<typeof createSupabaseAdmin>, userId: string): Promise<number> => {
  const { data, error } = await db
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, tx) => sum + (tx.type === 'earn' ? tx.amount : -tx.amount), 0);
};

const toNiceName = (username: string) =>
  username
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Friend';

const createFamilyCode = (familyId: string) =>
  `DINO-${familyId.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase() || 'FAM'}`;

const mapFamily = (family: DbFamily): Family => ({
  id: family.id,
  name: family.name,
  code: family.code,
  createdAt: family.created_at,
});

const mapUser = (user: DbProfile): User => ({
  id: user.id,
  username: user.username,
  name: user.name,
  role: user.role,
  familyId: user.family_id || undefined,
  createdAt: user.created_at,
});

const mapTask = (task: DbTask): Task => ({
  id: task.id,
  name: task.name,
  emoji: task.emoji,
  reward: task.reward,
  category: task.category,
  autoApprove: task.auto_approve,
  color: task.color,
  familyId: task.family_id,
  createdAt: task.created_at,
});

const mapWish = (wish: DbWish): Wish => ({
  id: wish.id,
  name: wish.name,
  emoji: wish.emoji,
  cost: wish.cost,
  category: wish.category || 'normal',
  color: wish.color,
  familyId: wish.family_id,
  createdAt: wish.created_at,
});

const mapTaskLog = (log: DbTaskLog): TaskLog => ({
  id: log.id,
  taskId: log.task_id,
  userId: log.user_id,
  status: log.status,
  timestamp: log.timestamp,
});

const mapWishRequest = (request: DbWishRequest): WishRequest => ({
  id: request.id,
  wishId: request.wish_id,
  userId: request.user_id,
  status: request.status,
  timestamp: request.timestamp,
});

const mapTransaction = (transaction: DbTransaction): Transaction => ({
  id: transaction.id,
  userId: transaction.user_id,
  type: transaction.type,
  amount: transaction.amount,
  label: transaction.label,
  timestamp: transaction.timestamp,
});

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getSingle<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>, message: string) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data) throw new Error(message);
  return data;
}

async function ensureDefaultFamily(db: ReturnType<typeof createSupabaseAdmin>) {
  await db.from('families').upsert({ id: 'f1', name: 'Dino Family', code: 'DINO-F1' }, { onConflict: 'id' });
  await db.from('profiles').upsert([
    { id: 'parent-demo', username: 'parent', name: 'Parent', role: 'parent', family_id: 'f1' },
    { id: 'kid-demo', username: 'mia', name: 'Mia', role: 'child', family_id: 'f1' },
  ], { onConflict: 'username,role' });

  const { count } = await db.from('tasks').select('id', { count: 'exact', head: true }).eq('family_id', 'f1');
  if (!count) {
    await db.from('tasks').insert(STARTER_TASKS.map((task, index) => ({
      id: `t${index + 1}`,
      name: task.name,
      emoji: task.emoji,
      reward: task.reward,
      category: task.category,
      auto_approve: task.autoApprove,
      color: task.color,
      family_id: 'f1',
    })));
    await db.from('wishes').insert(STARTER_WISHES.map((wish, index) => ({
      id: `w${index + 1}`,
      name: wish.name,
      emoji: wish.emoji,
      cost: wish.cost,
      category: wish.category,
      color: wish.color,
      family_id: 'f1',
    })));
  }
}

async function seedCatalog(db: ReturnType<typeof createSupabaseAdmin>, familyId: string) {
  await db.from('tasks').insert(STARTER_TASKS.map((task) => ({
    id: id(),
    name: task.name,
    emoji: task.emoji,
    reward: task.reward,
    category: task.category,
    auto_approve: task.autoApprove,
    color: task.color,
    family_id: familyId,
  })));

  await db.from('wishes').insert(STARTER_WISHES.map((wish) => ({
    id: id(),
    name: wish.name,
    emoji: wish.emoji,
    cost: wish.cost,
    category: wish.category,
    color: wish.color,
    family_id: familyId,
  })));
}

async function buildSnapshot(db: ReturnType<typeof createSupabaseAdmin>, userId: string) {
  const userRow = await getSingle<DbProfile>(
    db.from('profiles').select('*').eq('id', userId).single(),
    'User not found'
  );
  const familyId = userRow.family_id;
  if (!familyId) throw new Error('User is not linked to a family');

  const [
    familiesRes,
    usersRes,
    tasksRes,
    wishesRes,
    logsRes,
    requestsRes,
    transactionsRes,
  ] = await Promise.all([
    db.from('families').select('*').eq('id', familyId),
    db.from('profiles').select('*').eq('family_id', familyId),
    db.from('tasks').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
    db.from('wishes').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
    db.from('task_logs').select('*').order('timestamp', { ascending: false }),
    db.from('wish_requests').select('*').order('timestamp', { ascending: false }),
    db.from('transactions').select('*').order('timestamp', { ascending: false }),
  ]);

  for (const result of [familiesRes, usersRes, tasksRes, wishesRes, logsRes, requestsRes, transactionsRes]) {
    if (result.error) throw new Error(result.error.message);
  }

  const users = (usersRes.data || []) as DbProfile[];
  const familyUserIds = users.map((user) => user.id);
  const transactions = ((transactionsRes.data || []) as DbTransaction[]).filter((transaction) => familyUserIds.includes(transaction.user_id));
  const taskLogs = ((logsRes.data || []) as DbTaskLog[]).filter((log) => familyUserIds.includes(log.user_id));
  const wishRequests = ((requestsRes.data || []) as DbWishRequest[]).filter((request) => familyUserIds.includes(request.user_id));

  return {
    user: mapUser(userRow),
    users: users.map(mapUser),
    families: ((familiesRes.data || []) as DbFamily[]).map(mapFamily),
    tasks: ((tasksRes.data || []) as DbTask[]).map(mapTask),
    taskLogs: taskLogs.map(mapTaskLog),
    wishes: ((wishesRes.data || []) as DbWish[]).map(mapWish),
    wishRequests: wishRequests.map(mapWishRequest),
    transactions: transactions.map(mapTransaction),
    eggs: transactions.reduce((sum, transaction) => sum + (transaction.type === 'earn' ? transaction.amount : -transaction.amount), 0),
    streak: 0,
  };
}

async function login(db: ReturnType<typeof createSupabaseAdmin>, payload: RequestPayload) {
  if (!payload.username?.trim() || !payload.role) throw new Error('Username and role are required');

  const username = normalizeUsername(payload.username);
  const name = toNiceName(payload.username);
  const { data: existingUser, error } = await db
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('role', payload.role)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const profile = existingUser as DbProfile | null;

  // Password check
  if (profile?.password_hash) {
    if (!payload.password?.trim()) throw new Error('Password is required');
    const providedHash = hashPassword(payload.password, username);
    if (providedHash !== profile.password_hash) throw new Error('Invalid password');
  }

  let familyId = profile?.family_id || null;

  if (payload.role === 'parent' && !familyId) {
    if (payload.familyCode?.trim()) {
      // Join existing family
      const family = await getSingle<DbFamily>(
        db.from('families').select('*').ilike('code', payload.familyCode.trim()).single(),
        'Family code not found'
      );
      familyId = family.id;
    } else {
      // Create new family
      familyId = id();
      await db.from('families').insert({ id: familyId, name: `${name}'s family`, code: createFamilyCode(familyId) });
      await seedCatalog(db, familyId);
    }
  }

  if (payload.role === 'child') {
    if (!familyId) {
      if (!payload.familyCode?.trim()) throw new Error('Family code is required for new kid accounts');
      const family = await getSingle<DbFamily>(
        db.from('families').select('*').ilike('code', payload.familyCode.trim()).single(),
        'Family code not found'
      );
      familyId = family.id;
    }
  }

  // Require password for new users
  if (!profile && !payload.password?.trim()) throw new Error('Password is required to create an account');

  const userId = profile?.id || id();
  const upsertData: Record<string, unknown> = {
    id: userId,
    username,
    name,
    role: payload.role,
    family_id: familyId,
  };
  if (!profile) {
    upsertData.password_hash = hashPassword(payload.password!, username);
  }
  const upserted = await getSingle<DbProfile>(
    db.from('profiles')
      .upsert(upsertData, { onConflict: 'username,role' })
      .select()
      .single(),
    'Unable to save user'
  );

  return buildSnapshot(db, upserted.id);
}

export async function POST(request: Request) {
  let db: ReturnType<typeof createSupabaseAdmin>;

  try {
    db = createSupabaseAdmin();
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Supabase is not configured', 500);
  }

  try {
    await ensureDefaultFamily(db);

    const payload = (await request.json()) as RequestPayload;
    const action = payload.action;

    if (action === 'login') {
      const snapshot = await login(db, payload);
      return NextResponse.json({ data: snapshot });
    }

    if (!payload.userId) throw new Error('userId is required');

    if (action === 'snapshot') {
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    const snapshot = await buildSnapshot(db, payload.userId);
    const familyId = snapshot.user.familyId;
    if (!familyId) throw new Error('User is not linked to a family');

    if (action === 'createTask') {
      if (!payload.data?.name || !payload.data.emoji || !payload.data.category) throw new Error('Task data is incomplete');
      await db.from('tasks').insert({
        id: id(),
        name: payload.data.name,
        emoji: payload.data.emoji,
        reward: payload.data.reward || 0,
        category: payload.data.category,
        auto_approve: Boolean(payload.data.autoApprove),
        color: payload.data.color || 'oklch(0.92 0.08 145)',
        family_id: familyId,
      });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'createWish') {
      if (!payload.data?.name || !payload.data.emoji) throw new Error('Wish data is incomplete');
      await db.from('wishes').insert({
        id: id(),
        name: payload.data.name,
        emoji: payload.data.emoji,
        cost: payload.data.cost || 0,
        category: (payload.data as Wish).category || 'normal',
        color: payload.data.color || 'oklch(0.92 0.06 240)',
        family_id: familyId,
      });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'submitCustomWish') {
      if (!payload.taskName?.trim() || !payload.emoji) throw new Error('Wish name and emoji are required');
      const cost = Math.max(1, Math.min(50, Number(payload.suggestedReward) || 5));
      const customWishId = id();
      await db.from('wishes').insert({
        id: customWishId,
        name: payload.taskName.trim(),
        emoji: payload.emoji,
        cost,
        category: 'other',
        color: 'oklch(0.92 0.06 280)',
        family_id: familyId,
      });
      await db.from('wish_requests').insert({
        id: id(),
        wish_id: customWishId,
        user_id: payload.userId,
        status: 'pending',
      });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'convertWish') {
      if (!payload.wishId) throw new Error('wishId is required');
      await db.from('wishes').update({ category: 'normal' }).eq('id', payload.wishId);
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'logCustomTask') {
      if (!payload.taskName?.trim() || !payload.emoji) throw new Error('Task name and emoji are required');
      const reward = Math.max(1, Math.min(10, Number(payload.suggestedReward) || 3));
      const customTaskId = id();
      await db.from('tasks').insert({
        id: customTaskId,
        name: payload.taskName.trim(),
        emoji: payload.emoji,
        reward,
        category: 'other',
        auto_approve: false,
        color: 'oklch(0.92 0.06 280)',
        family_id: familyId,
      });
      await db.from('task_logs').insert({
        id: id(),
        task_id: customTaskId,
        user_id: payload.userId,
        status: 'pending',
      });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'assignTask') {
      if (!payload.taskId || !payload.assignToUserId) throw new Error('taskId and assignToUserId are required');
      const task = snapshot.tasks.find((item) => item.id === payload.taskId);
      if (!task) throw new Error('Task not found in this family');
      await db.from('task_logs').insert({
        id: id(),
        task_id: task.id,
        user_id: payload.assignToUserId,
        status: 'assigned',
      });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'completeAssignedTask') {
      if (!payload.logId) throw new Error('logId is required');
      const log = snapshot.taskLogs.find((item) => item.id === payload.logId);
      if (!log || log.status !== 'assigned') throw new Error('Task log not found or not assigned');
      await db.from('task_logs').update({ status: 'pending' }).eq('id', payload.logId);
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'logTask') {
      if (!payload.taskId) throw new Error('taskId is required');
      const task = snapshot.tasks.find((item) => item.id === payload.taskId);
      if (!task) throw new Error('Task not found in this family');
      const logStatus = task.autoApprove ? 'auto-approved' : 'pending';
      await db.from('task_logs').insert({ id: id(), task_id: task.id, user_id: payload.userId, status: logStatus });
      if (task.autoApprove) {
        await db.from('transactions').insert({ id: id(), user_id: payload.userId, type: 'earn', amount: task.reward, label: task.name });
      }
      return NextResponse.json({
        data: {
          ...await buildSnapshot(db, payload.userId),
          earned: task.autoApprove ? { amount: task.reward, taskName: task.name } : undefined,
        },
      });
    }

    if (action === 'submitWish') {
      if (!payload.wishId) throw new Error('wishId is required');
      const wish = snapshot.wishes.find((item) => item.id === payload.wishId);
      if (!wish) throw new Error('Wish not found in this family');
      const childBalance = await getChildBalance(db, payload.userId);
      if (childBalance < wish.cost) throw new Error(`Not enough eggs — you have ${childBalance}, need ${wish.cost}`);
      await db.from('wish_requests').insert({ id: id(), wish_id: wish.id, user_id: payload.userId, status: 'pending' });
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'approveTask' || action === 'rejectTask') {
      if (!payload.logId) throw new Error('logId is required');
      const status = action === 'approveTask' ? 'approved' : 'rejected';
      await db.from('task_logs').update({ status }).eq('id', payload.logId);
      if (action === 'approveTask') {
        const log = snapshot.taskLogs.find((item) => item.id === payload.logId);
        const task = log ? snapshot.tasks.find((item) => item.id === log.taskId) : null;
        if (log && task) {
          const reward = payload.amount != null ? Number(payload.amount) : task.reward;
          await db.from('transactions').insert({ id: id(), user_id: log.userId, type: 'earn', amount: reward, label: task.name });
        }
      }
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    if (action === 'approveWish' || action === 'rejectWish') {
      if (!payload.requestId) throw new Error('requestId is required');
      const status = action === 'approveWish' ? 'approved' : 'rejected';
      await db.from('wish_requests').update({ status }).eq('id', payload.requestId);
      if (action === 'approveWish') {
        const wishRequest = snapshot.wishRequests.find((item) => item.id === payload.requestId);
        const wish = wishRequest ? snapshot.wishes.find((item) => item.id === wishRequest.wishId) : null;
        if (wishRequest && wish) {
          const amount = payload.amount != null ? Number(payload.amount) : wish.cost;
          const childBalance = await getChildBalance(db, wishRequest.userId);
          if (childBalance < amount) {
            throw new Error(`Child only has ${childBalance} eggs — not enough (needs ${amount})`);
          }
          await db.from('transactions').insert({ id: id(), user_id: wishRequest.userId, type: 'spend', amount, label: wish.name });
        }
      }
      return NextResponse.json({ data: await buildSnapshot(db, payload.userId) });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected database error', 500);
  }
}
