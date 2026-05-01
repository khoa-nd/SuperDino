'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Toast, LoadingBar } from '@/components/ui';

// Auth screens
import { OnboardingScreen } from '@/components/shared/OnboardingScreen';
import { LoginScreen } from '@/components/shared/LoginScreen';

// Child screens
import { ChildHome, ChildTasks, ChildWishes, CelebrationOverlay, WishSubmitSheet } from '@/components/child';

// Parent screens
import { ParentTabBar, ParentDashboard, ParentTasks, ParentWishes, ParentHistory, AddTaskSheet, AddWishSheet, type ParentTab } from '@/components/parent';

import type { Wish, UserRole } from '@/types';

type ChildView = 'home' | 'tasks' | 'wishes';

export default function SuperDinoApp() {
  // Store state
  const {
    authStage,
    pendingRole,
    viewRole,
    toast,
    celebrate,
    loading,
    setAuthStage,
    setPendingRole,
    login,
    logout,
    refreshFromDb,
    clearToast,
    clearCelebrate,
  } = useStore();

  // Local UI state
  const [childView, setChildView] = useState<ChildView>('home');
  const [parentTab, setParentTab] = useState<ParentTab>('home');
  const [openWish, setOpenWish] = useState<Wish | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [addingWish, setAddingWish] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (mounted && authStage === 'done') {
      refreshFromDb();
    }
  }, [authStage, mounted, refreshFromDb]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sd-cream">
        <div className="font-display text-2xl text-sd-green-dk animate-pulse">SuperDino</div>
      </div>
    );
  }

  // Auth handlers
  const handlePickRole = (role: UserRole) => {
    setPendingRole(role);
    setAuthStage('login');
  };

  const handleBack = () => {
    setAuthStage('pick');
    setPendingRole(null);
  };

  const handleLogin = (username: string, role: UserRole, options?: { familyCode?: string; password?: string }) => {
    login(username, role, options);
  };

  const handleLogout = () => {
    logout();
    setChildView('home');
    setParentTab('home');
    setOpenWish(null);
    setAddingTask(false);
    setAddingWish(false);
  };

  // Render current screen
  let screen: React.ReactNode;
  let tabBar: React.ReactNode = null;

  if (authStage === 'pick') {
    screen = <OnboardingScreen onPick={handlePickRole} />;
  } else if (authStage === 'login' && pendingRole) {
    screen = (
      <LoginScreen
        role={pendingRole}
        onBack={handleBack}
        onLogin={handleLogin}
      />
    );
  } else if (viewRole === 'child') {
    switch (childView) {
      case 'home':
        screen = (
          <ChildHome
            onLogTask={() => setChildView('tasks')}
            onWishes={() => setChildView('wishes')}
            onLogout={handleLogout}
          />
        );
        break;
      case 'tasks':
        screen = <ChildTasks onBack={() => setChildView('home')} />;
        break;
      case 'wishes':
        screen = (
          <ChildWishes
            onBack={() => setChildView('home')}
            onOpenWish={setOpenWish}
          />
        );
        break;
    }
  } else if (viewRole === 'parent') {
    switch (parentTab) {
      case 'home':
        screen = (
          <ParentDashboard
            onTab={setParentTab}
            onLogout={handleLogout}
          />
        );
        break;
      case 'tasks':
        screen = (
          <ParentTasks
            onAddTask={() => setAddingTask(true)}
          />
        );
        break;
      case 'wishes':
        screen = (
          <ParentWishes
            onAddWish={() => setAddingWish(true)}
          />
        );
        break;
      case 'history':
        screen = <ParentHistory />;
        break;
    }
    tabBar = <ParentTabBar tab={parentTab} onTab={setParentTab} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      {/* Phone frame for desktop preview */}
      <div className="w-full max-w-[412px] mx-auto">
        <div
          className="
            relative bg-sd-cream rounded-[40px] overflow-hidden
            shadow-[0_20px_60px_rgba(0,0,0,0.15),inset_0_0_0_4px_rgba(255,255,255,0.3)]
            border-[6px] border-[#1a1a1a]
          "
          style={{ aspectRatio: '412/892' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-2xl z-50" />

          {/* Content */}
          <div className="h-full flex flex-col pt-8 overflow-hidden">
            {loading && <LoadingBar />}
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              {screen}
            </div>
            {tabBar}

            {/* Modals & Overlays */}
            {openWish && (
              <WishSubmitSheet
                wish={openWish}
                onClose={() => setOpenWish(null)}
              />
            )}
            {addingTask && <AddTaskSheet onClose={() => setAddingTask(false)} />}
            {addingWish && <AddWishSheet onClose={() => setAddingWish(false)} />}
            {celebrate && (
              <CelebrationOverlay
                amount={celebrate.amount}
                taskName={celebrate.taskName}
                onDone={clearCelebrate}
              />
            )}
            {toast && <Toast message={toast} onClose={clearToast} />}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[rgba(0,0,0,0.2)] rounded-full" />
        </div>
      </div>
    </div>
  );
}
