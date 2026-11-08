import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';
import { ArrowLeft, Upload, Plus, Trash2, Save, Building2, FileSpreadsheet } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { AgendaItem, Party, Representative } from '../types';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AdminPage: React.FC = () => {
  const { state, socket } = useMeeting();
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState('');
  const [orgSubtitle, setOrgSubtitle] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgLang, setOrgLang] = useState<LanguageCode>('nb');
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newDebateType, setNewDebateType] = useState<'INDIVIDUAL' | 'PARTY_QUOTA'>('INDIVIDUAL');
  const [newMainSeconds, setNewMainSeconds] = useState(180);
  const [newReplySeconds] = useState(60);

  React.useEffect(() => {
    if (state) {
      setOrgName(state.organization.name);
      setOrgSubtitle(state.organization.subtitle);
      setOrgLogo(state.organization.logoUrl);
      setOrgLang(state.organization.defaultLanguage || 'nb');
    }
  }, [state]);

  if (!state || !socket) {
    return <div className="p-8 text-slate-400">{t('common.loading')}</div>;
  }

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('system:update', {
      organization: {
        ...state.organization,
        name: orgName,
        subtitle: orgSubtitle,
        logoUrl: orgLogo,
        defaultLanguage: orgLang
      }
    });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const updatedParties: Party[] = [...state.parties];
        const newReps: Representative[] = [];

        results.data.forEach((row, idx) => {
          const name = row['Navn'] || row['name'] || row['Representant'];
          const partyName = row['Parti'] || row['party'] || t('common.independent');
          const shortName =
            row['Partiforkortelse'] ||
            row['short'] ||
            partyName.substring(0, 3).toUpperCase();
          const color = row['Partifarge'] || row['color'] || '#3b82f6';
          const title = row['Tittel'] || row['title'] || t('common.representative');

          if (!name) return;

          let party = updatedParties.find(
            p =>
              p.shortName.toLowerCase() === shortName.toLowerCase() ||
              p.name.toLowerCase() === partyName.toLowerCase()
          );

          if (!party) {
            party = {
              id: shortName.toLowerCase().replace(/[^a-z0-9]/g, '') || `p-${idx}`,
              name: partyName,
              shortName,
              color
            };
            updatedParties.push(party);
          }

          newReps.push({
            id: `rep-csv-${Date.now()}-${idx}`,
            name,
            partyId: party.id,
            title
          });
        });

        if (newReps.length > 0) {
          socket.emit('system:update', {
            parties: updatedParties,
            representatives: newReps
          });
          setCsvFeedback(
            t('admin.csvSuccess', {
              repCount: newReps.length,
              partyCount: updatedParties.length
            })
          );
        } else {
          setCsvFeedback(t('admin.csvError'));
        }
      }
    });
  };

  const handleAddAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseNumber || !newCaseTitle) return;

    const quotas: Record<string, number> = {};
    state.parties.forEach(p => {
      quotas[p.id] = 600;
    });

    const newItem: AgendaItem = {
      id: 'sak-' + Date.now(),
      caseNumber: newCaseNumber,
      title: newCaseTitle,
      description: '',
      debateType: newDebateType,
      defaultSpeechSeconds: Number(newMainSeconds),
      replySeconds: Number(newReplySeconds),
      responseToReplySeconds: Number(newReplySeconds),
      maxRepliesPerSpeech: 2,
      deductRepliesFromPartyQuota: false,
      partyQuotas: { ...quotas },
      partyRemainingSeconds: { ...quotas }
    };

    socket.emit('system:update', {
      agendaItems: [...state.agendaItems, newItem]
    });

    setNewCaseNumber('');
    setNewCaseTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> {t('common.back')}
            </Link>
            <h1 className="text-2xl font-bold">{t('admin.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
            >
              {t('admin.goToDashboard')} &rarr;
            </Link>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <form
            onSubmit={handleSaveOrg}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              {t('admin.orgSectionTitle')}
            </h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t('admin.orgNameLabel')}</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.orgSubtitleLabel')}
              </label>
              <input
                type="text"
                value={orgSubtitle}
                onChange={e => setOrgSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t('admin.orgLogoLabel')}</label>
              <input
                type="text"
                value={orgLogo}
                onChange={e => setOrgLogo(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.broadcastLanguageLabel')}
              </label>
              <select
                value={orgLang}
                onChange={e => setOrgLang(e.target.value as LanguageCode)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} — {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> {t('admin.saveProfileBtn')}
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              {t('admin.csvSectionTitle')}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{t('admin.csvHelpText')}</p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 cursor-pointer transition bg-slate-950/50">
              <Upload className="h-8 w-8 text-emerald-400 mb-2" />
              <span className="text-sm font-medium">{t('admin.csvClickToSelect')}</span>
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            </label>

            {csvFeedback && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs">
                {csvFeedback}
              </div>
            )}

            <div className="text-xs text-slate-400 pt-2">
              {t('admin.csvCurrentStats', {
                repCount: state.representatives.length,
                partyCount: state.parties.length
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{t('admin.agendaSectionTitle')}</h2>

          <form onSubmit={handleAddAgendaItem} className="grid md:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.caseNumberLabel')}
              </label>
              <input
                type="text"
                placeholder="PS 26/26"
                value={newCaseNumber}
                onChange={e => setNewCaseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.caseTitleLabel')}
              </label>
              <input
                type="text"
                placeholder={t('admin.caseTitlePlaceholder')}
                value={newCaseTitle}
                onChange={e => setNewCaseTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.debateTypeLabel')}
              </label>
              <select
                value={newDebateType}
                onChange={e => setNewDebateType(e.target.value as 'INDIVIDUAL' | 'PARTY_QUOTA')}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              >
                <option value="INDIVIDUAL">{t('debateTypes.shortIndividual')}</option>
                <option value="PARTY_QUOTA">{t('debateTypes.shortPartyQuota')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t('admin.speechSecondsLabel')}
              </label>
              <input
                type="number"
                value={newMainSeconds}
                onChange={e => setNewMainSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" /> {t('admin.addAgendaBtn')}
            </button>
          </form>

          <div className="space-y-3">
            {state.agendaItems.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase">
                    {item.caseNumber} &bull; {t(`debateTypes.${item.debateType}`)}
                  </span>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400">
                    {t('speechTypes.MAIN')}: {item.defaultSpeechSeconds}s &bull;{' '}
                    {t('speechTypes.REPLY')}: {item.replySeconds}s
                  </p>
                </div>
                <button
                  onClick={() =>
                    socket.emit('system:update', {
                      agendaItems: state.agendaItems.filter(a => a.id !== item.id)
                    })
                  }
                  className="p-2 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
