import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMeeting, formatTime } from '../context/MeetingContext';

export const PodiumDisplayPage: React.FC = () => {
  const { state, liveRemainingSeconds, getPartyRemainingLive } = useMeeting();
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const langParam = searchParams.get('lang');
  const activeLang = langParam || state?.organization.defaultLanguage || 'nb';
  const t = i18n.getFixedT(activeLang);

  if (!state) {
    return (
      <div className="h-[100dvh] w-screen bg-black text-white flex items-center justify-center p-6 text-xl">
        {t('common.connecting')}
      </div>
    );
  }

  const activeAgenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
  const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
  const activeRep = state.representatives.find(r => r.id === activeSpeech?.representativeId);
  const activeParty = state.parties.find(p => p.id === activeRep?.partyId);

  const upcomingQueue = state.speakerQueue
    .filter(
      s =>
        s.agendaItemId === state.activeAgendaItemId &&
        s.status === 'WAITING' &&
        s.id !== state.activeSpeakerQueueId
    )
    .slice(0, 4);

  const isOvertime = liveRemainingSeconds <= 0;
  const isWarning = liveRemainingSeconds > 0 && liveRemainingSeconds <= 30;

  // Beregn fremdriftslinje (prosent) for visuell feedback på talerstolen
  const totalAllocated = state.timer.allocatedSeconds || 180;
  const progressPct =
    totalAllocated > 0
      ? Math.min(100, Math.max(0, (liveRemainingSeconds / totalAllocated) * 100))
      : 0;

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-slate-950 text-white flex flex-col p-[clamp(0.5rem,2vmin,2rem)] select-none">
      {/* Kompakt og skalerbar toppbar */}
      <header className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-800/90 pb-[clamp(0.4rem,1.5vh,1.25rem)] mb-[clamp(0.5rem,2vh,1.5rem)]">
        <div className="flex items-center gap-[clamp(0.5rem,1.5vw,1.25rem)] min-w-0">
          {state.organization.logoUrl && (
            <img
              src={state.organization.logoUrl}
              alt="Logo"
              className="h-[clamp(2rem,6vh,4rem)] w-[clamp(2rem,6vh,4rem)] object-contain shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="text-[clamp(0.6rem,1.4vmin,0.9rem)] uppercase tracking-widest text-slate-400 font-semibold truncate">
              {state.organization.name}
            </div>
            <h1 className="text-[clamp(0.9rem,2.6vmin,2rem)] font-bold text-white truncate leading-tight">
              {activeAgenda
                ? `${activeAgenda.caseNumber}: ${activeAgenda.title}`
                : t('podium.noAgendaSelected')}
            </h1>
          </div>
        </div>

        {/* Status-indikator for debattype */}
        {activeAgenda && (
          <div className="shrink-0 hidden sm:flex items-center px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[clamp(0.6rem,1.3vmin,0.85rem)] text-slate-300 font-medium">
            {t(`debateTypes.${activeAgenda.debateType}`)}
          </div>
        )}
      </header>

      {/* Hovedflate: Låst til 2 kolonner både på PC, iPad og iPhone i horisontal-modus (landscape) */}
      <main className="flex-1 min-h-0 grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-[clamp(0.5rem,2vmin,2rem)]">
        {/* Venstre kolonne (8/12): Aktiv taler og skalerende nedtellingsklokke */}
        <section className="landscape:col-span-7 md:col-span-8 min-h-0 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-[clamp(0.75rem,3vmin,2.5rem)] shadow-2xl relative overflow-hidden">
          {/* Aktiv taler-info */}
          <div className="shrink-0 flex flex-wrap items-center justify-center gap-[clamp(0.4rem,1.5vmin,1rem)] text-center z-10">
            {activeRep && activeSpeech ? (
              <>
                <span
                  className="px-[clamp(0.5rem,1.5vmin,1rem)] py-[clamp(0.15rem,0.6vmin,0.4rem)] rounded-lg font-extrabold text-[clamp(0.8rem,2.2vmin,1.5rem)] text-white shadow"
                  style={{ backgroundColor: activeParty?.color || '#3b82f6' }}
                >
                  {activeParty?.shortName}
                </span>
                <span className="text-[clamp(1.1rem,3.6vmin,2.75rem)] font-bold tracking-tight truncate max-w-full">
                  {activeRep.name}
                </span>
                <span className="px-[clamp(0.5rem,1.2vmin,0.85rem)] py-[clamp(0.15rem,0.5vmin,0.35rem)] rounded-full text-[clamp(0.6rem,1.4vmin,0.9rem)] uppercase tracking-wider bg-slate-800 text-slate-300 font-semibold">
                  {t(`speechTypes.${activeSpeech.type}`)}
                </span>
              </>
            ) : (
              <div className="text-[clamp(1rem,3vmin,2rem)] text-slate-500 font-medium">
                {t('podium.podiumFree')}
              </div>
            )}
          </div>

          {/* Skalerbar (Fluid) Nedtellingsklokke */}
          <div className="my-auto flex flex-col items-center justify-center py-1 z-10">
            <div
              className={`font-mono font-extrabold tracking-tight leading-none text-[clamp(3.5rem,20vmin,13rem)] tabular-nums transition-colors ${
                isOvertime
                  ? 'text-rose-500 animate-pulse'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatTime(liveRemainingSeconds)}
            </div>

            {isOvertime && (
              <div className="mt-[clamp(0.2rem,1vh,0.75rem)] text-[clamp(0.8rem,2.2vmin,1.6rem)] font-bold uppercase tracking-widest text-rose-400">
                {t('podium.timeIsUp')}
              </div>
            )}
          </div>

          {/* Visuell fremdriftslinje i bunnen av klokkekortet */}
          <div className="shrink-0 w-full h-[clamp(0.35rem,1.2vh,0.75rem)] bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOvertime
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${isOvertime ? 100 : progressPct}%` }}
            />
          </div>
        </section>

        {/* Høyre kolonne (4/12): Neste på talelisten & Partikvoter - tilpasset høyden */}
        <aside className="landscape:col-span-5 md:col-span-4 min-h-0 flex flex-col gap-[clamp(0.5rem,1.8vmin,1.5rem)]">
          {/* Neste på talelisten */}
          <div className="flex-1 min-h-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-[clamp(0.6rem,2vmin,1.5rem)] flex flex-col">
            <h2 className="shrink-0 text-[clamp(0.65rem,1.4vmin,0.9rem)] font-bold uppercase tracking-wider text-slate-400 mb-[clamp(0.4rem,1.2vh,1rem)]">
              {t('podium.nextInQueue')} ({upcomingQueue.length})
            </h2>

            {upcomingQueue.length === 0 ? (
              <p className="text-slate-500 text-[clamp(0.75rem,1.6vmin,1rem)] my-auto">
                {t('podium.noMoreSpeakers')}
              </p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-[clamp(0.3rem,1vh,0.75rem)] pr-1">
                {upcomingQueue.map((item, idx) => {
                  const rep = state.representatives.find(r => r.id === item.representativeId);
                  const party = state.parties.find(p => p.id === rep?.partyId);
                  return (
                    <div
                      key={item.id}
                      className="p-[clamp(0.35rem,1.2vmin,0.85rem)] rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-[clamp(0.4rem,1vmin,0.75rem)] min-w-0">
                        <span
                          className="h-[clamp(1.4rem,3.5vmin,2.2rem)] w-[clamp(1.4rem,3.5vmin,2.2rem)] rounded-md font-bold text-[clamp(0.6rem,1.3vmin,0.8rem)] flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: party?.color || '#475569' }}
                        >
                          {party?.shortName}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-[clamp(0.75rem,1.8vmin,1.1rem)] truncate leading-tight">
                            {idx + 1}. {rep?.name}
                          </div>
                          <div className="text-[clamp(0.6rem,1.3vmin,0.8rem)] text-slate-400 truncate">
                            {t(`speechTypes.${item.type}`)}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[clamp(0.7rem,1.6vmin,1rem)] text-slate-300 shrink-0 tabular-nums">
                        {formatTime(item.allocatedSeconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gjenstående partikvoter */}
          {activeAgenda?.debateType === 'PARTY_QUOTA' && (
            <div className="shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-[clamp(0.6rem,2vmin,1.5rem)]">
              <h2 className="text-[clamp(0.65rem,1.4vmin,0.9rem)] font-bold uppercase tracking-wider text-slate-400 mb-[clamp(0.4rem,1.2vh,0.85rem)]">
                {t('podium.remainingPartyQuotas')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-2 gap-[clamp(0.3rem,1vmin,0.65rem)]">
                {state.parties.map(p => {
                  const rem = getPartyRemainingLive(p.id);
                  return (
                    <div
                      key={p.id}
                      className="px-[clamp(0.4rem,1.2vmin,0.75rem)] py-[clamp(0.25rem,0.8vmin,0.6rem)] rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-1"
                    >
                      <span className="font-bold text-[clamp(0.65rem,1.5vmin,0.95rem)] flex items-center gap-1.5 truncate">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.shortName}
                      </span>
                      <span
                        className={`font-mono font-semibold text-[clamp(0.65rem,1.5vmin,0.95rem)] tabular-nums ${
                          rem <= 30 ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        {formatTime(rem)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};
