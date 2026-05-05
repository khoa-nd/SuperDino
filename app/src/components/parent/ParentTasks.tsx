'use client';

import { useState } from 'react';
import { Card, Egg, EggBadge, Pill, Stamp } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

interface ParentTasksProps {
  onAddTask: () => void;
}

export function ParentTasks({ onAddTask }: ParentTasksProps) {
  const { user, users, tasks, taskLogs, approveTask, rejectTask, assignTask, deleteTask, updateTask, refreshFromDb, loadingAction } = useStore();
  const [tab, setTab] = useState<'pending' | 'assigned' | 'manage'>('pending');
  const [assignChildId, setAssignChildId] = useState<string | null>(null);
  const [eggAmounts, setEggAmounts] = useState<Record<string, number>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editReward, setEditReward] = useState(0);
  const familyId = user?.familyId || 'f1';
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const childName = (userId: string) => linkedKids.find((kid) => kid.id === userId)?.name || 'Kid';

  const pendingLogs = taskLogs.filter((log) => {
    if (log.status !== 'pending') return false;
    const task = familyTasks.find((t) => t.id === log.taskId);
    return task && linkedKidIds.includes(log.userId);
  });

  const assignedLogs = taskLogs.filter((log) => {
    if (log.status !== 'assigned') return false;
    return linkedKidIds.includes(log.userId);
  });

  return (
    <div className="flex flex-col bg-sd-cream">
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="font-display font-bold text-[26px] text-sd-ink leading-none">Tasks</div>
          <div className="font-body text-sm text-sd-ink-soft mt-1">
            {tab === 'pending' ? `Approve (${pendingLogs.length})` : tab === 'assigned' ? 'Assign to kids' : 'Manage catalog'}
          </div>
        </div>
        <button onClick={() => refreshFromDb()} className="border-none bg-sd-green-lt text-sd-green-dk font-display font-bold text-[11px] px-3 py-2 rounded-full cursor-pointer tracking-wider">↻</button>
      </div>

      <div className="px-4 pb-2.5">
        <div className="bg-white rounded-full p-1 flex gap-1 border-2 border-[rgba(20,40,30,0.05)]">
          {([
            { key: 'pending' as const, label: `Pending (${pendingLogs.length})` },
            { key: 'assigned' as const, label: `Assigned (${assignedLogs.length})` },
            { key: 'manage' as const, label: 'Manage' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setAssignChildId(null); }}
              className={`flex-1 border-none cursor-pointer py-2.5 rounded-full font-display font-bold text-sm ${tab === t.key ? 'bg-sd-ink text-white' : 'bg-transparent text-sd-ink-soft'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pending' && (
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {pendingLogs.length === 0 && (
            <Card className="text-center py-5">
              <div className="text-4xl">✨</div>
              <div className="font-display font-bold text-base text-sd-ink mt-1">No pending tasks</div>
              <div className="font-body text-xs text-sd-ink-soft mt-1">Auto-approved tasks reward eggs instantly.</div>
            </Card>
          )}
          {pendingLogs.map((log) => {
            const task = familyTasks.find((t) => t.id === log.taskId);
            if (!task) return null;
            const currentAmount = eggAmounts[log.id] ?? task.reward;
            const inc = () => setEggAmounts((prev) => ({ ...prev, [log.id]: Math.min(50, currentAmount + 1) }));
            const dec = () => setEggAmounts((prev) => ({ ...prev, [log.id]: Math.max(1, currentAmount - 1) }));
            return (
              <div key={log.id} className="bg-white rounded-[22px] p-3.5 border-2 border-[rgba(20,40,30,0.05)] shadow-[0_2px_0_rgba(20,40,30,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-[26px]" style={{ background: task.color }}>{task.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-base text-sd-ink">{task.name}</div>
                    <div className="font-body text-xs text-sd-ink-soft mt-0.5">{childName(log.userId)} · {formatRelativeTime(log.timestamp)}</div>
                  </div>
                  <EggBadge count={`+${task.reward}`} size={14} />
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 mb-1">
                  <div className="flex items-center gap-1 bg-sd-egg-lt rounded-xl px-2 py-1.5">
                    <Egg size={16} />
                    <button onClick={dec} className="border-none bg-white/60 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer font-display font-bold text-base text-sd-egg-dk hover:bg-white transition-colors">−</button>
                    <span className="font-display font-bold text-lg text-sd-egg-dk min-w-[28px] text-center">{currentAmount}</span>
                    <button onClick={inc} className="border-none bg-white/60 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer font-display font-bold text-base text-sd-egg-dk hover:bg-white transition-colors">+</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Stamp color="paper" size="sm" block loading={loadingAction === `reject-task-${log.id}`} onClick={() => rejectTask(log.id)} className="text-sd-coral-dk">✕ Reject</Stamp>
                  <Stamp color="green" size="sm" block loading={loadingAction === `approve-task-${log.id}`} onClick={() => approveTask(log.id, currentAmount)}>
                    ✓ Approve{currentAmount !== task.reward ? ` (${currentAmount > task.reward ? '+' : ''}${currentAmount - task.reward})` : ''}
                  </Stamp>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'assigned' && (
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {assignedLogs.length > 0 && (
            <div className="mb-3">
              <div className="font-display font-bold text-xs text-sd-ink-soft tracking-wider uppercase mb-1.5">Waiting for kid</div>
              {assignedLogs.map((log) => {
                const task = familyTasks.find((t) => t.id === log.taskId);
                if (!task) return null;
                return (
                  <div key={log.id} className="bg-white rounded-[18px] p-3 flex items-center gap-3 border-2 border-[rgba(20,40,30,0.04)] mb-2">
                    <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center text-[22px]" style={{ background: task.color }}>{task.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-sd-ink">{task.name}</div>
                      <div className="font-body text-xs text-sd-ink-soft mt-0.5">{childName(log.userId)} · <Pill variant="egg">⏳ Waiting</Pill></div>
                    </div>
                    <EggBadge count={`+${task.reward}`} size={14} />
                  </div>
                );
              })}
            </div>
          )}

          {linkedKids.length > 0 && (
            <>
              <div className="font-display font-bold text-xs text-sd-ink-soft tracking-wider uppercase mb-1">Assign a task to</div>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {linkedKids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => setAssignChildId(assignChildId === kid.id ? null : kid.id)}
                    className={`border-none cursor-pointer whitespace-nowrap px-3.5 py-2 rounded-full font-display font-bold text-sm ${assignChildId === kid.id ? 'bg-sd-ink text-white' : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]'}`}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>

              {assignChildId && (
                <div className="flex flex-col gap-2">
                  {familyTasks.map((task) => (
                    <Card key={task.id} className="flex items-center gap-3.5 p-3.5">
                      <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center text-[24px]" style={{ background: task.color }}>{task.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-sm text-sd-ink">{task.name}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="font-body text-[11px] text-sd-ink-mute font-semibold capitalize">{task.category}</span>
                          <div className="bg-sd-egg-lt rounded-lg py-0.5 px-2 flex items-center gap-1 font-display font-bold text-xs text-sd-egg-dk"><Egg size={10} /> {task.reward}</div>
                        </div>
                      </div>
                      <Stamp size="sm" color="green" onClick={() => assignTask(task.id, assignChildId)}>Assign</Stamp>
                    </Card>
                  ))}
                </div>
              )}

              {!assignChildId && (
                <Card className="text-center py-4">
                  <div className="text-2xl mb-1">👆</div>
                  <div className="font-display font-bold text-sm text-sd-ink">Select a kid above</div>
                  <div className="font-body text-xs text-sd-ink-soft mt-1">Then tap Assign on a task</div>
                </Card>
              )}
            </>
          )}

          {linkedKids.length === 0 && (
            <Card className="text-center py-4">
              <div className="text-3xl mb-1">🦕</div>
              <div className="font-display font-bold text-sm text-sd-ink">No kids in this family</div>
              <div className="font-body text-xs text-sd-ink-soft mt-1">Add a kid account to assign tasks.</div>
            </Card>
          )}
        </div>
      )}

      {tab === 'manage' && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <Stamp color="coral" block onClick={onAddTask} className="mb-1">+ Add new task</Stamp>
          {familyTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const handleStartEdit = () => { setEditingTaskId(task.id); setEditName(task.name); setEditEmoji(task.emoji); setEditReward(task.reward); };
            const handleSaveEdit = () => { updateTask(task.id, { name: editName.trim() || task.name, emoji: editEmoji || task.emoji, reward: editReward }); setEditingTaskId(null); };

            if (isEditing) {
              return (
                <div key={task.id} className="bg-white rounded-[18px] p-3 flex flex-col gap-2.5 border-2 border-sd-green">
                  <div className="flex items-center gap-3">
                    <input value={editEmoji} onChange={(e) => setEditEmoji(e.target.value)} className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] text-center border-2 border-[rgba(20,40,30,0.1)] bg-sd-cream outline-none focus:border-sd-green" maxLength={4} />
                    <div className="flex-1">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-2 border-[rgba(20,40,30,0.1)] rounded-xl px-3 py-2 font-display font-bold text-sm text-sd-ink outline-none focus:border-sd-green bg-sd-cream" placeholder="Task name" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-sd-egg-lt rounded-xl px-2 py-1.5">
                      <Egg size={14} />
                      <button onClick={() => setEditReward(Math.max(1, editReward - 1))} className="border-none bg-white/60 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer font-display font-bold text-sm text-sd-egg-dk">−</button>
                      <span className="font-display font-bold text-base text-sd-egg-dk min-w-[22px] text-center">{editReward}</span>
                      <button onClick={() => setEditReward(Math.min(50, editReward + 1))} className="border-none bg-white/60 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer font-display font-bold text-sm text-sd-egg-dk">+</button>
                    </div>
                    <div className="flex gap-1.5 ml-auto">
                      <button onClick={() => setEditingTaskId(null)} className="border-none bg-white text-sd-ink-soft font-display font-bold text-[11px] px-3 py-1.5 rounded-full cursor-pointer shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]">Cancel</button>
                      <button onClick={handleSaveEdit} className="border-none bg-sd-green text-white font-display font-bold text-[11px] px-3 py-1.5 rounded-full cursor-pointer">Save</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={task.id} className="bg-white rounded-[18px] p-3 flex items-center gap-3 border-2 border-[rgba(20,40,30,0.04)]">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px]" style={{ background: task.color }}>{task.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm text-sd-ink">{task.name}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="font-body text-[11px] text-sd-ink-mute font-semibold capitalize">{task.category}</span>
                    {task.autoApprove ? <Pill variant="green">⚡ Auto</Pill> : <Pill variant="coral">👤 Approval</Pill>}
                    {task.category === 'other' && <Pill variant="coral">Custom</Pill>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-sd-egg-lt rounded-xl py-1.5 px-2.5 flex items-center gap-1 font-display font-bold text-sm text-sd-egg-dk"><Egg size={14} /> {task.reward}</div>
                  <button onClick={handleStartEdit} className="border-none bg-transparent text-sd-ink-mute cursor-pointer w-7 h-7 rounded-full flex items-center justify-center hover:bg-sd-sky-lt hover:text-sd-sky-dk transition-colors text-sm" title="Edit task">✏️</button>
                  <button onClick={() => deleteTask(task.id)} className="border-none bg-transparent text-sd-ink-mute cursor-pointer w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors text-lg" title="Delete task">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
