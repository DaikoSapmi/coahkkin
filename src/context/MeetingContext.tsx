import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SystemState } from '../types';

interface MeetingContextValue {
  state: SystemState | null;
  socket: Socket | null;
  liveRemainingSeconds: number;
  getPartyRemainingLive: (partyId: string) => number;
}

const MeetingContext = createContext<MeetingContextValue>({
  state: null,
  socket: null,
  liveRemainingSeconds: 0,
  getPartyRemainingLive: () => 0
});

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SystemState | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('state:update', (payload: { state: SystemState; serverTime: number }) => {
      setState(payload.state);
      setServerOffsetMs(payload.serverTime - Date.now());
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Oppdater lokal klokke 10 ganger i sekundet for helt jevn nedtelling
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now() + serverOffsetMs);
    }, 100);
    return () => clearInterval(interval);
  }, [serverOffsetMs]);

  let liveRemainingSeconds = 0;
  let elapsedRunningSeconds = 0;

  if (state) {
    if (state.timer.status === 'RUNNING' && state.timer.startedAt) {
      elapsedRunningSeconds = Math.max(0, Math.floor((now - state.timer.startedAt) / 1000));
      liveRemainingSeconds = state.timer.remainingSecondsAtStart - elapsedRunningSeconds;
    } else {
      liveRemainingSeconds = state.timer.remainingSecondsAtStart;
    }
  }

  const getPartyRemainingLive = (partyId: string): number => {
    if (!state) return 0;
    const agenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
    if (!agenda) return 0;
    const baseRemaining = agenda.partyRemainingSeconds[partyId] ?? 0;

    if (state.timer.status === 'RUNNING' && agenda.debateType === 'PARTY_QUOTA') {
      const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
      if (activeSpeech) {
        const rep = state.representatives.find(r => r.id === activeSpeech.representativeId);
        const shouldDeduct = activeSpeech.type === 'MAIN' || agenda.deductRepliesFromPartyQuota;
        if (rep && rep.partyId === partyId && shouldDeduct) {
          return Math.max(0, baseRemaining - elapsedRunningSeconds);
        }
      }
    }
    return baseRemaining;
  };

  return (
    <MeetingContext.Provider value={{ state, socket, liveRemainingSeconds, getPartyRemainingLive }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => useContext(MeetingContext);

export function formatTime(totalSeconds: number): string {
  const isNegative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  return `${isNegative ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
