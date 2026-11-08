import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  MessageSquareReply,
  Trash2,
  Tv,
  CornerRightUp,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { useMeeting, formatTime } from '../context/MeetingContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const DashboardPage: React.FC = () => {
  const { state, socket, liveRemainingSeconds, getPartyRemainingLive } = useMeeting();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!state || !socket) {
    return <div className="p-8 text-slate-400">{t('common.loading')}</div>;
  }

  const activeAgenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
  const currentAgendaQueue = state.speakerQueue.filter(
    s => s.agendaItemId === state.activeAgendaItemId && s.status !== 'COMPLETED'
  );
  const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
  const activeRep = state.representatives.find(r => r.id === activeSpeech?.representativeId);
  const activeParty = state.parties.find(p => p.id === activeRep?.partyId);

  const filteredReps = state.representatives.filter(rep => {
    const party = state.parties.find(p => p.id === rep.partyId);
    const q = searchQuery.toLowerCase();
    return (
      rep.name.toLowerCase().includes(q) ||
      (party && party.shortName.toLowerCase().includes(q)) ||
      (rep.seatNumber && rep.seatNumber.toLowerCase().includes(q))
    );
  });

  const timerColor =
    liveRemainingSeconds <= 0
      ? 'text-rose-500 border-rose-500/40 bg-rose-950/30'
      : liveRemainingSeconds <= 30
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
      : 'text-emerald-400 border-emerald-500/30 bg-slate-900';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> {t('common.overview')}
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <span className="font-bold text-slate-100">{state.organization.name}</span>
          <select
            value={state.activeAgendaItemId}
            onChange={e => socket.emit('agenda:select', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500"
          >
            {state.agendaItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.caseNumber}: {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher showBroadcastSelector />

          <button
            onClick={() =>
              socket.emit('overlays:update', { showLowerThird: !state.overlays.showLowerThird })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition ${
              state.overlays.showLowerThird
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Tv className="h-4 w-4" />
            {t('dashboard.lowerThirdBtn')}:{' '}
            {state.overlays.showLowerThird ? t('common.on') : t('common.off')}
          </button>

          <button
            onClick={() =>
              socket.emit('overlays:update', { showAgendaBug: !state.overlays.showAgendaBug })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition ${
              state.overlays.showAgendaBug
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <CornerRightUp className="h-4 w-4" />
            {t('dashboard.agendaBugBtn')}:{' '}
            {state.overlays.showAgendaBug ? t('common.on') : t('common.off')}
          </button>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-12 gap-6 p-6">
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-2xl border ${timerColor} transition-colors`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {t('dashboard.onPodiumNow')}
              </span>
              {activeSpeech && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200">
                  {t(`speechTypes.${activeSpeech.type}`)}
                </span>
              )}
            </div>

            {activeRep ? (
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ backgroundColor: activeParty?.color || '#475569' }}
                >
                  {activeParty?.shortName || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeRep.name}</h2>
                  <p className="text-sm text-slate-300">
                    {activeParty?.name} &bull; {activeRep.title}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 mb-4 text-slate-400 text-lg">
                {t('dashboard.noActiveSpeaker')}
              </div>
            )}

            <div className="text-center my-6">
              <div className="text-7xl font-mono font-bold tracking-tight">
                {formatTime(liveRemainingSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {t('dashboard.allocated')}: {formatTime(state.timer.allocatedSeconds)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {state.timer.status !== 'RUNNING' ? (
                <button
                  onClick={() => socket.emit('timer:start')}
                  disabled={!activeSpeech}
                  className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play className="h-6 w-6 fill-current" /> {t('dashboard.startTime')}
                </button>
              ) : (
                <button
                  onClick={() => socket.emit('timer:pause')}
                  className="py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  <Pause className="h-6 w-6 fill-current" /> {t('dashboard.pause')}
                </button>
              )}

              <button
                onClick={() => socket.emit('speaker:next')}
                className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <SkipForward className="h-6 w-6" /> {t('dashboard.nextSpeaker')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => socket.emit('timer:reset')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> {t('common.reset')}
              </button>
              <button
                onClick={() => socket.emit('timer:adjust', 30)}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
              >
                {t('dashboard.plus30s')}
              </button>
              <button
                onClick={() => socket.emit('timer:adjust', -30)}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
              >
                {t('dashboard.minus30s')}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{t('dashboard.partyQuotasTitle')}</h3>
                <p className="text-xs text-slate-400">
                  {t('dashboard.debateFormLabel')}:{' '}
                  {activeAgenda
                    ? t(`debateTypes.${activeAgenda.debateType}`)
                    : ''}
                </p>
              </div>
              {activeAgenda && (
                <button
                  onClick={() => socket.emit('quota:reset', activeAgenda.id)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  {t('dashboard.resetQuotas')}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {state.parties.map(party => {
                const allocated = activeAgenda?.partyQuotas[party.id] || 0;
                const remaining = getPartyRemainingLive(party.id);
                const pct =
                  allocated > 0 ? Math.min(100, Math.max(0, (remaining / allocated) * 100)) : 0;
                return (
                  <div key={party.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: party.color }}
                        />
                        {party.name} ({party.shortName})
                      </span>
                      <span className="font-mono font-semibold">
                        {formatTime(remaining)}{' '}
                        <span className="text-slate-500 text-xs">/ {formatTime(allocated)}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: remaining <= 30 ? '#ef4444' : party.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {t('dashboard.speakerListTitle')} ({currentAgendaQueue.length})
            </h3>
            <span className="text-xs text-slate-400">{activeAgenda?.caseNumber}</span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-1">
            {currentAgendaQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                {t('dashboard.emptyQueue')}
              </div>
            ) : (
              currentAgendaQueue.map((item, idx) => {
                const rep = state.representatives.find(r => r.id === item.representativeId);
                const party = state.parties.find(p => p.id === rep?.partyId);
                const isActive = item.id === state.activeSpeakerQueueId;
                const isSubItem = item.type === 'REPLY' || item.type === 'RESPONSE_TO_REPLY';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isSubItem ? 'ml-6' : ''
                    } ${
                      isActive
                        ? 'bg-blue-950/40 border-blue-500/60'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-9 w-9 rounded-lg font-bold text-xs text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: party?.color || '#475569' }}
                      >
                        {party?.shortName}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-white truncate flex items-center gap-2">
                          <span>
                            {idx + 1}. {rep?.name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span
                            className={
                              item.type === 'MAIN'
                                ? 'text-blue-400'
                                : item.type === 'REPLY'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {isSubItem ? '↳ ' : ''}
                            {t(`speechTypes.${item.type}`)}
                          </span>
                          <span>&bull; {formatTime(item.allocatedSeconds)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => socket.emit('speaker:activate', item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-xs font-medium transition"
                        >
                          {t('dashboard.giveFloor')}
                        </button>
                      )}
                      <button
                        onClick={() => socket.emit('speaker:remove', item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title={t('common.remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-400" />
            {t('dashboard.registerRepTitle')}
          </h3>

          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full mb-4 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
          />

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredReps.map(rep => {
              const party = state.parties.find(p => p.id === rep.partyId);
              return (
                <div
                  key={rep.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-7 w-7 rounded-md font-bold text-xs text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: party?.color || '#475569' }}
                    >
                      {party?.shortName}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{rep.name}</p>
                      <p className="text-xs text-slate-400 truncate">{rep.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        socket.emit('speaker:add', { representativeId: rep.id, type: 'MAIN' })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t('speechTypes.shortMain')}
                    </button>
                    <button
                      onClick={() =>
                        socket.emit('speaker:add', { representativeId: rep.id, type: 'REPLY' })
                      }
                      disabled={!activeSpeech}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 disabled:opacity-30 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <MessageSquareReply className="h-3.5 w-3.5" /> {t('speechTypes.shortReply')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
