import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, BookOpen, History, Code, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'history' | 'how-it-works';
  setActiveTab: (tab: 'scanner' | 'history' | 'how-it-works') => void;
  onOpenStandaloneModal: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStandaloneModal,
  historyCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-colors">
            <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PhishGuard
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wider uppercase">
                v2.4 CyberSec
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Détecteur de phishing & analyseur de menaces
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-scanner-btn"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Analyseur</span>
            </button>

            <button
              id="nav-how-it-works-btn"
              onClick={() => setActiveTab('how-it-works')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'how-it-works'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Méthodologie</span>
              <span className="sm:hidden">Aide</span>
            </button>

            <button
              id="nav-history-btn"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Historique</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-900 text-cyan-300 border border-cyan-700">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Standalone HTML Export button */}
          <button
            id="export-standalone-btn"
            onClick={onOpenStandaloneModal}
            title="Télécharger ou copier la version 1 seul fichier HTML autonome"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">1 seul HTML</span>
          </button>
        </div>
      </div>
    </header>
  );
};
