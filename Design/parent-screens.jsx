// Parent-side screens for SuperDino — v2

function ParentTabBar({ tab, onTab }) {
  const items = [
    { k: 'home',    label: 'Inbox',   icon: '📥' },
    { k: 'tasks',   label: 'Tasks',   icon: '✅' },
    { k: 'wishes',  label: 'Wishes',  icon: '⭐' },
    { k: 'history', label: 'History', icon: '📊' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around',
      background: '#fff', borderTop: `2px solid ${SD.coralLt}`,
      padding: '8px 6px 6px',
    }}>
      {items.map(it => {
        const active = tab === it.k;
        return (
          <button key={it.k} onClick={() => onTab(it.k)} style={{
            flex: 1, border: 'none', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '4px 0', cursor: 'pointer',
            color: active ? SD.coralDk : SD.inkMute,
            fontFamily: FONTS.display, fontWeight: 700, fontSize: 11,
          }}>
            <div style={{
              width: 44, height: 30, borderRadius: 14,
              background: active ? SD.coralLt : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{it.icon}</div>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Parent Inbox / Dashboard ────────────────────────────
// Only shows tasks that are pending AND require parent approval (not auto-approved)
function ParentDashboard({ state, onApproveTask, onRejectTask, onApproveWish, onRejectWish, onSwitchRole, onTab }) {
  // Tasks that need approval: pending logs whose task is NOT auto-approved
  const pendingLogs = state.logs.filter(l => {
    if (l.status !== 'pending') return false;
    const t = state.tasks.find(x => x.id === l.taskId);
    return t && !t.autoApprove;
  });
  const pendingWishes = state.wishes.filter(w => w.status === 'pending');

  const earnedToday = state.transactions
    .filter(t => t.type === 'earn' && t.when === 'Today')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <div style={{ padding: '14px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={state.user.name?.[0] || 'P'} color={SD.skyDk} size={36}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, fontWeight: 600 }}>Parent mode</div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: SD.ink }}>{state.user.name || 'Parent'}'s family</div>
        </div>
        <button onClick={onSwitchRole} style={{
          border: 'none', background: SD.greenLt, color: SD.greenDk,
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 11,
          padding: '8px 12px', borderRadius: 100, cursor: 'pointer', letterSpacing: 0.5,
        }}>👶 KID</button>
      </div>

      <div style={{ padding: '0 18px' }}>
        <div style={{
          background: `linear-gradient(160deg, ${SD.coralLt} 0%, oklch(0.90 0.10 30) 100%)`,
          borderRadius: 26, padding: '16px 18px',
          boxShadow: '0 4px 0 oklch(0.80 0.13 30), 0 10px 24px rgba(120,40,40,0.08)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: SD.coralDk,
          }}>{pendingLogs.length + pendingWishes.length}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: SD.ink }}>
              {pendingLogs.length + pendingWishes.length} waiting
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.coralDk, marginTop: 2, fontWeight: 600 }}>
              {pendingLogs.length} task{pendingLogs.length !== 1 && 's'} · {pendingWishes.length} wish{pendingWishes.length !== 1 && 'es'}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: '8px 10px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color: SD.greenDk, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <Egg size={16}/> +{earnedToday}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 10, color: SD.inkSoft, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Today</div>
          </div>
        </div>
      </div>

      <SectionTitle right={pendingLogs.length > 2 && <a onClick={() => onTab('tasks')} style={{
        fontFamily: FONTS.display, fontSize: 13, color: SD.coralDk, fontWeight: 700, cursor: 'pointer',
      }}>All ({pendingLogs.length}) ›</a>}>Tasks to approve</SectionTitle>

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pendingLogs.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 18 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>🎉</div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink }}>All caught up!</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 2 }}>
              No tasks waiting for approval.
            </div>
          </Card>
        )}
        {pendingLogs.slice(0, 3).map(log => {
          const t = state.tasks.find(x => x.id === log.taskId);
          if (!t) return null;
          return (
            <ApprovalCard key={log.id}
              icon={t.emoji} iconBg={t.color || SD.greenLt}
              title={t.name} subtitle={`${state.kidName || 'Mia'} · ${log.when}`}
              meta={<EggBadge count={`+${t.reward}`} size={14}/>}
              onApprove={() => onApproveTask(log.id)}
              onReject={() => onRejectTask(log.id)}
              approveColor={SD.green}/>
          );
        })}
      </div>

      <SectionTitle right={pendingWishes.length > 2 && <a onClick={() => onTab('wishes')} style={{
        fontFamily: FONTS.display, fontSize: 13, color: SD.coralDk, fontWeight: 700, cursor: 'pointer',
      }}>All ›</a>}>Wishes to grant</SectionTitle>

      <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pendingWishes.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 14 }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft }}>No wishes pending.</div>
          </Card>
        )}
        {pendingWishes.map(w => (
          <ApprovalCard key={w.id}
            icon={w.emoji} iconBg={w.color}
            title={w.name} subtitle={`${state.kidName || 'Mia'} · ${w.when || 'Just now'}`}
            meta={<EggBadge count={w.cost} size={14}/>}
            onApprove={() => onApproveWish(w.id)}
            onReject={() => onRejectWish(w.id)}
            approveColor={SD.coral}/>
        ))}
      </div>
    </div>
  );
}

