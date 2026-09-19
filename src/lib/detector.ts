import { AnalysisResult, DomainAnalysis, RiskLevel, RiskSignal, ScanSample } from '../types';

// Top recognized brands targeted by phishing campaigns
export const KNOWN_BRANDS: Array<{ name: string; domain: string; aliases: string[] }> = [
  { name: 'PayPal', domain: 'paypal.com', aliases: ['paypal', 'paypa1', 'paypa-l'] },
  { name: 'Amazon', domain: 'amazon.com', aliases: ['amazon', 'amaz0n', 'amz', 'amazon-prime'] },
  { name: 'Apple', domain: 'apple.com', aliases: ['apple', 'icloud', 'app1e', 'appleid'] },
  { name: 'Microsoft', domain: 'microsoft.com', aliases: ['microsoft', 'micros0ft', 'outlook', 'office365', 'onedrive', 'live'] },
  { name: 'Google', domain: 'google.com', aliases: ['google', 'g00gle', 'gmail', 'google-drive'] },
  { name: 'Netflix', domain: 'netflix.com', aliases: ['netflix', 'netf1ix', 'netflix-verify'] },
  { name: 'Meta / Facebook', domain: 'facebook.com', aliases: ['facebook', 'faceb00k', 'meta', 'instagram'] },
  { name: 'Ameli (Assurance Maladie)', domain: 'ameli.fr', aliases: ['ameli', 'amelie', 'assurance-maladie', 'carte-vitale'] },
  { name: 'Impots.gouv.fr', domain: 'impots.gouv.fr', aliases: ['impots', 'impot-gouv', 'dgfip', 'remboursement-impot'] },
  { name: 'CAF (Caisse Allocations)', domain: 'caf.fr', aliases: ['caf-allocations', 'caf-dossier', 'caf-moncompte'] },
  { name: 'La Banque Postale', domain: 'labanquepostale.fr', aliases: ['labanquepostale', 'banquepostale', 'certicode'] },
  { name: 'Crédit Agricole', domain: 'credit-agricole.fr', aliases: ['credit-agricole', 'creditagricole', 'ca-enligne'] },
  { name: 'BNP Paribas', domain: 'mabanque.bnpparibas', aliases: ['bnpparibas', 'bnp-paribas', 'mabanque-bnp'] },
  { name: 'Société Générale', domain: 'societegenerale.fr', aliases: ['societegenerale', 'societe-generale', 'pass-securite'] },
  { name: 'Chronopost', domain: 'chronopost.fr', aliases: ['chronopost', 'chronop0st', 'chrono-livraison'] },
  { name: 'DHL', domain: 'dhl.com', aliases: ['dhl-express', 'dhl-tracking', 'dhl-parcel'] },
  { name: 'Mondial Relay', domain: 'mondialrelay.fr', aliases: ['mondialrelay', 'mondial-relay', 'suivi-mondial'] },
  { name: 'Colissimo / La Poste', domain: 'laposte.fr', aliases: ['colissimo', 'laposte', 'affranchissement-colis'] },
  { name: 'Binance', domain: 'binance.com', aliases: ['binance', 'binance-auth', 'bina-nce'] },
  { name: 'WhatsApp', domain: 'whatsapp.com', aliases: ['whatsapp', 'what-sapp', 'whatsapp-web'] }
];

// High-risk TLDs often abused in automated phishing kits
export const SUSPICIOUS_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'loan', 'click',
  'fit', 'country', 'kim', 'racing', 'buzz', 'rest', 'vip', 'gdn',
  'monster', 'sbs', 'cfd', 'icu', 'cam', 'quest', 'surf', 'bar'
]);

// Free public webmail providers
export const PUBLIC_WEBMAIL = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'hotmail.fr',
  'outlook.com', 'outlook.fr', 'live.com', 'aol.com', 'proton.me', 'protonmail.com'
]);

// Levenshtein distance algorithm
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Homoglyph & character confusion map (lookalikes)
const HOMOGLYPH_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'l',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '8': 'b',
  'vv': 'w',
  'rn': 'm',
  'cl': 'd'
};

