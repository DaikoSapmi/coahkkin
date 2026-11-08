import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Settings, Monitor, Tv, CornerRightUp } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const HomePage: React.FC = () => {
  const { state } = useMeeting();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            {state?.organization.logoUrl && (
              <img src={state.organization.logoUrl} alt="Logo" className="h-14 w-14 object-contain" />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {state?.organization.name || t('home.defaultTitle')}
              </h1>
              <p className="text-slate-400">{t('home.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LanguageSwitcher showBroadcastSelector />
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('common.serverConnected')}
            </span>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/dashboard"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold group-hover:text-blue-400 transition">
                {t('home.dashboardTitle')}
              </h2>
              <p className="text-slate-400 text-sm">{t('home.dashboardDesc')}</p>
            </div>
            <span className="mt-6 text-sm font-medium text-blue-400">
              {t('home.openDashboard')} &rarr;
            </span>
          </Link>

          <Link
            to="/admin"
            className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Settings className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold group-hover:text-amber-400 transition">
                {t('home.adminTitle')}
              </h2>
              <p className="text-slate-400 text-sm">{t('home.adminDesc')}</p>
            </div>
            <span className="mt-6 text-sm font-medium text-amber-400">
              {t('home.openAdmin')} &rarr;
            </span>
          </Link>
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            {t('home.screensHeader')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/display/podium"
              target="_blank"
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition space-y-2"
            >
              <div className="flex items-center gap-3 text-emerald-400 font-medium">
                <Monitor className="h-5 w-5" />
                <span>{t('home.podiumTitle')}</span>
              </div>
              <p className="text-xs text-slate-400">{t('home.podiumDesc')}</p>
            </Link>

            <Link
              to="/overlay/lower-third"
              target="_blank"
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition space-y-2"
            >
              <div className="flex items-center gap-3 text-purple-400 font-medium">
                <Tv className="h-5 w-5" />
                <span>{t('home.lowerThirdTitle')}</span>
              </div>
              <p className="text-xs text-slate-400">{t('home.lowerThirdDesc')}</p>
            </Link>

            <Link
              to="/overlay/agenda"
              target="_blank"
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition space-y-2"
            >
              <div className="flex items-center gap-3 text-cyan-400 font-medium">
                <CornerRightUp className="h-5 w-5" />
                <span>{t('home.agendaBugTitle')}</span>
              </div>
              <p className="text-xs text-slate-400">{t('home.agendaBugDesc')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