function ApprovalCard({ icon, iconBg, title, subtitle, meta, onApprove, onReject, approveColor }) {
  const [acting, setActing] = React.useState(null);
  const handle = (action, fn) => { setActing(action); setTimeout(fn, 280); };
  return (
    <div style={{
      background: '#fff', borderRadius: 22, padding: 14,
      border: '2px solid rgba(20,40,30,0.05)',
      boxShadow: '0 2px 0 rgba(20,40,30,0.05)',
      transform: acting ? 'scale(0.96)' : 'scale(1)',
      opacity: acting ? 0 : 1,
      transition: 'transform 220ms ease, opacity 220ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 50, height: 50, borderRadius: 16, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: SD.ink }}>{title}</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 2 }}>{subtitle}</div>
        </div>
        {meta}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Stamp color={SD.paper} text={SD.coralDk} size="sm" block onClick={() => handle('reject', onReject)}>
          ✕  Reject
        </Stamp>
        <Stamp color={approveColor} size="sm" block onClick={() => handle('approve', onApprove)}>
          ✓  Approve
        </Stamp>
      </div>
    </div>
  );
}

// ─── Parent: Manage tasks ────────────────────────────────
function ParentTasks({ state, onApproveTask, onRejectTask, onAddTask, onSwitchRole }) {
  const [tab, setTab] = React.useState('pending');
  const pendingLogs = state.logs.filter(l => {
    if (l.status !== 'pending') return false;
    const t = state.tasks.find(x => x.id === l.taskId);
    return t && !t.autoApprove;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <ScreenHeader title="Tasks" subtitle="Approve and manage" onSwitchRole={onSwitchRole} parentMode/>
      <div style={{ padding: '0 18px 10px' }}>
        <div style={{
          background: '#fff', borderRadius: 100, padding: 4, display: 'flex', gap: 4,
          border: '2px solid rgba(20,40,30,0.05)',
        }}>
          {[{ k: 'pending', l: `Pending (${pendingLogs.length})` }, { k: 'manage', l: 'Manage' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, border: 'none', cursor: 'pointer',
              background: tab === t.k ? SD.ink : 'transparent',
              color: tab === t.k ? '#fff' : SD.inkSoft,
              padding: '10px 0', borderRadius: 100,
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 13,
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {tab === 'pending' && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingLogs.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 22 }}>
              <div style={{ fontSize: 36 }}>✨</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: SD.ink, marginTop: 4 }}>No pending tasks</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 4 }}>
                Auto-approved tasks reward eggs instantly.
              </div>
            </Card>
          )}
          {pendingLogs.map(log => {
            const t = state.tasks.find(x => x.id === log.taskId);
            if (!t) return null;
            return (
              <ApprovalCard key={log.id}
                icon={t.emoji} iconBg={t.color || SD.greenLt}
                title={t.name} subtitle={`${state.kidName || 'Mia'} · ${log.when}`}
                meta={<EggBadge count={`+${t.reward}`} size={14}/>}
                onApprove={() => onApproveTask(log.id)}
                onReject={() => onRejectTask(log.id)}
                approveColor={SD.green}/>
            );
          })}
        </div>
      )}

      {tab === 'manage' && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.tasks.map(t => (
            <div key={t.id} style={{
              background: '#fff', borderRadius: 18, padding: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              border: '2px solid rgba(20,40,30,0.04)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: t.color || SD.greenLt,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{t.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute, fontWeight: 600, textTransform: 'capitalize' }}>{t.category}</span>
                  {t.autoApprove
                    ? <Pill color={SD.greenLt} text={SD.greenDk}>⚡ Auto</Pill>
                    : <Pill color={SD.coralLt} text={SD.coralDk}>👤 Approval</Pill>}
                </div>
              </div>
              <div style={{
                background: SD.eggLt, borderRadius: 12, padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.eggDk,
              }}>
                <Egg size={14}/> {t.reward}
              </div>
            </div>
          ))}
          <Stamp color={SD.coral} block onClick={onAddTask} style={{ marginTop: 8 }}>
            + Add new task
          </Stamp>
        </div>
      )}
    </div>
  );
}

