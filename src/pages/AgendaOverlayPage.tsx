import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMeeting } from '../context/MeetingContext';

export const AgendaOverlayPage: React.FC = () => {
  const { state } = useMeeting();
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

  if (!state || !state.overlays.showAgendaBug) {
    return <div className="w-screen h-screen bg-transparent" />;
  }

  const activeAgenda = state.agendaItems.find(a => a.id === state.activeAgendaItemId);
  if (!activeAgenda) return <div className="w-screen h-screen bg-transparent" />;

  return (
    <div className="w-screen h-screen bg-transparent flex items-start justify-end p-12 select-none overflow-hidden">
      <div className="max-w-md bg-slate-950/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden flex items-center">
        <div
          className="px-4 py-4 font-extrabold text-sm uppercase tracking-wider text-white self-stretch flex items-center"
          style={{ backgroundColor: state.organization.primaryColor || '#1e3a8a' }}
        >
          {activeAgenda.caseNumber}
        </div>
        <div className="px-5 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            {state.organization.name} &bull; {t('overlays.currentItem')}
          </div>
          <div className="text-sm font-bold text-white leading-snug mt-0.5">
            {activeAgenda.title}
          </div>
        </div>
      </div>
    </div>
  );
};