// Check for homoglyphs / non-standard unicode
export function checkHomoglyphs(text: string): { hasHomoglyphs: boolean; details: string[] } {
  const details: string[] = [];
  let hasHomoglyphs = false;

  // Check Cyrillic lookalikes commonly used in IDN homograph attacks
  const cyrillicRegex = /[\u0400-\u04FF]/g;
  const matches = text.match(cyrillicRegex);
  if (matches && matches.length > 0) {
    hasHomoglyphs = true;
    details.push(`Présence de ${matches.length} caractère(s) cyrilliques trompeurs imitant l'alphabet latin (Attaque IDN Homographe)`);
  }

  // Check Punycode prefix
  if (text.toLowerCase().includes('xn--')) {
    hasHomoglyphs = true;
    details.push("Nom de domaine encodé en Punycode (xn--), souvent exploité pour masquer des caractères visuellement frauduleux.");
  }

  return { hasHomoglyphs, details };
}

// Determine input type: URL, Email address, or free text/email body
export function detectInputType(raw: string): 'url' | 'email' | 'text' {
  const trimmed = raw.trim();

  // If contains newlines or > 200 chars or common email body phrases, treat as text
  if (trimmed.includes('\n') || trimmed.length > 250) {
    return 'text';
  }

  // Regex email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(trimmed)) {
    return 'email';
  }

  // Regex for standard URL or domain
  const urlPattern = /^(https?:\/\/|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/.*)?$/i;
  if (urlPattern.test(trimmed) && !trimmed.includes(' ')) {
    return 'url';
  }

  return 'text';
}

// Parse domain from URL or email or snippet
export function extractDomainFromInput(input: string): {
  domain: string;
  protocol?: string;
  isHttps: boolean;
  isIp: boolean;
  pathname?: string;
} {
  let clean = input.trim();

  // If email, extract after @
  if (clean.includes('@') && !clean.startsWith('http')) {
    const parts = clean.split('@');
    clean = parts[parts.length - 1];
    // if brackets like <user@domain.com>
    clean = clean.replace(/>/g, '').trim();
  }

  let protocol = 'none';
  let isHttps = false;

  if (clean.startsWith('https://')) {
    protocol = 'https';
    isHttps = true;
    clean = clean.substring(8);
  } else if (clean.startsWith('http://')) {
    protocol = 'http';
    isHttps = false;
    clean = clean.substring(7);
  }

  // Strip path & query
  const slashIdx = clean.indexOf('/');
  let pathname = '';
  if (slashIdx !== -1) {
    pathname = clean.substring(slashIdx);
    clean = clean.substring(0, slashIdx);
  }

  // Strip port
  const colonIdx = clean.indexOf(':');
  if (colonIdx !== -1) {
    clean = clean.substring(0, colonIdx);
  }

  // Check IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIp = ipv4Regex.test(clean);

  return {
    domain: clean.toLowerCase(),
    protocol,
    isHttps,
    isIp,
    pathname
  };
}

// Social engineering keywords dictionary (French and English)
const URGENCY_KEYWORDS = [
  { term: 'urgent', weight: 15, desc: "Incitation artificielle à l'urgence" },
  { term: 'compte bloqué', weight: 25, desc: "Menace de suspension ou blocage de compte" },
  { term: 'compte suspendu', weight: 25, desc: "Alerte de compte suspendu sans préavis" },
  { term: '24h', weight: 15, desc: "Délai arbitraire très court (24 heures)" },
  { term: '48h', weight: 12, desc: "Délai arbitraire court (48 heures)" },
  { term: 'action requise', weight: 15, desc: "Formule impérative forçant une réaction immédiate" },
  { term: 'action immédiate', weight: 20, desc: "Pression temporelle extrême" },
  { term: 'dernier rappel', weight: 18, desc: "Menace d'ultimatum" },
  { term: 'dernier avis', weight: 18, desc: "Formule anxiogène de sommation" },
  { term: 'sécurité compromise', weight: 20, desc: "Fausse alerte d'intrusion sécuritaire" },
  { term: 'activité suspecte', weight: 15, desc: "Prétexte classique d'activité frauduleuse" },
  { term: 'frais de douane', weight: 22, desc: "Arnaque récurrente aux frais de colis ou douane" },
  { term: 'colis en attente', weight: 18, desc: "Prétexte de livraison bloquée" },
  { term: 'remboursement', weight: 15, desc: "Appât au gain ou promesse de crédit indu" },
  { term: 'carte vitale', weight: 20, desc: "Usurpation de l'Assurance Maladie / Ameli" },
  { term: 'amende impayée', weight: 25, desc: "Fausses contraventions ANTAI" },
  { term: 'virement en attente', weight: 20, desc: "Faux virement ou blocage de paiement" }
];

