import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { analyzeInput, SCAN_SAMPLES } from './src/lib/detector';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Helper for lazy Gemini AI instance
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

  // API 1: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PhishGuard Detection API',
      timestamp: new Date().toISOString(),
      aiAvailable: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // API 2: Ready test samples
  app.get('/api/samples', (req, res) => {
    res.json({ samples: SCAN_SAMPLES });
  });

  // API 3: Comprehensive Phishing Analysis Endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { input, useAi = false } = req.body;

      if (!input || typeof input !== 'string' || !input.trim()) {
        return res.status(400).json({ error: 'Le champ d\'analyse est vide.' });
      }

      // Step 1: Execute high-speed deterministic heuristic rules
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

      return res.json({ result });
    } catch (err: any) {
      console.error('Analysis error:', err);
      return res.status(500).json({
        error: 'Erreur lors de l\'analyse.',
        details: err?.message || String(err)
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PhishGuard] Cyber Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start PhishGuard server:', err);
  process.exit(1);
});
