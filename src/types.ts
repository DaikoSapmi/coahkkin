import { LanguageCode } from './i18n';

export interface Organization {
  name: string;
  subtitle: string;
  logoUrl: string;
  primaryColor: string;
  defaultLanguage: LanguageCode;
}

export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface Representative {
  id: string;
  name: string;
  partyId: string;
  title: string;
  seatNumber?: string;
}

export type DebateType = 'INDIVIDUAL' | 'PARTY_QUOTA';

export interface AgendaItem {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  debateType: DebateType;
  defaultSpeechSeconds: number;
  replySeconds: number;
  responseToReplySeconds: number;
  maxRepliesPerSpeech: number;
  deductRepliesFromPartyQuota: boolean;
  partyQuotas: Record<string, number>;
  partyRemainingSeconds: Record<string, number>;
}

export type SpeechType = 'MAIN' | 'REPLY' | 'RESPONSE_TO_REPLY';

export interface SpeakerQueueItem {
  id: string;
  agendaItemId: string;
  representativeId: string;
  type: SpeechType;
  parentSpeechId?: string;
  allocatedSeconds: number;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED';
}

export interface TimerState {
  status: 'STOPPED' | 'RUNNING' | 'PAUSED';
  startedAt: number | null;
  remainingSecondsAtStart: number;
  allocatedSeconds: number;
}

export interface OverlaySettings {
  showLowerThird: boolean;
  showAgendaBug: boolean;
  lowerThirdShowTimer: boolean;
}

export interface SystemState {
  organization: Organization;
  parties: Party[];
  representatives: Representative[];
  agendaItems: AgendaItem[];
  activeAgendaItemId: string;
  speakerQueue: SpeakerQueueItem[];
  activeSpeakerQueueId: string | null;
  timer: TimerState;
  overlays: OverlaySettings;
}