const CREDENTIAL_KEYWORDS = [
  { term: 'mot de passe', weight: 25, desc: "Demande directe de mot de passe" },
  { term: 'password', weight: 25, desc: "Demande de mot de passe en anglais" },
  { term: 'identifiant', weight: 20, desc: "Sollicitation d'identifiants de connexion" },
  { term: 'carte bancaire', weight: 30, desc: "Demande de coordonnées de carte bancaire (PAN, CVV)" },
  { term: 'numéro de carte', weight: 30, desc: "Collecte de données de paiement" },
  { term: 'cryptogramme', weight: 30, desc: "Demande du code CVV/CVC secret" },
  { term: 'code reçu par sms', weight: 35, desc: "Tentative d'interception d'authentification 2FA / OTP" },
  { term: 'code de sécurité', weight: 25, desc: "Demande de code de sécurité ou token" },
  { term: 'cliquez ici', weight: 12, desc: "Bouton d'action évasif typique des liens masqués" },
  { term: 'valider vos coordonnées', weight: 20, desc: "Mécanique d'ingénierie sociale de 'mise à jour'" },
  { term: 'mettre à jour vos informations', weight: 20, desc: "Prétexte classique d'actualisation de profil" },
  { term: 'confirmer votre identité', weight: 22, desc: "Faux contrôle KYC / conformité bancaire" }
];

