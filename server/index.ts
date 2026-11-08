import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SystemState, SpeakerQueueItem } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

const defaultState: SystemState = {
  organization: {
    name: 'Kárášjoga gielda / Karasjok kommune',
    subtitle: 'Gielddastivra / Kommunestyremøte',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Karasjok_komm.svg/200px-Karasjok_komm.svg.png',
    primaryColor: '#1e3a8a',
    defaultLanguage: 'se'
  },
  parties: [
    { id: 'ap', name: 'Bargiidbellodat / Arbeiderpartiet', shortName: 'AP', color: '#e11d48' },
    { id: 'h', name: 'Olgešbellodat / Høyre', shortName: 'H', color: '#2563eb' },
    { id: 'sp', name: 'Guovddášbellodat / Senterpartiet', shortName: 'SP', color: '#16a34a' },
    { id: 'sv', name: 'Sosialisttalaš Gurutbellodat / SV', shortName: 'SV', color: '#dc2626' },
    { id: 'frp', name: 'Ovddádusbellodat / FrP', shortName: 'FrP', color: '#0284c7' },
    { id: 'v', name: 'Gurutbellodat / Venstre', shortName: 'V', color: '#0d9488' }
  ],
  representatives: [
    { id: 'rep-1', name: 'Kari Nordmann', partyId: 'ap', title: 'Sátnejođiheaddji / Ordfører', seatNumber: '1' },
    { id: 'rep-2', name: 'Ola Hansen', partyId: 'h', title: 'Joavkojođiheaddji / Gruppeleder', seatNumber: '2' },
    { id: 'rep-3', name: 'Peder Ås', partyId: 'sp', title: 'Áirras / Representant', seatNumber: '3' },
    { id: 'rep-4', name: 'Marte Kirkerud', partyId: 'sv', title: 'Joavkojođiheaddji / Gruppeleder', seatNumber: '4' },
    { id: 'rep-5', name: 'Lars Holm', partyId: 'frp', title: 'Áirras / Representant', seatNumber: '5' },
    { id: 'rep-6', name: 'Ingrid Berg', partyId: 'v', title: 'Várresátnejođiheaddji / Varaordfører', seatNumber: '6' }
  ],
  agendaItems: [
    {
      id: 'sak-1',
      caseNumber: 'PS 24/26',
      title: 'Gielddabušeahtta 2027 / Kommunebudsjett 2027',
      description: 'Hoveddebatt med rammestyrt taletid (partikvoter) og replikkordskifte.',
      debateType: 'PARTY_QUOTA',
      defaultSpeechSeconds: 180,
      replySeconds: 60,
      responseToReplySeconds: 90,
      maxRepliesPerSpeech: 2,
      deductRepliesFromPartyQuota: false,
      partyQuotas: { ap: 600, h: 600, sp: 480, sv: 360, frp: 360, v: 300 },
      partyRemainingSeconds: { ap: 600, h: 600, sp: 480, sv: 360, frp: 360, v: 300 }
    },
    {
      id: 'sak-2',
      caseNumber: 'PS 25/26',
      title: 'Guovddášplána / Ny reguleringsplan for sentrumsområdet',
      description: 'Ordinær debatt med individuell taletid på 3 minutter per innlegg.',
      debateType: 'INDIVIDUAL',
      defaultSpeechSeconds: 180,
      replySeconds: 60,
      responseToReplySeconds: 60,
      maxRepliesPerSpeech: 2,
      deductRepliesFromPartyQuota: false,
      partyQuotas: { ap: 300, h: 300, sp: 300, sv: 300, frp: 300, v: 300 },
      partyRemainingSeconds: { ap: 300, h: 300, sp: 300, sv: 300, frp: 300, v: 300 }
    }
  ],
  activeAgendaItemId: 'sak-1',
  speakerQueue: [
    {
      id: 'sq-1',
      agendaItemId: 'sak-1',
      representativeId: 'rep-1',
      type: 'MAIN',
      allocatedSeconds: 180,
      status: 'ACTIVE'
    },
    {
      id: 'sq-2',
      agendaItemId: 'sak-1',
      representativeId: 'rep-2',
      type: 'REPLY',
      parentSpeechId: 'sq-1',
      allocatedSeconds: 60,
      status: 'WAITING'
    },
    {
      id: 'sq-3',
      agendaItemId: 'sak-1',
      representativeId: 'rep-1',
      type: 'RESPONSE_TO_REPLY',
      parentSpeechId: 'sq-1',
      allocatedSeconds: 90,
      status: 'WAITING'
    },
    {
      id: 'sq-4',
      agendaItemId: 'sak-1',
      representativeId: 'rep-3',
      type: 'MAIN',
      allocatedSeconds: 180,
      status: 'WAITING'
    }
  ],
  activeSpeakerQueueId: 'sq-1',
  timer: {
    status: 'STOPPED',
    startedAt: null,
    remainingSecondsAtStart: 180,
    allocatedSeconds: 180
  },
  overlays: {
    showLowerThird: true,
    showAgendaBug: true,
    lowerThirdShowTimer: true
  }
};

