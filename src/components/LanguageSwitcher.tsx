import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, setUiLanguage, LanguageCode } from '../i18n';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  showBroadcastSelector?: boolean;
}

export const LanguageSwitcher: React.FC<Props> = ({ showBroadcastSelector = false }) => {
  const { i18n, t } = useTranslation();
  const { state, socket } = useMeeting();

  const handleBroadcastLangChange = (lang: LanguageCode) => {
    if (!state || !socket) return;
    socket.emit('system:update', {
      organization: {
        ...state.organization,
        defaultLanguage: lang
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Lokalt skjermspråk for den enkelte bruker (Møteleder / Admin) */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
        <Globe className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-slate-400 hidden sm:inline">{t('common.uiLanguage')}:</span>
        <select
          value={i18n.language}
          onChange={e => setUiLanguage(e.target.value as LanguageCode)}
          className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
              {lang.nativeName} ({lang.code})
            </option>
          ))}
        </select>
      </div>

      {/* Globalt visningsspråk for Passiv Talerskjerm og OBS/vMix Overlays */}
      {showBroadcastSelector && state && (
        <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-1.5">
          <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
            {t('common.broadcastLanguage')}:
          </span>
          <select
            value={state.organization.defaultLanguage || 'nb'}
            onChange={e => handleBroadcastLangChange(e.target.value as LanguageCode)}
            className="bg-transparent text-xs font-bold text-emerald-300 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                {lang.nativeName} ({lang.code})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
