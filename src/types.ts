export type RiskLevel = 'low' | 'medium' | 'high';

export type SignalCategory =
  | 'urgency'
  | 'typosquatting'
  | 'technical'
  | 'credentials'
  | 'sender'
  | 'structure';

export interface RiskSignal {
  id: string;
  category: SignalCategory;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  technicalDetail?: string;
  matchedText?: string;
  recommendation: string;
}

export interface DomainAnalysis {
  rawInput: string;
  detectedType: 'url' | 'email' | 'text';
  extractedDomain?: string;
  protocol?: string;
  isHttps?: boolean;
  isIpAddress?: boolean;
  tld?: string;
  isSuspiciousTld?: boolean;
  subdomainCount?: number;
  hasSuspiciousChars?: boolean;
  matchedBrand?: {
    brandName: string;
    officialDomain: string;
    similarity: number;
    impersonationType: 'typosquatting' | 'subdomain_deception' | 'keyword_stuffing' | 'exact_match';
  };
  hasHomoglyphs?: boolean;
  homoglyphDetails?: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  input: string;
  inputType: 'url' | 'email' | 'text';
  overallScore: number; // 0 to 100
  riskLevel: RiskLevel;
  verdict: string;
  summary: string;
  signals: RiskSignal[];
  domainAnalysis: DomainAnalysis;
  recommendations: string[];
  metrics: {
    urgencyScore: number; // 0-100
    domainThreatScore: number; // 0-100
    technicalRiskScore: number; // 0-100
    credentialRiskScore: number; // 0-100
  };
  aiAnalysis?: {
    enhanced: boolean;
    expertVerdict?: string;
    threatActorTechniques?: string[];
  };
}

export interface ScanSample {
  id: string;
  label: string;
  category: 'phishing' | 'legitimate' | 'suspicious';
  type: 'url' | 'email' | 'text';
  input: string;
  description: string;
}
