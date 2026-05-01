// Child-side screens for SuperDino — v2 (merged Home + Nest, no tab bar)

const StatusPill = ({ status }) => {
  const map = {
    pending:        { bg: 'oklch(0.96 0.07 90)', t: SD.eggDk,   label: 'Pending' },
    approved:       { bg: SD.greenLt,            t: SD.greenDk, label: 'Approved' },
    'auto-approved':{ bg: SD.greenLt,            t: SD.greenDk, label: 'Auto-approved ✨' },
    rejected:       { bg: SD.coralLt,            t: SD.coralDk, label: 'Rejected' },
  }[status] || { bg: '#eee', t: SD.ink, label: status };
  return <Pill color={map.bg} text={map.t}>{map.label}</Pill>;
};

// ─── Login / Register form (after role pick) ─────────────
function LoginScreen({ role, onBack, onLogin }) {
  const [mode, setMode] = React.useState('login'); // login | register
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const isParent = role === 'parent';
  const accent = isParent ? SD.coral : SD.green;
  const accentDk = isParent ? SD.coralDk : SD.greenDk;
  const accentLt = isParent ? SD.coralLt : SD.greenLt;

  const canSubmit = username.trim().length >= 2 && password.length >= 3;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${accentLt} 0%, ${SD.cream} 60%)`,
      padding: '20px 22px 24px',
    }}>
      <button onClick={onBack} style={{
        alignSelf: 'flex-start', border: 'none', background: 'transparent',
        fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.inkSoft,
        cursor: 'pointer', padding: 6,
      }}>‹ Back</button>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
        <Dino size={150} mood={isParent ? 'happy' : 'cheer'} wave={!isParent}/>
      </div>

      <div style={{
        fontFamily: FONTS.display, fontWeight: 700, fontSize: 26,
        textAlign: 'center', color: SD.ink, lineHeight: 1.1,
      }}>
        {mode === 'login' ? `Welcome back!` : `Let's get started`}
      </div>
      <div style={{
        fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft,
        textAlign: 'center', marginTop: 6, marginBottom: 18,
      }}>
        {isParent ? 'Parent account' : "Kid's account"}
      </div>

      {/* Mode switch */}
      <div style={{
        background: '#fff', borderRadius: 100, padding: 4, display: 'flex', gap: 4,
        border: '2px solid rgba(20,40,30,0.05)', marginBottom: 16,
      }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, border: 'none', cursor: 'pointer',
            background: mode === m ? SD.ink : 'transparent',
            color: mode === m ? '#fff' : SD.inkSoft,
            padding: '10px 0', borderRadius: 100,
            fontFamily: FONTS.display, fontWeight: 700, fontSize: 13,
            textTransform: 'capitalize',
          }}>{m === 'login' ? 'Log in' : 'Sign up'}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label="Username">
          <input value={username} onChange={e => setUsername(e.target.value)}
                 placeholder={isParent ? 'parent.name' : 'super.mia'}
                 style={inputStyle}/>
        </FormField>
        <FormField label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                 placeholder="••••••••" style={inputStyle}/>
        </FormField>
      </div>

      <div style={{ flex: 1 }}/>

      <Stamp color={accent} block size="lg" disabled={!canSubmit}
             onClick={() => onLogin({ username: username.trim() || (isParent ? 'Parent' : 'Mia'), role })}>
        {mode === 'login' ? 'Log in' : 'Create account'}
      </Stamp>

      <div style={{
        fontFamily: FONTS.body, fontSize: 12, color: SD.inkMute,
        textAlign: 'center', marginTop: 12,
      }}>
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <a onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
           style={{ color: accentDk, fontWeight: 700, cursor: 'pointer' }}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </a>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '2px solid rgba(20,40,30,0.08)', borderRadius: 14,
  padding: '14px 16px', fontFamily: FONTS.body, fontSize: 15,
  outline: 'none', background: '#fff', color: SD.ink,
};

