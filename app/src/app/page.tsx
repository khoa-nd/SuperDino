'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Toast, LoadingBar } from '@/components/ui';

// Auth screens
import { OnboardingScreen } from '@/components/shared/OnboardingScreen';
import { LoginScreen } from '@/components/shared/LoginScreen';

// Child screens
import { ChildHome, ChildTasks, ChildWishes, StreakJourney, CelebrationOverlay, WishSubmitSheet } from '@/components/child';

// Parent screens
import { ParentTabBar, ParentDashboard, ParentTasks, ParentWishes, ParentHistory, AddTaskSheet, AddWishSheet, type ParentTab } from '@/components/parent';

import type { Wish, UserRole } from '@/types';

type ChildView = 'home' | 'tasks' | 'wishes' | 'journey';

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
            onStreakClick={() => setChildView('journey')}
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
      case 'journey':
        screen = <StreakJourney onBack={() => setChildView('home')} />;
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
    <div className="min-h-dvh flex flex-col bg-sd-cream">
      {loading && <LoadingBar />}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {screen}
        {tabBar}
      </div>

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
  );
}