// ─── Parent: Wishes (Pending + Catalog manage) ───────────
function ParentWishes({ state, onApproveWish, onRejectWish, onAddWish, onSwitchRole }) {
  const [tab, setTab] = React.useState('pending');
  const pendingW = state.wishes.filter(w => w.status === 'pending');
  const historyW = state.wishes.filter(w => w.status !== 'pending');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <ScreenHeader title="Wishes" subtitle="Review requests & set rewards" onSwitchRole={onSwitchRole} parentMode/>

      <div style={{ padding: '0 18px 10px' }}>
        <div style={{
          background: '#fff', borderRadius: 100, padding: 4, display: 'flex', gap: 4,
          border: '2px solid rgba(20,40,30,0.05)',
        }}>
          {[
            { k: 'pending', l: `Pending (${pendingW.length})` },
            { k: 'catalog', l: 'Catalog' },
            { k: 'history', l: 'History' },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, border: 'none', cursor: 'pointer',
              background: tab === t.k ? SD.ink : 'transparent',
              color: tab === t.k ? '#fff' : SD.inkSoft,
              padding: '10px 0', borderRadius: 100,
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 12,
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {tab === 'pending' && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingW.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 22 }}>
              <div style={{ fontSize: 36 }}>💫</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: SD.ink, marginTop: 4 }}>No wishes pending</div>
            </Card>
          )}
          {pendingW.map(w => (
            <ApprovalCard key={w.id}
              icon={w.emoji} iconBg={w.color}
              title={w.name} subtitle={`${state.kidName || 'Mia'} · ${w.when || 'Just now'}`}
              meta={<EggBadge count={w.cost} size={14}/>}
              onApprove={() => onApproveWish(w.id)}
              onReject={() => onRejectWish(w.id)}
              approveColor={SD.coral}/>
          ))}
        </div>
      )}

      {tab === 'catalog' && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft,
            background: SD.skyLt, padding: '10px 14px', borderRadius: 14,
            marginBottom: 4,
          }}>
            Set the rewards your kid can wish for. Tap to edit price.
          </div>
          {state.wishCatalog.map(w => (
            <div key={w.id} style={{
              background: '#fff', borderRadius: 18, padding: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              border: '2px solid rgba(20,40,30,0.04)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: w.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{w.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink }}>{w.name}</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute, marginTop: 2 }}>
                  Reward set by you
                </div>
              </div>
              <div style={{
                background: SD.eggLt, borderRadius: 12, padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.eggDk,
              }}>
                <Egg size={14}/> {w.cost}
              </div>
            </div>
          ))}
          <Stamp color={SD.coral} block onClick={onAddWish} style={{ marginTop: 8 }}>
            + Add new wish
          </Stamp>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {historyW.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 18 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft }}>
                No wishes processed yet.
              </div>
            </Card>
          )}
          {historyW.map(w => (
            <div key={w.id} style={{
              background: '#fff', borderRadius: 18, padding: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              border: '2px solid rgba(20,40,30,0.04)',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14, background: w.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{w.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink }}>{w.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <EggBadge count={w.cost} size={12}/>
                  <StatusPill status={w.status}/>
                </div>
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute }}>{w.when}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Parent: History ─────────────────────────────────────
function ParentHistory({ state, onSwitchRole }) {
  const [tab, setTab] = React.useState('all');
  const items = [
    ...state.logs.map(l => {
      const t = state.tasks.find(x => x.id === l.taskId) || {};
      return { ...l, kind: 'task', name: t.name || 'Task', emoji: t.emoji || '✓', amount: t.reward || 0, color: t.color };
    }),
    ...state.wishes.filter(w => w.status !== 'pending').map(w => ({
      id: 'w' + w.id, kind: 'wish', name: w.name, emoji: w.emoji, amount: w.cost, status: w.status, when: w.when || 'Today', color: w.color,
    })),
  ];
  const filtered = tab === 'all' ? items : items.filter(i => i.kind === tab.slice(0, -1));

  const totalEarned = state.transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const totalSpent  = state.transactions.filter(t => t.type === 'spend').reduce((s, t) => s + t.amount, 0);
  const tasksDone = state.logs.filter(l => l.status === 'approved' || l.status === 'auto-approved').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <ScreenHeader title="History" subtitle="The whole story" onSwitchRole={onSwitchRole} parentMode/>
      <div style={{ padding: '0 18px 4px', display: 'flex', gap: 8 }}>
        <StatTile label="Tasks done" value={tasksDone} color={SD.greenDk} bg={SD.greenLt}/>
        <StatTile label="Earned" value={`+${totalEarned}`} color={SD.eggDk} bg={SD.eggLt} icon/>
        <StatTile label="Spent"  value={`−${totalSpent}`} color={SD.coralDk} bg={SD.coralLt} icon/>
      </div>
      <div style={{ padding: '12px 18px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[{ k: 'all', l: 'All' }, { k: 'tasks', l: '✅ Tasks' }, { k: 'wishes', l: '⭐ Wishes' }].map(f => (
          <button key={f.k} onClick={() => setTab(f.k)} style={{
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: tab === f.k ? SD.ink : '#fff',
            color: tab === f.k ? '#fff' : SD.ink,
            padding: '8px 14px', borderRadius: 100,
            fontFamily: FONTS.display, fontWeight: 700, fontSize: 13,
            boxShadow: tab === f.k ? 'none' : 'inset 0 0 0 2px rgba(20,40,30,0.06)',
          }}>{f.l}</button>
        ))}
      </div>
      <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(it => (
          <div key={it.kind + it.id} style={{
            background: '#fff', borderRadius: 18, padding: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            border: '2px solid rgba(20,40,30,0.04)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, background: it.color || SD.greenLt,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>{it.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: FONTS.body, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  color: it.kind === 'task' ? SD.greenDk : SD.coralDk, textTransform: 'uppercase',
                }}>{it.kind === 'task' ? 'TASK' : 'WISH'}</span>
                <StatusPill status={it.status}/>
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink, marginTop: 2 }}>
                {it.name}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute, marginTop: 1 }}>{it.when}</div>
            </div>
            <div style={{
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 14,
              color: it.kind === 'task' ? SD.greenDk : SD.coralDk,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {it.kind === 'task' ? '+' : '−'}{it.amount} <Egg size={13}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value, color, bg, icon }) {
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 18, padding: '10px 8px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color,
        display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', lineHeight: 1,
      }}>
        {value} {icon && <Egg size={14}/>}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 10, color: SD.inkSoft, fontWeight: 700,
        letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4,
      }}>{label}</div>
    </div>
  );
}

