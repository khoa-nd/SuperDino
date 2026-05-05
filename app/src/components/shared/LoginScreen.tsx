'use client';

import { useState } from 'react';
import { Dino, Stamp, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
import { useStore } from '@/lib/store';
import type { UserRole } from '@/types';

interface LoginScreenProps {
  role: UserRole;
  onBack: () => void;
  onLogin: (username: string, role: UserRole, options?: { familyCode?: string; password?: string }) => void;
}

export function LoginScreen({ role, onBack, onLogin }: LoginScreenProps) {
  const { loadingAction } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [joinFamily, setJoinFamily] = useState(false);

  const isParent = role === 'parent';
  const canSubmit = username.trim().length >= 2 && password.length >= 3;

  return (
    <div
      className={`
        flex-1 flex flex-col px-5 py-5
        ${isParent
          ? 'bg-gradient-to-b from-sd-coral-lt to-sd-cream'
          : 'bg-gradient-to-b from-sd-green-lt to-sd-cream'
        }
      `}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="
          self-start border-none bg-transparent
          font-display font-bold text-sm text-sd-ink-soft
          cursor-pointer p-1.5
        "
      >
        ‹ Back
      </button>

      {/* Dino */}
      <div className="flex justify-center my-1 mb-2">
        <Dino size={150} mood={isParent ? 'happy' : 'cheer'} wave={!isParent} />
      </div>

      {/* Title */}
      <div className="font-display font-bold text-[26px] text-center text-sd-ink leading-tight">
        {mode === 'login' ? 'Welcome back!' : "Let's get started"}
      </div>
      <div className="font-body text-sm text-sd-ink-soft text-center mt-1.5 mb-4">
        {isParent ? 'Parent account' : "Kid's account"}
      </div>

      {/* Mode toggle */}
      <div className="bg-white rounded-full p-1 flex gap-1 border-2 border-[rgba(20,40,30,0.05)] mb-4">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
              flex-1 border-none cursor-pointer
              py-2.5 rounded-full
              font-display font-bold text-sm capitalize
              transition-colors
              ${mode === m
                ? 'bg-sd-ink text-white'
                : 'bg-transparent text-sd-ink-soft'
              }
            `}
          >
            {m === 'login' ? 'Log in' : 'Sign up'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        <FormField label="Username">
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={isParent ? 'parent.name' : 'super.mia'}
          />
        </FormField>
        <FormField label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>
        {!isParent && mode === 'register' && (
          <FormField label="Parent family code">
            <TextInput
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value)}
              placeholder="DINO-F1"
            />
          </FormField>
        )}
        {isParent && mode === 'register' && (
          <>
            <div className="bg-white rounded-[14px] p-1 flex gap-1 border-2 border-[rgba(20,40,30,0.05)]">
              {([false, true] as const).map((join) => (
                <button
                  key={String(join)}
                  onClick={() => { setJoinFamily(join); setFamilyCode(''); }}
                  className={`
                    flex-1 border-none cursor-pointer
                    py-2.5 rounded-full
                    font-display font-bold text-xs
                    transition-colors
                    ${joinFamily === join
                      ? 'bg-sd-ink text-white'
                      : 'bg-transparent text-sd-ink-soft'
                    }
                  `}
                >
                  {join ? 'Join existing family' : 'Create new family'}
                </button>
              ))}
            </div>
            {joinFamily && (
              <FormField label="Family code">
                <TextInput
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  placeholder="DINO-F1"
                />
              </FormField>
            )}
          </>
        )}
      </div>

      {!isParent && mode === 'register' && (
        <div className="font-body text-xs text-sd-ink-mute mt-3 leading-relaxed bg-white/60 rounded-[14px] px-3 py-2">
          Ask your parent for the code on their dashboard. Demo family code: <b>DINO-F1</b>.
        </div>
      )}
      {isParent && mode === 'register' && joinFamily && (
        <div className="font-body text-xs text-sd-ink-mute mt-3 leading-relaxed bg-white/60 rounded-[14px] px-3 py-2">
          Enter the family code from the other parent's dashboard.
        </div>
      )}
      {isParent && mode === 'register' && !joinFamily && (
        <div className="font-body text-xs text-sd-ink-mute mt-3 leading-relaxed bg-white/60 rounded-[14px] px-3 py-2">
          You'll create a brand new family. Share the code on your dashboard for the other parent to join.
        </div>
      )}

      <div className="flex-1" />

      {/* Submit button */}
      <Stamp
        color={isParent ? 'coral' : 'green'}
        block
        size="lg"
        disabled={!canSubmit}
        loading={loadingAction === 'login'}
        onClick={() => onLogin(username.trim() || (isParent ? 'Parent' : 'Mia'), role, { password, familyCode: isParent ? (joinFamily ? familyCode : '') : (mode === 'register' ? familyCode : '') })}
      >
        {mode === 'login' ? 'Log in' : 'Create account'}
      </Stamp>

      {/* Switch mode link */}
      <div className="font-body text-xs text-sd-ink-mute text-center mt-3">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className={`
            font-bold cursor-pointer border-none bg-transparent
            ${isParent ? 'text-sd-coral-dk' : 'text-sd-green-dk'}
          `}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
}