function loadState(): SystemState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.organization.defaultLanguage) {
        parsed.organization.defaultLanguage = 'nb';
      }
      return parsed;
    }
  } catch (err) {
    console.error('Kunne ikke lese data.json, bruker standardoppsett:', err);
  }
  return structuredClone(defaultState);
}

function saveState(state: SystemState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Kunne ikke lagre data.json:', err);
  }
}

let state: SystemState = loadState();

function commitElapsedPartyTime() {
  if (state.timer.status !== 'RUNNING' || !state.timer.startedAt) return;
  const elapsedSeconds = Math.floor((Date.now() - state.timer.startedAt) / 1000);
  const newRemaining = state.timer.remainingSecondsAtStart - elapsedSeconds;

  const currentAgenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
  const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
  if (currentAgenda && activeSpeech && currentAgenda.debateType === 'PARTY_QUOTA') {
    const shouldDeduct =
      activeSpeech.type === 'MAIN' || currentAgenda.deductRepliesFromPartyQuota;
    if (shouldDeduct) {
      const rep = state.representatives.find(r => r.id === activeSpeech.representativeId);
      if (rep && currentAgenda.partyRemainingSeconds[rep.partyId] !== undefined) {
        currentAgenda.partyRemainingSeconds[rep.partyId] = Math.max(
          0,
          currentAgenda.partyRemainingSeconds[rep.partyId] - elapsedSeconds
        );
      }
    }
  }

  state.timer.remainingSecondsAtStart = newRemaining;
  state.timer.startedAt = null;
  state.timer.status = 'PAUSED';
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.emit('state:update', { state, serverTime: Date.now() });

    socket.on('timer:start', () => {
      if (state.timer.status !== 'RUNNING') {
        state.timer.status = 'RUNNING';
        state.timer.startedAt = Date.now();
        saveState(state);
        io.emit('state:update', { state, serverTime: Date.now() });
      }
    });

    socket.on('timer:pause', () => {
      if (state.timer.status === 'RUNNING') {
        commitElapsedPartyTime();
        saveState(state);
        io.emit('state:update', { state, serverTime: Date.now() });
      }
    });

    socket.on('timer:reset', () => {
      commitElapsedPartyTime();
      const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
      const alloc = activeSpeech ? activeSpeech.allocatedSeconds : 180;
      state.timer = {
        status: 'STOPPED',
        startedAt: null,
        remainingSecondsAtStart: alloc,
        allocatedSeconds: alloc
      };
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('timer:adjust', (deltaSeconds: number) => {
      state.timer.remainingSecondsAtStart += deltaSeconds;
      state.timer.allocatedSeconds = Math.max(10, state.timer.allocatedSeconds + deltaSeconds);
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('agenda:select', (agendaId: string) => {
      commitElapsedPartyTime();
      state.activeAgendaItemId = agendaId;
      const firstWaiting = state.speakerQueue.find(
        s => s.agendaItemId === agendaId && s.status !== 'COMPLETED'
      );
      state.activeSpeakerQueueId = firstWaiting ? firstWaiting.id : null;
      const alloc = firstWaiting ? firstWaiting.allocatedSeconds : 180;
      state.timer = {
        status: 'STOPPED',
        startedAt: null,
        remainingSecondsAtStart: alloc,
        allocatedSeconds: alloc
      };
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('speaker:activate', (queueId: string) => {
      commitElapsedPartyTime();
      state.speakerQueue = state.speakerQueue.map(item => {
        if (item.id === state.activeSpeakerQueueId && item.status === 'ACTIVE') {
          return { ...item, status: 'COMPLETED' };
        }
        if (item.id === queueId) {
          return { ...item, status: 'ACTIVE' };
        }
        return item;
      });
      state.activeSpeakerQueueId = queueId;
      const nextSpeaker = state.speakerQueue.find(s => s.id === queueId);
      const alloc = nextSpeaker ? nextSpeaker.allocatedSeconds : 180;
      state.timer = {
        status: 'STOPPED',
        startedAt: null,
        remainingSecondsAtStart: alloc,
        allocatedSeconds: alloc
      };
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('speaker:next', () => {
      commitElapsedPartyTime();
      if (state.activeSpeakerQueueId) {
        const currentIdx = state.speakerQueue.findIndex(s => s.id === state.activeSpeakerQueueId);
        if (currentIdx !== -1) {
          state.speakerQueue[currentIdx].status = 'COMPLETED';
        }
      }
      const nextWaiting = state.speakerQueue.find(
        s => s.agendaItemId === state.activeAgendaItemId && s.status === 'WAITING'
      );
      if (nextWaiting) {
        nextWaiting.status = 'ACTIVE';
        state.activeSpeakerQueueId = nextWaiting.id;
        state.timer = {
          status: 'STOPPED',
          startedAt: null,
          remainingSecondsAtStart: nextWaiting.allocatedSeconds,
          allocatedSeconds: nextWaiting.allocatedSeconds
        };
      } else {
        state.activeSpeakerQueueId = null;
        state.timer = {
          status: 'STOPPED',
          startedAt: null,
          remainingSecondsAtStart: 0,
          allocatedSeconds: 0
        };
      }
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('speaker:add', (payload: { representativeId: string; type: 'MAIN' | 'REPLY'; customSeconds?: number }) => {
      const agenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
      if (!agenda) return;

      const id = 'sq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

      if (payload.type === 'MAIN') {
        const allocatedSeconds = payload.customSeconds || agenda.defaultSpeechSeconds;
        const newItem: SpeakerQueueItem = {
          id,
          agendaItemId: agenda.id,
          representativeId: payload.representativeId,
          type: 'MAIN',
          allocatedSeconds,
          status: state.activeSpeakerQueueId ? 'WAITING' : 'ACTIVE'
        };
        state.speakerQueue.push(newItem);
        if (!state.activeSpeakerQueueId) {
          state.activeSpeakerQueueId = newItem.id;
          state.timer = {
            status: 'STOPPED',
            startedAt: null,
            remainingSecondsAtStart: allocatedSeconds,
            allocatedSeconds
          };
        }
      } else if (payload.type === 'REPLY') {
        const activeItem = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
        const parentMainId = activeItem?.type === 'MAIN' ? activeItem.id : activeItem?.parentSpeechId;
        const parentMain = state.speakerQueue.find(s => s.id === parentMainId) || activeItem;

        const replyItem: SpeakerQueueItem = {
          id,
          agendaItemId: agenda.id,
          representativeId: payload.representativeId,
          type: 'REPLY',
          parentSpeechId: parentMain?.id,
          allocatedSeconds: agenda.replySeconds,
          status: 'WAITING'
        };

        const existingResponseIdx = state.speakerQueue.findIndex(
          s => s.parentSpeechId === parentMain?.id && s.type === 'RESPONSE_TO_REPLY' && s.status === 'WAITING'
        );

        if (existingResponseIdx !== -1) {
          state.speakerQueue.splice(existingResponseIdx, 0, replyItem);
        } else {
          const activeIdx = state.speakerQueue.findIndex(s => s.id === state.activeSpeakerQueueId);
          const insertPos = activeIdx !== -1 ? activeIdx + 1 : state.speakerQueue.length;
          const itemsToInsert: SpeakerQueueItem[] = [replyItem];

          if (parentMain) {
            itemsToInsert.push({
              id: 'sq-resp-' + Date.now(),
              agendaItemId: agenda.id,
              representativeId: parentMain.representativeId,
              type: 'RESPONSE_TO_REPLY',
              parentSpeechId: parentMain.id,
              allocatedSeconds: agenda.responseToReplySeconds,
              status: 'WAITING'
            });
          }
          state.speakerQueue.splice(insertPos, 0, ...itemsToInsert);
        }
      }

      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('speaker:remove', (queueId: string) => {
      state.speakerQueue = state.speakerQueue.filter(s => s.id !== queueId);
      if (state.activeSpeakerQueueId === queueId) {
        state.activeSpeakerQueueId = null;
      }
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('overlays:update', (overlays) => {
      state.overlays = { ...state.overlays, ...overlays };
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('system:update', (partialState: Partial<SystemState>) => {
      state = { ...state, ...partialState };
      saveState(state);
      io.emit('state:update', { state, serverTime: Date.now() });
    });

    socket.on('quota:reset', (agendaId: string) => {
      const agenda = state.agendaItems.find(a => a.id === agendaId);
      if (agenda) {
        agenda.partyRemainingSeconds = { ...agenda.partyQuotas };
        saveState(state);
        io.emit('state:update', { state, serverTime: Date.now() });
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🏛️  Parlamentarisk Møte-Timer kjører på http://localhost:${PORT}`);
    console.log(`   - Språk: nb, se, sma, smj, en`);
    console.log(`   - Dashboard (iPad/PC):  http://localhost:${PORT}/dashboard`);
    console.log(`   - Admin & CSV-import:   http://localhost:${PORT}/admin`);
    console.log(`   - Passiv Talerskjerm:   http://localhost:${PORT}/display/podium`);
    console.log(`   - Lower Third (OBS):    http://localhost:${PORT}/overlay/lower-third`);
    console.log(`   - Saksvisning (OBS):    http://localhost:${PORT}/overlay/agenda`);
    console.log(`========================================================\n`);
  });
}

startServer();
