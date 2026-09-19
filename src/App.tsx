import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerForm } from './components/ScannerForm';
import { ScanResults } from './components/ScanResults';
import { ScanHistory } from './components/ScanHistory';
import { HowItWorksModal } from './components/HowItWorksModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { AnalysisResult } from './types';
import { analyzeInput, SCAN_SAMPLES } from './lib/detector';
import { STANDALONE_HTML } from './lib/standaloneTemplate';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  Lock, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Zap,
  Globe
} from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'how-it-works'>('scanner');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('phishguard_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }

    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setServerOnline(true);
        }
      })
      .catch(() => {
        setServerOnline(false);
      });
  }, []);

  // Save history to localStorage
  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory(prev => {
      // filter out duplicate input
      const filtered = prev.filter(item => item.input !== newResult.input);
      const updated = [newResult, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('phishguard_history', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('phishguard_history');
    } catch {}
  };

  const handleSelectFromHistory = (item: AnalysisResult) => {
    setInput(item.input);
    setCurrentResult(item);
    setActiveTab('scanner');
  };

  const handleAnalyze = async (useAi: boolean) => {
    if (!input.trim()) return;

    setIsLoading(true);

    try {
      // Try server endpoint first
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim(), useAi })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentResult(data.result);
        saveToHistory(data.result);
      } else {
        // Fallback to client-side detection engine
        const fallbackResult = analyzeInput(input.trim());
        setCurrentResult(fallbackResult);
        saveToHistory(fallbackResult);
      }
    } catch (err) {
      // Offline / Network fallback
      const localResult = analyzeInput(input.trim());
      setCurrentResult(localResult);
      saveToHistory(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Cyber Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStandaloneModal={() => setIsStandaloneModalOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner / Cyber Threat Context */}
        {activeTab === 'scanner' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 mb-3 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Moteur Cyber-Défense Heuristique & IA
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Analyseur & Détecteur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Phishing</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                  Analysez en quelques millisecondes une URL, une adresse email ou un message suspect. PhishGuard dissèque le typosquatting, l'urgence artificielle, les sous-domaines trompeurs et les extensions à haut risque.
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>50+ Marques Surveillées</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Chiffrement & TLD</span>
                </div>
              </div>
            </div>

            {/* Scanner Input Form */}
            <ScannerForm
              input={input}
              setInput={setInput}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />

            {/* Analysis Results View */}
            {currentResult && (
              <div className="pt-4" id="results-section">
                <ScanResults result={currentResult} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Methodology ("Comment ça marche") */}
        {activeTab === 'how-it-works' && (
          <HowItWorksModal />
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <ScanHistory
            history={history}
            onSelectScan={handleSelectFromHistory}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Standalone HTML Modal */}
      <StandaloneExportModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
        standaloneHtmlContent={STANDALONE_HTML}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>PhishGuard Plateforme CyberSécurité</span>
            <span>•</span>
            <span>Prêt au déploiement en ligne</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('how-it-works')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Comment ça marche
            </button>
            <span>•</span>
            <button
              onClick={() => setIsStandaloneModalOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Exporter en 1 seul HTML
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
