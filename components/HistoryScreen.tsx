
import React from 'react';
import { type DhikrSession, DhikrStatus } from '../types';
import ActionButton from './ActionButton';
import { PlayIcon, ResetIcon, HistoryIcon } from './icons';

interface HistoryScreenProps {
  sessions: DhikrSession[];
  onResume: (id: string) => void;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ sessions, onResume, onBack }) => {
  
  const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  
  const recentSessions = sessions.filter(s => new Date(s.id).getTime() > twentyFourHoursAgo);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return (
    <div className="bg-brand-surface p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
      <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
        <HistoryIcon className="h-8 w-8 text-brand-primary mr-4" />
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Amal Nama</h1>
          <p className="text-brand-text-dim">Your dhikr history from the last 24 hours.</p>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {recentSessions.length > 0 ? (
          recentSessions.map(session => (
            <div key={session.id} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between transition-transform duration-200 hover:scale-105">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-semibold text-brand-text truncate ">{session.phrase}</p>
                <p className={`text-sm font-medium ${session.status === DhikrStatus.Completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {session.status === DhikrStatus.Completed ? 'Completed' : 'Incomplete'} ({session.currentCount}/{session.targetCount})
                </p>
                <p className="text-xs text-slate-500 mt-1">{formatDate(session.id)}</p>
              </div>
              <button 
                onClick={() => onResume(session.id)} 
                className="p-3 rounded-full bg-brand-primary text-brand-bg hover:bg-sky-300 transition-colors duration-200 shadow-lg flex-shrink-0" 
                aria-label={session.status === DhikrStatus.Completed ? 'Repeat Session' : 'Resume Session'}
              >
                {session.status === DhikrStatus.Completed ? <ResetIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-brand-text-dim">No dhikr sessions recorded in the last 24 hours.</p>
            <p className="text-sm text-slate-500 mt-2">Start a new session to begin your journey.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <ActionButton onClick={onBack} className="w-full bg-slate-600 hover:bg-slate-500">
          Back to Setup
        </ActionButton>
      </div>
    </div>
  );
};

export default HistoryScreen;
