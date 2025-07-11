
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type DhikrSession, DhikrStatus, DhikrPhase } from '../types';
import { PauseIcon, PlayIcon, ResetIcon, CancelIcon } from './icons';
import ActionButton from './ActionButton';

interface FlowScreenProps {
  session: DhikrSession;
  onUpdate: (update: Partial<DhikrSession> & { id: string }) => void;
  onCancel: () => void;
}

const FADE_DURATION = 1500; // 1.5 seconds in ms

const FlowScreen: React.FC<FlowScreenProps> = ({ session, onUpdate, onCancel }) => {
  const { id, phrase, targetCount, interval } = session;

  const [status, setStatus] = useState<DhikrStatus>(session.status);
  const [phase, setPhase] = useState<DhikrPhase>(DhikrPhase.FadingIn);
  const [currentCount, setCurrentCount] = useState<number>(session.currentCount);
  const [opacity, setOpacity] = useState<number>(0);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const animationFrameId = useRef<number>(0);
  const phaseStartTime = useRef<number>(0);
  const timePaused = useRef<number>(0);

  // Inform parent of status/progress updates
  useEffect(() => {
    // Avoid sending update if status is Paused on initial load
    if (session.status === DhikrStatus.Paused && status === DhikrStatus.Paused && currentCount === session.currentCount) {
        return;
    }
    onUpdate({ id, currentCount, status });
  }, [currentCount, status]);


  const pause = useCallback(() => {
    if (status !== DhikrStatus.Running) return;
    cancelAnimationFrame(animationFrameId.current);
    timePaused.current = performance.now();
    setStatus(DhikrStatus.Paused);
  }, [status]);

  const resume = useCallback(() => {
    if (status !== DhikrStatus.Paused) return;
    // Adjust start time to account for the paused duration
    phaseStartTime.current += performance.now() - timePaused.current;
    timePaused.current = 0; // Clear pause time
    setStatus(DhikrStatus.Running);
  }, [status]);
  
  const reset = useCallback(() => {
    setShowResetConfirm(false);
    setStatus(DhikrStatus.Paused); // Temporarily pause to reset
    setCurrentCount(1);
    setOpacity(0);
    setPhase(DhikrPhase.FadingIn);
    phaseStartTime.current = 0; // Reset timer for a fresh start
    timePaused.current = 0;
    setStatus(DhikrStatus.Running); // Restart the loop
  }, []);

  const handleCancel = useCallback(() => {
    setShowCancelConfirm(false);
    setStatus(DhikrStatus.Paused); // Stop the loop for good
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (status !== DhikrStatus.Running) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
    }
    
    // On the very first frame of a session (or after a reset), set the start time.
    if (phaseStartTime.current === 0) {
      phaseStartTime.current = performance.now();
      // If resuming, adjust for time spent paused before this screen was even mounted
      if(timePaused.current > 0) {
        phaseStartTime.current -= (performance.now() - timePaused.current);
        timePaused.current = 0;
      }
    }
   
    const loop = (now: number) => {
      // This check is important because a frame might be requested before the effect cleanup runs
      if (status !== DhikrStatus.Running) return;
      
      const elapsed = now - phaseStartTime.current;
      
      let nextPhase: DhikrPhase | null = null;

      switch (phase) {
        case DhikrPhase.FadingIn: {
          const progress = Math.min(elapsed / FADE_DURATION, 1);
          setOpacity(progress);
          if (progress >= 1) {
            nextPhase = DhikrPhase.FadingOut;
          }
          break;
        }
        case DhikrPhase.FadingOut: {
          const progress = Math.min(elapsed / FADE_DURATION, 1);
          setOpacity(1 - progress);
          if (progress >= 1) {
            nextPhase = DhikrPhase.Holding;
          }
          break;
        }
        case DhikrPhase.Holding: {
          const progress = Math.min(elapsed / (interval * 1000), 1);
          if (progress >= 1) {
            const newCount = currentCount + 1;
            if (newCount > targetCount) {
              setStatus(DhikrStatus.Completed);
              setOpacity(1); // Ensure opacity is full for the final count display
              if (window.navigator.vibrate) window.navigator.vibrate(200);
              return; // Stop the loop
            }
            setCurrentCount(newCount);
            nextPhase = DhikrPhase.FadingIn;
          }
          break;
        }
      }

      if (nextPhase) {
        setPhase(nextPhase);
        // Reset the timer for the start of the next phase
        phaseStartTime.current = now;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [status, interval, targetCount, phase, currentCount]);


  const renderConfirmationModal = (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel: () => void
    ) => (
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-brand-surface p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
          <h3 className="text-lg font-bold text-brand-text">{title}</h3>
          <p className="text-brand-text-dim my-4">{message}</p>
          <div className="flex justify-center gap-4">
            <ActionButton onClick={onCancel} className="bg-slate-600 hover:bg-slate-500">No, go back</ActionButton>
            <ActionButton onClick={onConfirm} className="bg-red-600 hover:bg-red-500">Yes, proceed</ActionButton>
          </div>
        </div>
      </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-between h-[80vh] w-full max-w-md p-4 text-center">
      {showResetConfirm && renderConfirmationModal(
        "Reset Session?",
        "Your current progress will be lost.",
        reset,
        () => setShowResetConfirm(false)
      )}
      {showCancelConfirm && renderConfirmationModal(
        "Cancel Session?",
        "This will end the session and return to the home screen.",
        handleCancel,
        () => setShowCancelConfirm(false)
      )}

      <div className="flex-grow flex flex-col items-center justify-center w-full">
        {status === DhikrStatus.Completed ? (
           <div className="animate-fadeIn text-center">
            <h2 className="text-5xl font-bold text-brand-primary">Completed</h2>
            <p className="text-xl text-brand-text-dim mt-2">{phrase}</p>
          </div>
        ) : (
          <h2
            className="text-5xl md:text-6xl font-semibold text-brand-text transition-opacity duration-300"
            style={{ opacity: opacity }}
          >
            {phrase}
          </h2>
        )}

        <p className="text-2xl text-brand-text-dim mt-8 tracking-wider">
          {Math.min(currentCount, targetCount)} of {targetCount}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-6 p-4 rounded-full bg-brand-surface/70 backdrop-blur-sm shadow-lg">
        <button onClick={() => setShowResetConfirm(true)} className="p-3 text-brand-text-dim hover:text-brand-primary transition-colors duration-200" aria-label="Reset Session">
          <ResetIcon className="w-7 h-7" />
        </button>

        {status !== DhikrStatus.Completed && (
          status === DhikrStatus.Running ? (
            <button onClick={pause} className="p-4 rounded-full bg-brand-primary text-brand-bg hover:bg-sky-300 transition-colors duration-200 shadow-lg" aria-label="Pause Session">
              <PauseIcon className="w-8 h-8" />
            </button>
          ) : (
            <button onClick={resume} className="p-4 rounded-full bg-brand-primary text-brand-bg hover:bg-sky-300 transition-colors duration-200 shadow-lg" aria-label="Resume Session">
              <PlayIcon className="w-8 h-8" />
            </button>
          )
        )}
        {status === DhikrStatus.Completed && (
            <button onClick={reset} className="p-4 rounded-full bg-brand-primary text-brand-bg hover:bg-sky-300 transition-colors duration-200 shadow-lg" aria-label="Start Again">
              <ResetIcon className="w-8 h-8" />
            </button>
        )}

        <button onClick={() => setShowCancelConfirm(true)} className="p-3 text-brand-text-dim hover:text-brand-primary transition-colors duration-200" aria-label="Cancel Session">
          <CancelIcon className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default FlowScreen;
