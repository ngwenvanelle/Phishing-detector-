import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, CheckCircle, FileCode } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  standaloneHtmlContent: string;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  onClose,
  standaloneHtmlContent
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phishguard-standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Version Autonome : 1 Seul Fichier HTML
              </h3>
              <p className="text-xs text-slate-400">
                Fichier HTML complet prêt à l'emploi (CSS + JS + Moteur de détection embarqué)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Taille du fichier : <span className="font-mono text-cyan-400">~22 Ko</span> (100% autonome, zéro dépendance externe)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'HTML Copié !' : 'Copier tout le code HTML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger .html</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 flex-1 overflow-auto bg-slate-950/60 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap select-all">
            {standaloneHtmlContent.slice(0, 2500)}
            {standaloneHtmlContent.length > 2500 ? '\n\n... [Code complet prêt à être téléchargé ou copié] ...' : ''}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