// ─── Add task sheet (with auto-approval toggle) ──────────
function AddTaskSheet({ onClose, onCreate }) {
  const emojis = ['🦷', '🛏️', '📚', '🐶', '🥗', '🎨', '🧹', '💪', '🎵', '🌳', '👕', '🚴'];
  const [emoji, setEmoji] = React.useState('🦷');
  const [name, setName] = React.useState('');
  const [reward, setReward] = React.useState(3);
  const [autoApprove, setAutoApprove] = React.useState(true);
  const [category, setCategory] = React.useState('home');

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: SD.ink, marginBottom: 12 }}>
          New task
        </div>

        <FieldLabel>Pick an icon</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 14 }}>
          {emojis.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{
              border: 'none', cursor: 'pointer', aspectRatio: '1', borderRadius: 14,
              background: emoji === e ? SD.greenLt : '#fff',
              boxShadow: emoji === e ? `inset 0 0 0 2px ${SD.green}` : 'inset 0 0 0 2px rgba(20,40,30,0.06)',
              fontSize: 22,
            }}>{e}</button>
          ))}
        </div>

        <FieldLabel>Task name</FieldLabel>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Brush teeth" style={{
          width: '100%', boxSizing: 'border-box',
          border: '2px solid rgba(20,40,30,0.08)', borderRadius: 14,
          padding: '12px 14px', fontFamily: FONTS.body, fontSize: 15,
          marginBottom: 14, outline: 'none', background: '#fff', color: SD.ink,
        }}/>

        <FieldLabel>Category</FieldLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { k: 'morning', l: '🌅 Morning' },
            { k: 'home',    l: '🏠 Home' },
            { k: 'school',  l: '📚 School' },
            { k: 'kind',    l: '💚 Kind' },
          ].map(c => (
            <button key={c.k} onClick={() => setCategory(c.k)} style={{
              border: 'none', cursor: 'pointer',
              background: category === c.k ? SD.ink : '#fff',
              color: category === c.k ? '#fff' : SD.ink,
              padding: '8px 12px', borderRadius: 100,
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 12,
              boxShadow: category === c.k ? 'none' : 'inset 0 0 0 2px rgba(20,40,30,0.08)',
            }}>{c.l}</button>
          ))}
        </div>

        <FieldLabel>Reward</FieldLabel>
        <div style={{
          background: '#fff', borderRadius: 14, padding: 12,
          border: '2px solid rgba(20,40,30,0.08)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        }}>
          <Egg size={28}/>
          <div style={{ flex: 1 }}>
            <input type="range" min="1" max="10" value={reward} onChange={e => setReward(+e.target.value)}
                   style={{ width: '100%', accentColor: SD.green }}/>
          </div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: SD.eggDk, minWidth: 30, textAlign: 'right' }}>
            {reward}
          </div>
        </div>

        {/* Approval toggle */}
        <FieldLabel>Approval</FieldLabel>
        <div style={{
          background: '#fff', borderRadius: 14, padding: 14,
          border: '2px solid rgba(20,40,30,0.08)', marginBottom: 18,
        }}>
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
          }}>
            <Toggle checked={!autoApprove} onChange={v => setAutoApprove(!v)}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink }}>
                Required parent approval
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 4, lineHeight: 1.4 }}>
                {autoApprove
                  ? <>⚡ <b>Auto-approved</b> — kid earns eggs instantly when logged.</>
                  : <>👤 <b>Needs your OK</b> — task waits in your Inbox before eggs are awarded.</>}
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Stamp color={SD.paper} text={SD.ink} block onClick={onClose}>Cancel</Stamp>
          <Stamp color={SD.coral} block disabled={!name.trim()}
                 onClick={() => onCreate({ name: name.trim(), emoji, reward, category, autoApprove })}>
            Create task
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}

