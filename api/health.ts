export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'PhishGuard Detection API',
    timestamp: new Date().toISOString(),
    aiAvailable: Boolean(process.env.GEMINI_API_KEY)
  });
}
