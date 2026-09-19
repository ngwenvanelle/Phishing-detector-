import React, { useState } from 'react';
import { AnalysisResult, RiskSignal } from '../types';
import { RiskGauge } from './RiskGauge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Globe, 
  Lock, 
  Unlock, 
  Server, 
  Tag, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileSearch,
  HelpCircle
} from 'lucide-react';

interface ScanResultsProps {
  result: AnalysisResult;
}

export const ScanResults: React.FC<ScanResultsProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showAllSignals, setShowAllSignals] = useState(true);

  const handleCopyReport = () => {
    const reportText = `[RAPPORT PHISHGUARD CYBERSEC]
Date: ${new Date(result.timestamp).toLocaleString('fr-FR')}
Cible: ${result.input}
Score de Risque: ${result.overallScore}/100 (${result.riskLevel.toUpperCase()})
Verdict: ${result.verdict}

Signaux d'alerte détectés (${result.signals.length}):
${result.signals.map(s => `- [${s.severity.toUpperCase()}] ${s.title}: ${s.description}`).join('\n')}

Recommandations:
${result.recommendations.map(r => `- ${r}`).join('\n')}
Généré par PhishGuard CyberSec`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (sev: 'low' | 'medium' | 'high') => {
    switch (sev) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800">CRITIQUE</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">MODÉRÉ</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-800">FAIBLE</span>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'typosquatting': return 'Typosquatting & Usurpation';
      case 'urgency': return 'Pression Psychologique';
      case 'technical': return 'Indicateur Technique';
      case 'credentials': return 'Vol d\'Identifiants';
      case 'sender': return 'Expéditeur Falsifié';
      case 'structure': return 'Structure Trompeuse';
      default: return 'Sécurité';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Gauge & Metrics */}
      <RiskGauge
        score={result.overallScore}
        riskLevel={result.riskLevel}
        verdict={result.verdict}
        metrics={result.metrics}
      />

      {/* Target Preview & Quick Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Élément analysé
            </div>
            <div className="text-sm font-mono text-cyan-300 truncate max-w-xl">
              {result.input}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Rapport copié !' : 'Copier le rapport'}</span>
        </button>
      </div>

      {/* Domain Inspector Card if URL or Domain is detected */}
      {result.domainAnalysis.extractedDomain && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              Inspection Technique du Domaine
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Type : {result.inputType.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Protocol */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                {result.domainAnalysis.isHttps ? (
                  <Lock className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Unlock className="w-3 h-3 text-rose-400" />
                )}
                Protocole
              </div>
              <div className="font-mono text-sm font-bold">
                {result.domainAnalysis.protocol === 'https' ? (
                  <span className="text-emerald-400">HTTPS (Chiffré)</span>
                ) : result.domainAnalysis.protocol === 'http' ? (
                  <span className="text-rose-400">HTTP (Non chiffré)</span>
                ) : (
                  <span className="text-slate-400">Non spécifié</span>
                )}
              </div>
            </div>

            {/* Extracted Host */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                Nom d'hôte extrait
              </div>
              <div className="font-mono text-sm font-bold text-slate-200 truncate" title={result.domainAnalysis.extractedDomain}>
                {result.domainAnalysis.extractedDomain}
              </div>
            </div>

            {/* TLD */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-400" />
                Extension (TLD)
              </div>
              <div className="font-mono text-sm font-bold">
                {result.domainAnalysis.isSuspiciousTld ? (
                  <span className="text-rose-400">.{result.domainAnalysis.tld} (À risque)</span>
                ) : (
                  <span className="text-slate-300">.{result.domainAnalysis.tld || 'N/A'} (Standard)</span>
                )}
              </div>
            </div>

            {/* Host type (Domain vs IP) */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Server className="w-3 h-3 text-amber-400" />
                Résolution Hôte
              </div>
              <div className="font-mono text-sm font-bold">
                {result.domainAnalysis.isIpAddress ? (
                  <span className="text-rose-400">IP directe (Danger)</span>
                ) : (
                  <span className="text-emerald-400">Nom de domaine DNS</span>
                )}
              </div>
            </div>
          </div>

          {/* Brand Impersonation Spotlight */}
          {result.domainAnalysis.matchedBrand && (
            <div className="bg-rose-950/20 border border-rose-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Usurpation de marque repérée : {result.domainAnalysis.matchedBrand.brandName}
                </div>
                <p className="text-xs text-slate-300">
                  Le domaine tente d'imiter l'enseigne officielle. Ne vous fiez pas au visuel du site.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">Site officiel authentique :</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  https://{result.domainAnalysis.matchedBrand.officialDomain}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Deep Analysis insight if present */}
      {result.aiAnalysis?.enhanced && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-800/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">
              Analyse Contextuelle Cyberdéfense (Gemini CTI)
            </h3>
          </div>
          {result.aiAnalysis.expertVerdict && (
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {result.aiAnalysis.expertVerdict}
            </p>
          )}
          {result.aiAnalysis.threatActorTechniques && result.aiAnalysis.threatActorTechniques.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.aiAnalysis.threatActorTechniques.map((tech, idx) => (
                <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Red Flags / Signals List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Signaux d'Alerte Détectés ({result.signals.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explications pédagogiques et décryptage des pièges de l'attaquant
            </p>
          </div>

          <button
            onClick={() => setShowAllSignals(!showAllSignals)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <span>{showAllSignals ? 'Réduire' : 'Afficher tout'}</span>
            {showAllSignals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {result.signals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-semibold text-slate-200 text-sm">
              Aucun signal malveillant détecté
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Les motifs classiques de phishing (typosquatting, faux sentiment d'urgence, extensions malveillantes) n'ont pas été identifiés.
            </p>
          </div>
        ) : (
          <div className={`space-y-3 ${!showAllSignals ? 'max-h-96 overflow-y-auto pr-1' : ''}`}>
            {result.signals.map((signal) => (
              <div
                key={signal.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(signal.severity)}
                    <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-900/60">
                      {getCategoryLabel(signal.category)}
                    </span>
                  </div>
                  {signal.matchedText && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Mot-clé déclencheur : <strong className="text-rose-400">"{signal.matchedText}"</strong>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {signal.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {signal.description}
                  </p>
                </div>

                {signal.technicalDetail && (
                  <div className="text-[11px] font-mono bg-slate-900 p-2 rounded-lg text-slate-400 border border-slate-800">
                    Détail technique : <span className="text-slate-200">{signal.technicalDetail}</span>
                  </div>
                )}

                <div className="flex items-start gap-1.5 text-xs text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Recommandation :</strong> {signal.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Action Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Conduite à Tenir Immédiate
        </h3>

        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
