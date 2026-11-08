import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMeeting, formatTime } from '../context/MeetingContext';

export const LowerThirdOverlayPage: React.FC = () => {
  const { state, liveRemainingSeconds } = useMeeting();
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const langParam = searchParams.get('lang');
  const activeLang = langParam || state?.organization.defaultLanguage || 'nb';
  const t = i18n.getFixedT(activeLang);

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  if (!state || !state.overlays.showLowerThird || !state.activeSpeakerQueueId) {
    return <div className="w-screen h-screen bg-transparent" />;
  }

  const activeSpeech = state.speakerQueue.find(s => s.id === state.activeSpeakerQueueId);
  const rep = state.representatives.find(r => r.id === activeSpeech?.representativeId);
  const party = state.parties.find(p => p.id === rep?.partyId);

  if (!rep || !activeSpeech) return <div className="w-screen h-screen bg-transparent" />;

  return (
    <div className="w-screen h-screen bg-transparent flex items-end justify-start p-16 select-none overflow-hidden">
      <div className="flex items-stretch bg-slate-950/95 text-white rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden min-w-[560px]">
        <div className="w-3" style={{ backgroundColor: party?.color || '#3b82f6' }} />

        {state.organization.logoUrl && (
          <div className="bg-slate-900/90 px-5 py-4 flex items-center justify-center border-r border-slate-800">
            <img
              src={state.organization.logoUrl}
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
          </div>
        )}

        <div className="px-6 py-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            <span
              className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase tracking-wider text-white"
              style={{ backgroundColor: party?.color || '#3b82f6' }}
            >
              {party?.name || t('common.independent')}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {t(`speechTypes.${activeSpeech.type}`)}
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-white mt-1">{rep.name}</div>
          <div className="text-xs text-slate-400 font-medium">{rep.title}</div>
        </div>

        {state.overlays.lowerThirdShowTimer && (
          <div className="px-6 py-4 bg-slate-900/90 border-l border-slate-800 flex flex-col items-center justify-center min-w-[130px]">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              {t('overlays.speakingTime')}
            </span>
            <span
              className={`text-3xl font-mono font-bold mt-0.5 ${
                liveRemainingSeconds <= 0
                  ? 'text-rose-500'
                  : liveRemainingSeconds <= 30
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatTime(liveRemainingSeconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
