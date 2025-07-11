
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import SetupScreen from './components/SetupScreen';
import FlowScreen from './components/FlowScreen';
import HistoryScreen from './components/HistoryScreen';
import { type DhikrSettings, Screen, type DhikrSession, DhikrStatus } from './types';

const HISTORY_KEY = 'dhikrflow_history';

const loadHistory = (): DhikrSession[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error("Failed to load history from localStorage", error);
  }
  return [];
};

const saveHistory = (history: DhikrSession[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Setup);
  const [history, setHistory] = useState<DhikrSession[]>(loadHistory);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleBegin = useCallback((settings: DhikrSettings) => {
    const newSession: DhikrSession = {
      ...settings,
      id: new Date().toISOString(),
      currentCount: 1,
      status: DhikrStatus.Running,
    };
    setHistory(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setScreen(Screen.Flow);
  }, []);

  const handleUpdateSession = useCallback((update: Partial<DhikrSession> & { id: string }) => {
    setHistory(prev =>
      prev.map(s => s.id === update.id ? { ...s, ...update } : s)
    );
  }, []);

  const handleResume = useCallback((sessionId: string) => {
    const sessionToResume = history.find(s => s.id === sessionId);
    if (sessionToResume) {
      if (sessionToResume.status === DhikrStatus.Completed) {
        handleUpdateSession({ id: sessionId, currentCount: 1, status: DhikrStatus.Running });
      } else {
        handleUpdateSession({ id: sessionId, status: DhikrStatus.Running });
      }
      setActiveSessionId(sessionId);
      setScreen(Screen.Flow);
    }
  }, [history, handleUpdateSession]);

  const handleFlowCancel = useCallback(() => {
    if (activeSessionId) {
      handleUpdateSession({ id: activeSessionId, status: DhikrStatus.Paused });
    }
    setActiveSessionId(null);
    setScreen(Screen.Setup);
  }, [activeSessionId, handleUpdateSession]);

  const handleShowHistory = useCallback(() => setScreen(Screen.History), []);
  const handleBackToSetup = useCallback(() => setScreen(Screen.Setup), []);

  const activeSession = useMemo(() =>
    history.find(s => s.id === activeSessionId) || null,
    [history, activeSessionId]
  );

  const initialSetupSettings = useMemo(() => {
    if (history.length > 0) {
      const lastSession = history[0];
      return { phrase: lastSession.phrase, targetCount: lastSession.targetCount, interval: lastSession.interval };
    }
    return { phrase: "Subhan'Allah", targetCount: 33, interval: 2.0 };
  }, [history]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.History:
        return <HistoryScreen sessions={history} onResume={handleResume} onBack={handleBackToSetup} />;
      case Screen.Flow:
        if (!activeSession) {
          handleBackToSetup();
          return null;
        }
        return <FlowScreen key={activeSession.id} session={activeSession} onUpdate={handleUpdateSession} onCancel={handleFlowCancel} />;
      case Screen.Setup:
      default:
        return <SetupScreen onBegin={handleBegin} initialSettings={initialSetupSettings} onShowHistory={handleShowHistory} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-bg font-sans">
      <div className="w-full max-w-md">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
