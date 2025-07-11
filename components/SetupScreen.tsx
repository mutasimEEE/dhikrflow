
import React, { useState, useCallback } from 'react';
import { type DhikrSettings } from '../types';
import ActionButton from './ActionButton';
import { HistoryIcon } from './icons';

interface SetupScreenProps {
  onBegin: (settings: DhikrSettings) => void;
  initialSettings: DhikrSettings;
  onShowHistory: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onBegin, initialSettings, onShowHistory }) => {
  const [phrase, setPhrase] = useState(initialSettings.phrase || "Subhan'Allah");
  const [targetCount, setTargetCount] = useState(initialSettings.targetCount);
  const [interval, setInterval] = useState(initialSettings.interval);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateAndBegin = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!phrase.trim()) {
      newErrors.phrase = 'Please enter a phrase.';
    }
    if (isNaN(targetCount) || targetCount <= 0) {
      newErrors.targetCount = 'Repetitions must be a number greater than 0.';
    }
    if (isNaN(interval) || interval < 0.5) {
      newErrors.interval = 'Interval must be at least 0.5 seconds.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onBegin({ phrase: phrase.trim(), targetCount, interval });
    }
  }, [phrase, targetCount, interval, onBegin]);

  return (
    <div className="bg-brand-surface p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">DhikrFlow</h1>
          <p className="text-brand-text-dim mt-2">Set your intention and begin.</p>
        </div>
        <button
          onClick={onShowHistory}
          aria-label="Amal Nama (History)"
          className="p-3 text-brand-text-dim hover:text-brand-primary transition-colors duration-200 bg-slate-900/50 rounded-full"
        >
          <HistoryIcon className="h-8 w-8" />
        </button>
      </div>


      <form
        onSubmit={(e) => {
          e.preventDefault();
          validateAndBegin();
        }}
        className="space-y-6"
      >
        <div>
          <label htmlFor="phrase" className="block text-sm font-medium text-brand-text-dim mb-1">
            Phrase or Word
          </label>
          <input
            id="phrase"
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="e.g., Subhan'Allah"
            className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
          />
          {errors.phrase && <p className="text-sm text-brand-error mt-1">{errors.phrase}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="target_count" className="block text-sm font-medium text-brand-text-dim mb-1">
              Repetitions
            </label>
            <input
              id="target_count"
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            />
            {errors.targetCount && <p className="text-sm text-brand-error mt-1">{errors.targetCount}</p>}
          </div>

          <div>
            <label htmlFor="time_interval" className="block text-sm font-medium text-brand-text-dim mb-1">
              Interval (sec)
            </label>
            <input
              id="time_interval"
              type="number"
              step="0.1"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            />
            {errors.interval && <p className="text-sm text-brand-error mt-1">{errors.interval}</p>}
          </div>
        </div>

        <ActionButton type="submit" className="w-full !text-lg !py-3">
          Begin
        </ActionButton>
      </form>
    </div>
  );
};

export default SetupScreen;
