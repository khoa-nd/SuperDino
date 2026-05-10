import type { GrantedBadge } from '@/types';

export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentWeek(): number {
  const now = new Date();
  const day = now.getDate();
  return Math.min(4, Math.ceil(day / 7));
}

export function getBadgesByMonth(badges: GrantedBadge[]): Map<string, GrantedBadge[]> {
  const map = new Map<string, GrantedBadge[]>();
  for (const badge of badges) {
    const existing = map.get(badge.month) || [];
    existing.push(badge);
    map.set(badge.month, existing);
  }
  return map;
}

export function getMonthsSorted(months: string[]): string[] {
  return months.sort().reverse();
}

export function getBadgeForWeek(badges: GrantedBadge[], week: number): GrantedBadge | undefined {
  return badges.find((b) => b.week === week);
}

export function getUpcomingMonths(fromMonth: string, count: number): string[] {
  const [year, m] = fromMonth.split('-').map(Number);
  const months: string[] = [];
  for (let i = 1; i <= count; i++) {
    const total = year * 12 + (m - 1) + i;
    const y = Math.floor(total / 12);
    const mo = (total % 12) + 1;
    months.push(`${y}-${String(mo).padStart(2, '0')}`);
  }
  return months;
}
