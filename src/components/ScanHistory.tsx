import React from 'react';
import { AnalysisResult } from '../types';
import { History, Trash2, ArrowUpRight, ShieldCheck, ShieldAlert, AlertTriangle, Calendar, FileText } from 'lucide-react';

interface ScanHistoryProps {
  history: AnalysisResult[];
  onSelectScan: (scan: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onSelectScan,
  onClearHistory
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <History className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">
          Aucun historique d'analyse
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Vos analyses récentes apparaîtront ici automatiquement (sauvegardées localement dans votre navigateur).
        </p>
      </div>
    );
  }

  const getScoreBadge = (score: number, level: string) => {
    if (level === 'high') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          {score}/100 - Élevé
        </span>
      );
    }
    if (level === 'medium') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {score}/100 - Modéré
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        {score}/100 - Sûr
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Historique des Analyses ({history.length})
          </h3>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Vider l'historique</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectScan(item)}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
          >
            <div className="overflow-hidden space-y-1 w-full sm:w-auto flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                  {item.inputType}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                {item.input}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
              {getScoreBadge(item.overallScore, item.riskLevel)}
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/50 transition-all">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
