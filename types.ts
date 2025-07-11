
export enum Screen {
  Setup = 'SETUP',
  Flow = 'FLOW',
  History = 'HISTORY',
}

export interface DhikrSettings {
  phrase: string;
  targetCount: number;
  interval: number;
}

export interface DhikrSession extends DhikrSettings {
  id: string; // ISO timestamp string for unique ID and sorting
  currentCount: number;
  status: DhikrStatus;
}

export enum DhikrStatus {
  Running = 'RUNNING',
  Paused = 'PAUSED',
  Completed = 'COMPLETED',
}

export enum DhikrPhase {
  FadingIn = 'FADING_IN',
  FadingOut = 'FADING_OUT',
  Holding = 'HOLDING',
}