// Main Cybersecurity Analysis Engine
export function analyzeInput(rawInput: string): AnalysisResult {
  const input = rawInput.trim();
  const inputType = detectInputType(input);
  const signals: RiskSignal[] = [];

  let urgencyScore = 0;
  let domainThreatScore = 0;
  let technicalRiskScore = 0;
  let credentialRiskScore = 0;

  const { domain, protocol, isHttps, isIp, pathname } = extractDomainFromInput(input);

  const domainAnalysis: DomainAnalysis = {
    rawInput: input,
    detectedType: inputType,
    extractedDomain: domain || undefined,
    protocol: protocol !== 'none' ? protocol : undefined,
    isHttps,
    isIpAddress: isIp
  };

  // 1. Analyze domain structure & technical characteristics
  if (domain && (inputType === 'url' || inputType === 'email')) {
    // Check IP address instead of domain
    if (isIp) {
      technicalRiskScore += 45;
      signals.push({
        id: 'ip-hostname',
        category: 'technical',
        severity: 'high',
        title: "Adresse IP brute au lieu d'un nom de domaine",
        description: "L'adresse utilise une adresse IP directe (ex: 192.168.x.x) plutôt qu'un domaine légitime enregistré. C'est une technique majeure utilisée pour contourner les filtres de réputation DNS.",
        technicalDetail: `Hôte IP détecté : ${domain}`,
        recommendation: "Ne visitez jamais un service institutionnel ou bancaire utilisant une adresse IP brute."
      });
    }

    // Check TLD
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
    domainAnalysis.tld = tld;

    if (SUSPICIOUS_TLDS.has(tld)) {
      domainAnalysis.isSuspiciousTld = true;
      domainThreatScore += 35;
      signals.push({
        id: 'suspicious-tld',
        category: 'technical',
        severity: 'high',
        title: `Extension de domaine à haut risque (.${tld})`,
        description: `L'extension .${tld} est statistiquement surreprésentée dans les campagnes de cybercriminalité en raison de son faible coût ou de l'absence de vérification d'identité des acheteurs.`,
        technicalDetail: `TLD identifié : .${tld}`,
        recommendation: "Méfiez-vous particulièrement des sites prétendant être une institution avec ce type d'extension."
      });
    }

    // Check Subdomain deception & excessive subdomains
    domainAnalysis.subdomainCount = domainParts.length - 2;
    if (domainParts.length > 3) {
      domainThreatScore += 20;
      signals.push({
        id: 'excessive-subdomains',
        category: 'structure',
        severity: 'medium',
        title: "Structure de sous-domaines complexe ou trompeuse",
        description: "Le domaine contient une accumulation anormale de sous-domaines. Les cybercriminels insèrent souvent le nom d'une vraie marque comme sous-domaine pour tromper l'utilisateur (ex: paypal.com.securite-login.xyz).",
        technicalDetail: `${domainParts.length} niveaux de sous-domaines détectés dans '${domain}'`,
        recommendation: "Regardez toujours les deux derniers mots du domaine (juste avant le .com/.fr) pour identifier le vrai propriétaire."
      });
    }

    // Check suspicious characters inside URL
    if (input.includes('@') && (inputType === 'url' || input.startsWith('http'))) {
      domainAnalysis.hasSuspiciousChars = true;
      technicalRiskScore += 40;
      signals.push({
        id: 'at-symbol-trick',
        category: 'technical',
        severity: 'high',
        title: "Présence d'un caractère '@' trompeur dans l'URL",
        description: "Le caractère '@' dans une URL indique au navigateur d'ignorer tout ce qui précède et de ne se connecter qu'à l'hôte situé APRÈS le '@'. C'est une technique d'obfuscation très sournoise.",
        recommendation: "Ne cliquez pas sur ce lien : la destination réelle n'est pas le domaine affiché au début."
      });
    }

    // Hyphens count in domain
    const hyphenCount = (domain.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
      domainThreatScore += 18;
      signals.push({
        id: 'multiple-hyphens',
        category: 'structure',
        severity: 'medium',
        title: "Multiples tirets dans le nom de domaine",
        description: `Le domaine contient ${hyphenCount} tirets (ex: 'banque-securite-connexion'). C'est un indicateur classique de nom de domaine jetable créé pour tromper l'internaute.`,
        technicalDetail: `Tirets détectés : ${hyphenCount}`,
        recommendation: "Les marques officielles utilisent généralement un nom de domaine court et sans tirets multiples."
      });
    }

    // Protocol check
    if (protocol === 'http') {
      technicalRiskScore += 25;
      signals.push({
        id: 'unencrypted-http',
        category: 'technical',
        severity: 'medium',
        title: "Connexion non sécurisée (HTTP au lieu de HTTPS)",
        description: "Le site n'utilise pas le protocole de chiffrement TLS/SSL (HTTPS). Les données transmises (identifiants, mots de passe) peuvent être interceptées en clair.",
        recommendation: "N'entrez jamais aucune information confidentielle sur un site en simple HTTP."
      });
    }

    // Homoglyphs check
    const { hasHomoglyphs, details } = checkHomoglyphs(domain);
    domainAnalysis.hasHomoglyphs = hasHomoglyphs;
    domainAnalysis.homoglyphDetails = details;
    if (hasHomoglyphs) {
      domainThreatScore += 40;
      signals.push({
        id: 'homoglyph-attack',
        category: 'typosquatting',
        severity: 'high',
        title: "Attaque IDN / Caractères Homographes Détectés",
        description: "Des caractères d'un autre alphabet (cyrillique, grec ou punycode) sont dissimulés pour imiter visuellement un domaine légitime tout en pointant vers un serveur pirate.",
        technicalDetail: details.join(' | '),
        recommendation: "Alerte rouge : il s'agit d'une tentative sophistiquée d'usurpation d'identité visuelle."
      });
    }

    // 2. Typosquatting and Brand Impersonation Detection
    for (const brand of KNOWN_BRANDS) {
      const cleanBrand = brand.name.toLowerCase();
      const officialHost = brand.domain.toLowerCase();

      // Check if exact official domain
      if (domain === officialHost || domain.endsWith('.' + officialHost)) {
        domainAnalysis.matchedBrand = {
          brandName: brand.name,
          officialDomain: brand.domain,
          similarity: 1,
          impersonationType: 'exact_match'
        };
        // Legitimate domain of a known brand!
        continue;
      }

      // Check Subdomain deception: e.g. domain starts with official domain but ends with something else
      // e.g. 'paypal.com.account-update.info'
      if (domain.includes(officialHost) && !domain.endsWith('.' + officialHost) && domain !== officialHost) {
        domainThreatScore += 50;
        domainAnalysis.matchedBrand = {
          brandName: brand.name,
          officialDomain: brand.domain,
          similarity: 0.95,
          impersonationType: 'subdomain_deception'
        };
        signals.push({
          id: `subdomain-spoof-${brand.name.toLowerCase()}`,
          category: 'typosquatting',
          severity: 'high',
          title: `Imitation de marque par sous-domaine trompeur (${brand.name})`,
          description: `Le domaine intègre le nom officiel '${officialHost}', mais le vrai domaine racine est '${domainParts.slice(-2).join('.')}'. L'attaquant cherche à vous faire croire que vous êtes sur le site de ${brand.name}.`,
          technicalDetail: `Vrai domaine racine : ${domainParts.slice(-2).join('.')}`,
          recommendation: `Le site officiel de ${brand.name} est strictement : https://${brand.domain}`
        });
        break;
      }

      // Check typosquatting via Levenshtein or aliases
      const domainWithoutTld = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domain;
      const brandMain = brand.domain.split('.')[0];

      // Direct alias match or keyword stuffing (e.g. "paypal-secure", "apple-login", "ameli-espace")
      const matchesAlias = brand.aliases.some(alias => domain.includes(alias));
      const distance = levenshteinDistance(domainWithoutTld, brandMain);

      // Typosquatting: distance 1 or 2 with close length
      const isTyposquat = distance > 0 && distance <= 2 && Math.abs(domainWithoutTld.length - brandMain.length) <= 2;

      if (isTyposquat) {
        domainThreatScore += 45;
        domainAnalysis.matchedBrand = {
          brandName: brand.name,
          officialDomain: brand.domain,
          similarity: 0.85,
          impersonationType: 'typosquatting'
        };
        signals.push({
          id: `typosquat-${brand.name.toLowerCase()}`,
          category: 'typosquatting',
          severity: 'high',
          title: `Typosquatting détecté : Imitation de ${brand.name}`,
          description: `Le domaine '${domainWithoutTld}' diffère de '${brandMain}' par seulement ${distance} caractère(s). Cette technique exploite les fautes de frappe ou des substitutions de lettres (ex: '1' pour 'l', '0' pour 'o').`,
          technicalDetail: `Distance de Levenshtein : ${distance} par rapport à ${brandMain}`,
          recommendation: `N'accédez pas à cette adresse. Le domaine officiel vérifié est https://${brand.domain}`
        });
        break;
      } else if (matchesAlias && !domain.endsWith('.' + officialHost)) {
        domainThreatScore += 35;
        domainAnalysis.matchedBrand = {
          brandName: brand.name,
          officialDomain: brand.domain,
          similarity: 0.75,
          impersonationType: 'keyword_stuffing'
        };
        signals.push({
          id: `keyword-stuffing-${brand.name.toLowerCase()}`,
          category: 'typosquatting',
          severity: 'high',
          title: `Usurpation de nom de marque : ${brand.name}`,
          description: `Le terme '${brand.name}' apparaît dans un domaine non officiel (${domain}). Les escrocs associent des termes comme 'secure', 'verify', 'moncompte' pour tromper la confiance des victimes.`,
          recommendation: `Pour contacter ${brand.name}, passez uniquement par https://${brand.domain}`
        });
        break;
      }
    }
  }

  // 3. Email-specific checks
  if (inputType === 'email' && input.includes('@')) {
    const parts = input.split('@');
    const emailDomain = parts[1]?.toLowerCase().trim();

    // Check if free webmail is attempting to impersonate an official service in display text
    const localPart = parts[0]?.toLowerCase().trim();
    for (const brand of KNOWN_BRANDS) {
      if (localPart.includes(brand.name.toLowerCase()) || localPart.includes(brand.domain.split('.')[0])) {
        if (PUBLIC_WEBMAIL.has(emailDomain)) {
          domainThreatScore += 45;
          signals.push({
            id: 'free-mail-brand-spoof',
            category: 'sender',
            severity: 'high',
            title: `Expéditeur suspect : Faux compte officiel sur messagerie grand public`,
            description: `L'adresse utilise un fournisseur grand public gratuit (${emailDomain}) tout en prétendant représenter '${brand.name}'. Aucune entreprise légitime n'utilise de compte Gmail ou Yahoo pour contacter ses clients.`,
            technicalDetail: `Expéditeur : ${input}`,
            recommendation: "Ignorez et signalez immédiatement ce message comme tentative d'usurpation."
          });
          break;
        }
      }
    }
  }

  // 4. Natural language & content analysis (Urgency & Credential harvesting)
  const lowerInput = input.toLowerCase();

  // Check urgency signals
  for (const item of URGENCY_KEYWORDS) {
    if (lowerInput.includes(item.term)) {
      urgencyScore += item.weight;
      signals.push({
        id: `urgency-${item.term.replace(/\s+/g, '-')}`,
        category: 'urgency',
        severity: item.weight >= 20 ? 'high' : 'medium',
        title: item.desc,
        description: `Présence du terme anxiogène '${item.term}'. Les cybercriminels créent un sentiment d'urgence artificielle pour court-circuiter l'esprit critique de la victime et la forcer à agir sans réfléchir.`,
        matchedText: item.term,
        recommendation: "Prenez du recul. Une institution légitime ne vous impose jamais de résoudre un litige critique en quelques heures sous peine de sanctions."
      });
    }
  }

  // Check credential harvesting signals
  for (const item of CREDENTIAL_KEYWORDS) {
    if (lowerInput.includes(item.term)) {
      credentialRiskScore += item.weight;
      signals.push({
        id: `credential-${item.term.replace(/\s+/g, '-')}`,
        category: 'credentials',
        severity: item.weight >= 25 ? 'high' : 'medium',
        title: item.desc,
        description: `Demande suspecte liée à : '${item.term}'. Les pirates utilisent des formulaires miroirs pour collecter vos secrets de connexion ou données de carte de paiement.`,
        matchedText: item.term,
        recommendation: "Ne communiquez JAMAIS vos mots de passe ou codes temporaires SMS reçus de votre banque."
      });
    }
  }

  // Normalize component scores (0 - 100)
  urgencyScore = Math.min(100, urgencyScore);
  domainThreatScore = Math.min(100, domainThreatScore);
  technicalRiskScore = Math.min(100, technicalRiskScore);
  credentialRiskScore = Math.min(100, credentialRiskScore);

  // Overall score formula:
  // If brand impersonation or high typosquatting is verified, score jumps to > 70
  // Otherwise weighted sum of components
  let overallScore = 0;

  if (inputType === 'text') {
    overallScore = Math.round(urgencyScore * 0.45 + credentialRiskScore * 0.45 + technicalRiskScore * 0.1);
  } else {
    // For URL / Email
    overallScore = Math.round(
      domainThreatScore * 0.45 +
      technicalRiskScore * 0.25 +
      urgencyScore * 0.15 +
      credentialRiskScore * 0.15
    );
  }

  // Enforce minimum floor if critical high severity signals are present
  const hasHighSeverity = signals.some(s => s.severity === 'high');
  if (hasHighSeverity && overallScore < 65) {
    overallScore = Math.max(overallScore, 70);
  }

  // Cap score between 0 and 100
  overallScore = Math.min(100, Math.max(0, overallScore));

  // Determine Risk Level & Verdict
  let riskLevel: RiskLevel = 'low';
  let verdict = "Légitime / Risque Faible";
  let summary = "Aucun indicateur critique de phishing ou d'usurpation d'identité n'a été repéré sur cette entrée.";

  if (overallScore >= 70) {
    riskLevel = 'high';
    verdict = "DANGER ÉLEVÉ : Tentative de Phishing Probable";
    summary = "Plusieurs signaux d'alerte critiques ont été identifiés (usurpation de marque, urgence artificielle ou domaine frauduleux). N'interagissez pas avec cet élément.";
  } else if (overallScore >= 30) {
    riskLevel = 'medium';
    verdict = "VIGILANCE : Risque Modéré / Suspect";
    summary = "Certains signaux inhabituels ou ambigus méritent votre attention. Vérifiez l'authenticité de la source avant toute action.";
  }

  // Tailored recommendations
  const recommendations: string[] = [];
  if (riskLevel === 'high') {
    recommendations.push("Ne cliquez sur aucun lien et n'ouvrez aucune pièce jointe associée.");
    recommendations.push("Ne saisissez aucun identifiant, mot de passe ni coordonnée bancaire.");
    recommendations.push("Si vous avez déjà renseigné des informations, changez immédiatement vos mots de passe et prévenez votre banque.");
    recommendations.push("Signalez cette adresse ou cet email sur les plateformes officielles (ex: Signal-Spam ou Pharos).");
  } else if (riskLevel === 'medium') {
    recommendations.push("Vérifiez l'adresse de l'expéditeur en affichant l'en-tête complet du message.");
    recommendations.push("Rendez-vous directement sur le site officiel via vos favoris ou un moteur de recherche, sans cliquer sur le lien fourni.");
    recommendations.push("En cas de doute sur votre compte, contactez l'organisme officiel par un canal habituel et indépendant.");
  } else {
    recommendations.push("Conservez de bons réflexes : activez l'authentification multifacteur (2FA) sur tous vos comptes sensibles.");
    recommendations.push("Même sur un site d'apparence légitime, vérifiez toujours la présence du cadenas HTTPS et l'exactitude de l'URL.");
  }

  return {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    input,
    inputType,
    overallScore,
    riskLevel,
    verdict,
    summary,
    signals,
    domainAnalysis,
    recommendations,
    metrics: {
      urgencyScore,
      domainThreatScore,
      technicalRiskScore,
      credentialRiskScore
    }
  };
}

