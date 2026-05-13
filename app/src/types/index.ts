// SuperDino Type Definitions

export type UserRole = 'child' | 'parent';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  familyId?: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export type TaskCategory = 'morning' | 'home' | 'school' | 'kind' | 'other';

export interface Task {
  id: string;
  name: string;
  emoji: string;
  reward: number;
  category: TaskCategory;
  autoApprove: boolean;
  color: string;
  familyId: string;
  createdAt: string;
}

export type TaskLogStatus = 'assigned' | 'pending' | 'approved' | 'auto-approved' | 'rejected';

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string;
  status: TaskLogStatus;
  timestamp: string;
  assignedBy?: string;
  task?: Task; // Joined data
}

export type WishCategory = 'normal' | 'other';

export interface Wish {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: WishCategory;
  color: string;
  familyId: string;
  createdAt: string;
}

export type WishRequestStatus = 'pending' | 'approved' | 'rejected';

export interface WishRequest {
  id: string;
  wishId: string;
  userId: string;
  status: WishRequestStatus;
  note?: string;
  timestamp: string;
  wish?: Wish; // Joined data
}

export type TransactionType = 'earn' | 'spend';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  label: string;
  timestamp: string;
}

// App state
export interface AppState {
  user: User | null;
  eggs: number;
  tasks: Task[];
  taskLogs: TaskLog[];
  wishes: Wish[];
  wishRequests: WishRequest[];
  transactions: Transaction[];
  badges: GrantedBadge[];
  streak: number;
}

export interface GrantedBadge {
  id: string;
  childId: string;
  grantedById: string;
  grantedByName: string;
  image: string;
  label: string;
  month: string;
  week: number;
  message: string;
  seen: boolean;
  grantedAt: string;
}

export const BADGE_IMAGES = [
  { file: 'tyrannosaurus-rex.png', name: 'T-Rex' },
  { file: 'triceratops.png', name: 'Triceratops' },
  { file: 'diplodocus.png', name: 'Diplodocus' },
  { file: 'dinosaur.png', name: 'Dinosaur' },
  { file: 'skull.png', name: 'Skull' },
  { file: 'pterodactyl.gif', name: 'Pterodactyl' },
  { file: 'egg.gif', name: 'Egg' },
  { file: 'footprint.gif', name: 'Footprint' },
  { file: 'skull.gif', name: 'Skull' },
] as const;

// Activity item for combined history view
export interface ActivityItem {
  id: string;
  kind: 'task' | 'wish';
  emoji: string;
  color: string;
  title: string;
  timestamp: string;
  status: TaskLogStatus | WishRequestStatus;
  amount: number;
  direction: 'in' | 'out';
}
