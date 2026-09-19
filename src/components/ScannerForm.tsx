import React, { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, Globe, Mail, FileText, ArrowRight, CornerDownLeft, ClipboardPaste, X } from 'lucide-react';
import { SCAN_SAMPLES } from '../lib/detector';
import { ScanSample } from '../types';

interface ScannerFormProps {
  input: string;
  setInput: (value: string) => void;
  onAnalyze: (useAi: boolean) => void;
  isLoading: boolean;
}

export const ScannerForm: React.FC<ScannerFormProps> = ({
  input,
  setInput,
  onAnalyze,
  isLoading
}) => {
  const [useAi, setUseAi] = useState(false);

  // Guess input type for UX hints
  const getGuessedType = () => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (trimmed.includes('\n') || trimmed.length > 250) return { label: 'Texte / Email complet', icon: FileText, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800' };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { label: 'Adresse Email', icon: Mail, color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    if (/^(https?:\/\/|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i.test(trimmed)) return { label: 'URL / Lien Web', icon: Globe, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
    return { label: 'Contenu Brut', icon: FileText, color: 'text-slate-400 bg-slate-900 border-slate-700' };
  };

  const detected = getGuessedType();

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) setInput(text);
      }
    } catch {
      // Ignore if denied
    }
  };

  const handleSelectSample = (sample: ScanSample) => {
    setInput(sample.input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onAnalyze(useAi);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header bar of form with type detection badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Cible d'analyse :
            </span>
            {detected ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${detected.color}`}>
                <detected.icon className="w-3 h-3" />
                {detected.label}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Collez une URL, un email ou un texte suspect
              </span>
            )}
          </div>

          {/* Quick paste / clear buttons */}
          <div className="flex items-center gap-2">
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
                title="Effacer"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors"
              title="Coller depuis le presse-papiers"
            >
              <ClipboardPaste className="w-3 h-3" />
              Coller
            </button>
          </div>
        </div>

        {/* Input box */}
        <div className="relative group">
          <textarea
            id="analysis-input"
            rows={input.includes('\n') || input.length > 90 ? 4 : 2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex : https://paypa1-account-verification.xyz/login ou ameli-dossier-securise.top ou service@gmail.com..."
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-y"
            disabled={isLoading}
          />
        </div>

        {/* Action Controls & AI toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* AI toggle option */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              id="ai-toggle-checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Scan Approfondi IA (Gemini CTI)
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-analysis-btn"
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg cursor-pointer ${
              !input.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyse heuristique en cours...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyser la menace</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Test Samples */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Exemples concrets à tester en 1 clic :
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCAN_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all text-left flex items-center gap-1.5 ${
                sample.category === 'phishing'
                  ? 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-900/50 hover:border-rose-700'
                  : 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border-emerald-900/50 hover:border-emerald-700'
              }`}
              title={sample.description}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sample.category === 'phishing' ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