// ─── Add wish sheet ──────────────────────────────────────
function AddWishSheet({ onClose, onCreate }) {
  const emojis = ['🎬', '🍦', '📖', '🛝', '🌙', '🍕', '🧸', '🎮', '🎁', '🍪', '🚲', '🎨'];
  const [emoji, setEmoji] = React.useState('🎁');
  const [name, setName] = React.useState('');
  const [cost, setCost] = React.useState(10);

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: SD.ink, marginBottom: 12 }}>
          New wish
        </div>

        <FieldLabel>Pick an icon</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 14 }}>
          {emojis.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{
              border: 'none', cursor: 'pointer', aspectRatio: '1', borderRadius: 14,
              background: emoji === e ? SD.coralLt : '#fff',
              boxShadow: emoji === e ? `inset 0 0 0 2px ${SD.coral}` : 'inset 0 0 0 2px rgba(20,40,30,0.06)',
              fontSize: 22,
            }}>{e}</button>
          ))}
        </div>

        <FieldLabel>Wish name</FieldLabel>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Movie night" style={{
          width: '100%', boxSizing: 'border-box',
          border: '2px solid rgba(20,40,30,0.08)', borderRadius: 14,
          padding: '12px 14px', fontFamily: FONTS.body, fontSize: 15,
          marginBottom: 14, outline: 'none', background: '#fff', color: SD.ink,
        }}/>

        <FieldLabel>Egg cost</FieldLabel>
        <div style={{
          background: '#fff', borderRadius: 14, padding: 12,
          border: '2px solid rgba(20,40,30,0.08)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
        }}>
          <Egg size={28}/>
          <div style={{ flex: 1 }}>
            <input type="range" min="2" max="40" value={cost} onChange={e => setCost(+e.target.value)}
                   style={{ width: '100%', accentColor: SD.coral }}/>
          </div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: SD.eggDk, minWidth: 36, textAlign: 'right' }}>
            {cost}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Stamp color={SD.paper} text={SD.ink} block onClick={onClose}>Cancel</Stamp>
          <Stamp color={SD.coral} block disabled={!name.trim()}
                 onClick={() => onCreate({ name: name.trim(), emoji, cost })}>
            Create wish
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}

function FieldLabel({ children }) {
  return <div style={{
    fontFamily: FONTS.display, fontWeight: 700, fontSize: 12,
    color: SD.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase',
    marginBottom: 6,
  }}>{children}</div>;
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      flexShrink: 0, border: 'none', cursor: 'pointer',
      width: 48, height: 28, borderRadius: 100,
      background: checked ? SD.coral : '#d4d4d4',
      position: 'relative', transition: 'background 200ms ease', padding: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        transition: 'left 200ms ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}/>
    </button>
  );
}

Object.assign(window, {
  ParentTabBar, ParentDashboard, ParentTasks, ParentWishes, ParentHistory,
  AddTaskSheet, AddWishSheet,
});
