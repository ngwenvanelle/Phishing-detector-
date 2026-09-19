import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  verdict: string;
  metrics: {
    urgencyScore: number;
    domainThreatScore: number;
    technicalRiskScore: number;
    credentialRiskScore: number;
  };
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  riskLevel,
  verdict,
  metrics
}) => {
  // Color setup
  const config = {
    low: {
      color: '#10b981', // emerald-500
      glow: 'rgba(16, 185, 129, 0.35)',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      label: 'Risque Faible',
      icon: ShieldCheck
    },
    medium: {
      color: '#f59e0b', // amber-500
      glow: 'rgba(245, 158, 11, 0.35)',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      label: 'Risque Modéré',
      icon: AlertTriangle
    },
    high: {
      color: '#f43f5e', // rose-500
      glow: 'rgba(244, 63, 94, 0.35)',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      label: 'Risque Élevé / Phishing',
      icon: ShieldAlert
    }
  }[riskLevel];

  const Icon = config.icon;

  // SVG Gauge calculations
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc display: use 270 degrees
  const angle = 270;
  const arcLength = (circumference * angle) / 360;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-6 relative overflow-hidden backdrop-blur-md shadow-lg transition-all`}>
      {/* Background cyber grid & glow */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: config.color }}
      />

      <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
        {/* Left: Gauge Circle */}
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg 
              className="w-full h-full transform -rotate-[135deg]"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Background Arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Value Arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={config.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
                  filter: `drop-shadow(0 0 8px ${config.glow})`
                }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                {score}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                / 100 Risque
              </span>
            </div>
          </div>

          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${config.badgeBg}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </div>
        </div>

        {/* Right: Detailed Vector Indicators */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Diagnostic Global de Sécurité
              </h3>
              <span className={`text-xs font-mono font-semibold ${config.textColor}`}>
                Indice de Menace : {score}%
              </span>
            </div>
            <p className="text-base font-bold text-white leading-snug">
              {verdict}
            </p>
          </div>

          {/* Sub-metrics progress bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Metric 1 */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Domaine & Typosquatting</span>
                <span className="font-mono font-bold text-slate-200">{metrics.domainThreatScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${metrics.domainThreatScore}%` }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Urgence & Pression</span>
                <span className="font-mono font-bold text-slate-200">{metrics.urgencyScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${metrics.urgencyScore}%` }}
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Technique (IP / TLD / HTTP)</span>
                <span className="font-mono font-bold text-slate-200">{metrics.technicalRiskScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-700"
                  style={{ width: `${metrics.technicalRiskScore}%` }}
                />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Collecte d'Identifiants</span>
                <span className="font-mono font-bold text-slate-200">{metrics.credentialRiskScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${metrics.credentialRiskScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
