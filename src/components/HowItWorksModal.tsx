import React from 'react';
import { 
  BookOpen, 
  Clock, 
  ShieldAlert, 
  Network, 
  KeyRound, 
  Lock, 
  Layers, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export const HowItWorksModal: React.FC = () => {
  const steps = [
    {
      icon: Clock,
      title: "1. Analyse de l'Urgence Artificielle & Pression Psychologique",
      desc: "Les attaquants exploitent le biais cognitif de panique. PhishGuard analyse le texte à la recherche de délais courts (ex: '24h', 'immédiat'), de menaces de suspension ('compte bloqué', 'amende impayée') ou de fausses promesses de remboursement pour forcer une action impulsive sans vérification."
    },
    {
      icon: ShieldAlert,
      title: "2. Détection du Typosquatting & Attaques Homographes (IDN)",
      desc: "L'outil compare le nom de domaine à plus de 50 marques institutionnelles et bancaires en utilisant la distance de Levenshtein (ex: 'paypa1.com' vs 'paypal.com'). Il traque également les caractères homographes cyrilliques ou grecs visuellement indiscernables de l'alphabet latin."
    },
    {
      icon: Network,
      title: "3. Sous-domaines Trompeurs, Symboles '@' & Adresses IP",
      desc: "Une ruse fréquente consiste à insérer le nom d'une vraie marque comme sous-domaine (ex: 'paypal.com.mon-compte-auth.xyz') ou à utiliser une adresse IP brute (ex: 'http://185.220.101.5') pour esquiver les réputations DNS. PhishGuard dissèque l'arborescence complète de l'URL."
    },
    {
      icon: KeyRound,
      title: "4. Identification des Demandes de Données Sensibles",
      desc: "Le moteur détecte les tentatives de captation d'identifiants, numéros de cartes bancaires (PAN, CVV) et surtout l'interception de codes SMS d'authentification 2FA ('Code reçu par SMS', 'Valider la transaction')."
    },
    {
      icon: Lock,
      title: "5. Extensions à Risque (TLD) & Protocole HTTPS",
      desc: "Certaines extensions gratuites ou très bon marché (.tk, .xyz, .top, .work, .click) abritent statistiquement une proportion anormale de kits de phishing éphémères. Le protocole HTTPS est également vérifié pour s'assurer que les communications ne transitent pas en clair."
    },
    {
      icon: Layers,
      title: "6. Score de Menace Pondéré (0 à 100) & Explications Pédagogiques",
      desc: "Chaque anomalie est catégorisée avec une sévérité spécifique. L'algorithme calcule un indice global clair (Faible, Modéré, Critique) et fournit à l'utilisateur des conseils pratiques adaptés à la menace."
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">
            Méthodologie de Détection PhishGuard
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Comment notre moteur heuristique et nos règles de cyberdéfense identifient les menaces de phishing
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60">
                <step.icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">
                {step.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-10">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Official Reporting Platforms */}
      <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            Où signaler une tentative avérée d'escroquerie ?
          </div>
          <p className="text-xs text-slate-300">
            En France, vous pouvez signaler un contenu frauduleux sur <strong>PHAROS</strong> (Ministère de l'Intérieur) ou <strong>Signal-Spam</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.internet-signalement.gouv.fr"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/80 flex items-center gap-1 transition-colors"
          >
            <span>PHAROS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.cybermalveillance.gouv.fr"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/80 flex items-center gap-1 transition-colors"
          >
            <span>Cybermalveillance</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