function FormField({ label, children }) {
  return (
    <div>
      <div style={{
        fontFamily: FONTS.display, fontWeight: 700, fontSize: 12,
        color: SD.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase',
        marginBottom: 6,
      }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Onboarding / Role select ────────────────────────────
function OnboardingScreen({ onPick }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${SD.greenLt} 0%, ${SD.cream} 60%)`,
      padding: '24px 22px 28px',
    }}>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <div style={{
          fontFamily: FONTS.display, fontSize: 36, fontWeight: 700,
          color: SD.greenDk, letterSpacing: -0.5, lineHeight: 1,
        }}>SuperDino</div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 14, color: SD.inkSoft,
          marginTop: 6, fontWeight: 600,
        }}>You become stronger by what you do.</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 4px' }}>
        <Dino size={210} mood="cheer" wave/>
      </div>

      <div style={{
        fontFamily: FONTS.display, fontSize: 22, fontWeight: 600,
        textAlign: 'center', color: SD.ink, margin: '8px 0 18px',
      }}>Who's playing?</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card onClick={() => onPick('child')} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: '#fff',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, background: SD.greenLt,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
          }}>🦕</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: SD.ink }}>I'm a Kid</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginTop: 2 }}>
              Log tasks, earn eggs, make wishes
            </div>
          </div>
          <div style={{ fontSize: 22, color: SD.greenDk, fontWeight: 700 }}>›</div>
        </Card>

        <Card onClick={() => onPick('parent')} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: 18,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, background: SD.coralLt,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>👨‍👩‍👧</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: SD.ink }}>I'm a Parent</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginTop: 2 }}>
              Approve tasks, set rewards
            </div>
          </div>
          <div style={{ fontSize: 22, color: SD.coralDk, fontWeight: 700 }}>›</div>
        </Card>
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{
        fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute,
        textAlign: 'center', marginTop: 16,
      }}>v1.0 · Draft</div>
    </div>
  );
}

// ─── Child Home — Hero + Balance + History (merged) ──────
function ChildHome({ state, onLogTask, onWishes, onSwitchRole, onTasks }) {
  const dinoMood = state.justEarned ? 'cheer' : 'happy';

  // History items: combine logs and wishes, sorted by recency
  const items = React.useMemo(() => {
    const taskItems = state.logs.map(l => {
      const t = state.tasks.find(x => x.id === l.taskId) || {};
      return {
        key: 'l' + l.id, kind: 'task',
        emoji: t.emoji || '✓', color: t.color || SD.greenLt,
        title: t.name || 'Task', when: l.when, ts: l.ts || 0,
        status: l.status, amount: t.reward || 0, dir: 'in',
      };
    });
    const wishItems = state.wishes.map(w => ({
      key: 'w' + w.id, kind: 'wish',
      emoji: w.emoji, color: w.color,
      title: w.name, when: w.when, ts: w.ts || 0,
      status: w.status, amount: w.cost, dir: 'out',
    }));
    return [...taskItems, ...wishItems].sort((a, b) => b.ts - a.ts);
  }, [state.logs, state.wishes, state.tasks]);

  const earned = state.transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const spent  = state.transactions.filter(t => t.type === 'spend').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream, paddingBottom: 16 }}>
      {/* Top bar */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={state.user.name} color={SD.coral}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, fontWeight: 600 }}>Hi,</div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: SD.ink }}>{state.user.name} 👋</div>
        </div>
        <button onClick={onSwitchRole} title="Switch to parent" style={{
          border: 'none', background: SD.coralLt, color: SD.coralDk,
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 11,
          padding: '8px 12px', borderRadius: 100, cursor: 'pointer', letterSpacing: 0.5,
        }}>👤 PARENT</button>
      </div>

      {/* Hero balance card */}
      <div style={{ padding: '0 18px 6px' }}>
        <div style={{
          background: `linear-gradient(160deg, ${SD.eggLt} 0%, oklch(0.92 0.10 80) 100%)`,
          borderRadius: 28, padding: '18px 20px 16px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 0 oklch(0.80 0.13 80), 0 12px 28px rgba(120,80,10,0.08)',
        }}>
          <Sparkle size={16} color="#fff" style={{ position: 'absolute', top: 14, right: 18, opacity: 0.85 }}/>
          <Sparkle size={10} color="#fff" style={{ position: 'absolute', top: 50, right: 44, opacity: 0.65 }}/>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: FONTS.display, fontSize: 12, fontWeight: 700,
                color: SD.eggDk, letterSpacing: 0.6, textTransform: 'uppercase',
              }}>Egg balance</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 2,
                fontFamily: FONTS.display, fontWeight: 700, fontSize: 48,
                color: SD.ink, lineHeight: 1,
              }}>
                <Egg size={42}/>
                <span style={{
                  display: 'inline-block',
                  animation: state.justEarned ? 'sd-pop 0.6s ease' : 'none',
                }}>{state.eggs}</span>
              </div>
            </div>
            <div style={{ marginRight: -10, marginBottom: -8 }}>
              <Dino size={130} mood={dinoMood} wave={!state.justEarned}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Stat label="Earned" value={`+${earned}`} color={SD.greenDk}/>
            <Stat label="Spent"  value={`−${spent}`} color={SD.coralDk}/>
            <Stat label="Streak" value="5d 🔥"        color={SD.eggDk}/>
          </div>
        </div>
      </div>

      {/* Big actions: Log task + Wishes */}
      <div style={{ padding: '12px 18px 4px', display: 'flex', gap: 10 }}>
        <Stamp color={SD.green} size="lg" onClick={onLogTask} style={{ flex: 1 }}>
          ✏️  Log Task
        </Stamp>
        <Stamp color={SD.coral} size="lg" onClick={onWishes} style={{ flex: 1 }}>
          ⭐  Wishes
        </Stamp>
      </div>

      {/* History */}
      <SectionTitle right={<span style={{
        fontFamily: FONTS.display, fontSize: 12, color: SD.inkMute, fontWeight: 700,
      }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>}>Recent activity</SectionTitle>

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 22 }}>
            <div style={{ fontSize: 32 }}>🦕</div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: SD.ink, marginTop: 6 }}>Nothing here yet</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 4 }}>
              Tap <b>Log Task</b> to start earning eggs!
            </div>
          </Card>
        )}
        {items.map(it => (
          <div key={it.key} style={{
            background: '#fff', borderRadius: 18, padding: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            border: '2px solid rgba(20,40,30,0.04)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: it.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              flexShrink: 0,
            }}>{it.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontFamily: FONTS.body, fontSize: 9, fontWeight: 800, letterSpacing: 0.6,
                  color: it.kind === 'task' ? SD.greenDk : SD.coralDk, textTransform: 'uppercase',
                }}>{it.kind === 'task' ? 'TASK' : 'WISH'}</span>
                <StatusPill status={it.status}/>
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink, lineHeight: 1.2 }}>{it.title}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: SD.inkMute, marginTop: 2 }}>{it.when}</div>
            </div>
            <div style={{
              fontFamily: FONTS.display, fontWeight: 700, fontSize: 16,
              color: it.dir === 'in' ? SD.greenDk : SD.coralDk,
              display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
            }}>
              {it.dir === 'in' ? '+' : '−'}{it.amount} <Egg size={14}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 14,
      padding: '8px 10px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 10, fontWeight: 700, color: SD.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ─── Tasks list (entered from "Log Task" button) ─────────
function ChildTasks({ state, onLog, onBack }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? state.tasks : state.tasks.filter(t => t.category === filter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <BackHeader title="Log a task" subtitle="Tap one when you finish it" onBack={onBack}/>

      <div style={{ padding: '0 18px', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
        {[
          { k: 'all',     label: 'All' },
          { k: 'morning', label: '🌅 Morning' },
          { k: 'home',    label: '🏠 Home' },
          { k: 'school',  label: '📚 School' },
          { k: 'kind',    label: '💚 Kind' },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: filter === f.k ? SD.ink : '#fff',
            color: filter === f.k ? '#fff' : SD.ink,
            padding: '8px 14px', borderRadius: 100,
            fontFamily: FONTS.display, fontWeight: 700, fontSize: 13,
            boxShadow: filter === f.k ? 'none' : 'inset 0 0 0 2px rgba(20,40,30,0.08)',
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(t => {
          const pending = state.logs.some(l => l.taskId === t.id && l.status === 'pending');
          return (
            <Card key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 14,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: t.color || SD.greenLt,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{t.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: SD.ink }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <EggBadge count={`+${t.reward}`} size={14}/>
                  {t.autoApprove
                    ? <Pill color={SD.greenLt} text={SD.greenDk}>⚡ Auto</Pill>
                    : <Pill color={SD.coralLt} text={SD.coralDk}>👤 Approval</Pill>}
                  {pending && <Pill color="oklch(0.96 0.07 90)" text={SD.eggDk}>Waiting</Pill>}
                </div>
              </div>
              <Stamp size="sm" color={pending ? SD.paper : SD.green}
                     text={pending ? SD.inkMute : '#fff'}
                     onClick={() => !pending && onLog(t.id)} disabled={pending}>
                {pending ? '…' : 'Log'}
              </Stamp>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Wishes ──────────────────────────────────────────────
function ChildWishes({ state, onOpenWish, onBack }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SD.cream }}>
      <BackHeader title="Wishes" subtitle="Trade eggs for things you love" onBack={onBack}/>

      <div style={{ padding: '0 18px 4px' }}>
        <Card color="#fff" style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Egg size={26}/>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: SD.ink }}>{state.eggs}</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginLeft: 4 }}>eggs available</div>
        </Card>
      </div>

      <SectionTitle>Wish catalog</SectionTitle>
      <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {state.wishCatalog.map(w => {
          const canAfford = state.eggs >= w.cost;
          return (
            <div key={w.id} onClick={() => onOpenWish(w)} style={{
              background: '#fff', borderRadius: 22, padding: 14, cursor: 'pointer',
              border: '2px solid rgba(20,40,30,0.06)',
              boxShadow: '0 2px 0 rgba(20,40,30,0.05)',
              opacity: canAfford ? 1 : 0.55,
            }}>
              <div style={{
                height: 78, borderRadius: 16, background: w.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
                marginBottom: 8,
              }}>{w.emoji}</div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: SD.ink, lineHeight: 1.15 }}>
                {w.name}
              </div>
              <div style={{
                marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <EggBadge count={w.cost} size={14}/>
                {!canAfford && (
                  <span style={{ fontFamily: FONTS.display, fontSize: 10, color: SD.inkMute, fontWeight: 700 }}>
                    Need {w.cost - state.eggs}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>My wishes</SectionTitle>
      <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.wishes.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: 18, padding: 16, textAlign: 'center',
            fontFamily: FONTS.body, fontSize: 13, color: SD.inkMute,
          }}>No wishes yet. Pick something from the catalog!</div>
        )}
        {state.wishes.map(w => (
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Wish submit sheet ───────────────────────────────────
function WishSubmitSheet({ wish, state, onClose, onSubmit }) {
  if (!wish) return null;
  const canAfford = state.eggs >= wish.cost;
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '8px 16px 18px' }}>
        <div style={{
          width: 96, height: 96, margin: '0 auto', borderRadius: 28,
          background: wish.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 50,
        }}>{wish.emoji}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: SD.ink, marginTop: 14 }}>
          {wish.name}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: SD.eggDk,
        }}>
          <Egg size={26}/> {wish.cost}
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginTop: 12, lineHeight: 1.4 }}>
          {canAfford
            ? <>You'll spend <b>{wish.cost} eggs</b>. A grown-up will say yes or no soon!</>
            : <>You need <b>{wish.cost - state.eggs} more eggs</b>. Keep going! 💪</>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Stamp color={SD.paper} text={SD.ink} block onClick={onClose}>Maybe later</Stamp>
          <Stamp color={SD.coral} block disabled={!canAfford} onClick={() => onSubmit(wish)}>
            {canAfford ? 'Make this wish ✨' : 'Not enough'}
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}

// ─── Celebration overlay (auto-approved tasks only) ──────
function CelebrateOverlay({ amount, taskName, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  const pieces = React.useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: [SD.green, SD.coral, SD.eggDk, SD.sky, SD.greenDk][i % 5],
    rot: Math.random() * 360,
    dur: 1.2 + Math.random() * 0.6,
  })), []);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,40,30,0.35)', backdropFilter: 'blur(2px)',
      animation: 'sd-fade 200ms ease',
    }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -20, left: `${p.left}%`,
          width: 10, height: 14, background: p.color, borderRadius: 3,
          transform: `rotate(${p.rot}deg)`,
          animation: `sd-confetti ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
      <div style={{
        background: '#fff', borderRadius: 28, padding: '28px 28px 22px',
        textAlign: 'center', maxWidth: 280, margin: '0 24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        animation: 'sd-pop-big 400ms cubic-bezier(.2,1.4,.4,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <Dino size={120} mood="cheer"/>
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 28, color: SD.ink }}>
          Awesome!
        </div>
        <div style={{
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: SD.greenDk,
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
        }}>
          You earned <Egg size={22}/> {amount} eggs!
        </div>
        {taskName && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginTop: 6 }}>
            for <b>{taskName}</b> ⚡
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sheet (bottom-up) ───────────────────────────────────
function Sheet({ children, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(20,40,30,0.4)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'sd-fade 200ms ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: SD.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 0 22px',
        animation: 'sd-slide-up 280ms cubic-bezier(.2,.9,.3,1)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
        maxHeight: '85%', overflowY: 'auto',
      }}>
        <div style={{
          width: 44, height: 5, background: 'rgba(20,40,30,0.18)', borderRadius: 100,
          margin: '0 auto 10px',
        }}/>
        {children}
      </div>
    </div>
  );
}

// Header with back button (sub-screens)
function BackHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={onBack} style={{
        border: 'none', background: '#fff',
        width: 40, height: 40, borderRadius: 14,
        boxShadow: 'inset 0 0 0 2px rgba(20,40,30,0.08)',
        cursor: 'pointer', fontSize: 18, color: SD.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>‹</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: SD.ink, lineHeight: 1 }}>{title}</div>
        {subtitle && <div style={{ fontFamily: FONTS.body, fontSize: 12, color: SD.inkSoft, marginTop: 4 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// Section title — non-wrapping
function SectionTitle({ children, right = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      gap: 12, margin: '14px 4px 10px', padding: '0 18px',
    }}>
      <h3 style={{
        margin: 0, fontFamily: FONTS.display, fontWeight: 600,
        fontSize: 18, color: SD.ink, letterSpacing: 0.2,
        whiteSpace: 'nowrap', flex: '0 0 auto',
      }}>{children}</h3>
      {right && <div style={{ flex: '0 1 auto', whiteSpace: 'nowrap' }}>{right}</div>}
    </div>
  );
}
window.SectionTitle = SectionTitle;

// Shared header for parent screens (kept here for sharing)
function ScreenHeader({ title, subtitle, onSwitchRole, parentMode = false }) {
  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, color: SD.ink, lineHeight: 1 }}>{title}</div>
        {subtitle && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: SD.inkSoft, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {onSwitchRole && (
        <button onClick={onSwitchRole} style={{
          border: 'none', background: parentMode ? SD.greenLt : SD.coralLt,
          color: parentMode ? SD.greenDk : SD.coralDk,
          fontFamily: FONTS.display, fontWeight: 700, fontSize: 11,
          padding: '8px 12px', borderRadius: 100, cursor: 'pointer', letterSpacing: 0.5,
        }}>{parentMode ? '👶 KID' : '👤 PARENT'}</button>
      )}
    </div>
  );
}

Object.assign(window, {
  LoginScreen, OnboardingScreen, ChildHome, ChildTasks, ChildWishes,
  WishSubmitSheet, CelebrateOverlay, Sheet, StatusPill, ScreenHeader, BackHeader,
});