// Realistic test samples for quick testing
export const SCAN_SAMPLES: ScanSample[] = [
  {
    id: 'sample-paypal-fake',
    label: 'Faux PayPal (Typosquatting & Urgence)',
    category: 'phishing',
    type: 'url',
    input: 'https://paypa1-account-verification.xyz/login.php',
    description: 'Typosquatting (chiffre 1 remplaçant l), TLD .xyz à haut risque et mots-clés d\'urgence.'
  },
  {
    id: 'sample-ameli-fake',
    label: 'Faux Ameli / Carte Vitale (Message)',
    category: 'phishing',
    type: 'text',
    input: 'URGENT AMELI : Votre nouvelle carte vitale V3 est prête. Votre dossier sera suspendu sous 24h sans mise à jour. Cliquez ici pour valider vos coordonnées et payer les frais d\'envoi de 1,99€ : http://ameli-dossier-securise.top/vitale',
    description: 'Arnaque SMS/Email Ameli très répandue : faux délai 24h, menace de suspension, TLD .top.'
  },
  {
    id: 'sample-bank-ip',
    label: 'Banque avec Hôte IP brut',
    category: 'phishing',
    type: 'url',
    input: 'http://185.220.101.5/credit-agricole/connexion.html',
    description: 'Adresse IP brute au lieu d\'un nom de domaine officiel, protocole non chiffré HTTP.'
  },
  {
    id: 'sample-spoofed-mail',
    label: 'Email d\'Alerte Fausse Banque',
    category: 'phishing',
    type: 'email',
    input: 'service.client.bnp-paribas@gmail.com',
    description: 'Prétend représenter BNP Paribas via un compte grand public gratuit @gmail.com.'
  },
  {
    id: 'sample-legit-google',
    label: 'Site Officiel Google (Légitime)',
    category: 'legitimate',
    type: 'url',
    input: 'https://accounts.google.com/signin',
    description: 'Sous-domaine officiel authentique de Google avec protocole HTTPS.'
  },
  {
    id: 'sample-legit-laposte',
    label: 'Site Officiel La Poste (Légitime)',
    category: 'legitimate',
    type: 'url',
    input: 'https://www.laposte.fr/outils/suivre-vos-envois',
    description: 'Portail officiel de La Poste française.'
  }
];
