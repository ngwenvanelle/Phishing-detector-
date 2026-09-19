import { GoogleGenAI } from '@google/genai';
import { analyzeInput } from '../src/lib/detector';

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { input, useAi = false } = req.body || {};

    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'Le champ d\'analyse est vide.' });
    }

    // Step 1: Deterministic heuristic rules
    const result = analyzeInput(input);

    // Step 2: Optional Gemini AI contextual augmentation
    const ai = getGemini();
    if (useAi && ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `En tant qu'analyste senior en cyberdéfense (SOC / CTI), analyse cette entrée pour détecter le phishing ou l'usurpation d'identité:
"""
${input.slice(0, 3000)}
"""

Heuristiques déjà détectées :
- Score heuristique : ${result.overallScore}/100 (${result.riskLevel})
- Signaux identifiés : ${result.signals.map(s => s.title).join(', ') || 'Aucun signal évident'}

Fournis une analyse experte concise au format JSON respectant strictement cette structure :
{
  "expertVerdict": "Court paragraphe explicatif en français clair et professionnel",
  "threatActorTechniques": ["technique 1 (ex: Typo-squatting)", "technique 2 (ex: Faux sentiment d'urgence)"]
}`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const jsonText = aiResponse.text?.trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          result.aiAnalysis = {
            enhanced: true,
            expertVerdict: parsed.expertVerdict,
            threatActorTechniques: parsed.threatActorTechniques || []
          };
        }
      } catch (aiErr) {
        console.warn('Gemini enhancement skipped due to error:', aiErr);
        result.aiAnalysis = {
          enhanced: false
        };
      }
    }

    return res.status(200).json({ result });
  } catch (err: any) {
    console.error('Analysis error:', err);
    return res.status(500).json({
      error: 'Erreur lors de l\'analyse.',
      details: err?.message || String(err)
    });
  }
}
