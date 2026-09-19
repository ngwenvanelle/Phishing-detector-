export const STANDALONE_HTML = `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhishGuard | Détecteur de Phishing Autonome</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col">
  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
    <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
          PG
        </div>
        <div>
          <span class="font-extrabold text-lg text-white">PhishGuard</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 ml-1.5">Standalone HTML</span>
        </div>
      </div>
      <div class="text-xs text-slate-400">
        Moteur Heuristique Intégré v2.4
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
    <!-- Hero Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Détecteur de Phishing & Analyseur d'URLs
      </h1>
      <p class="text-sm text-slate-400 max-w-xl mx-auto">
        Collez une adresse email, une URL suspecte ou le contenu d'un message pour détecter immédiatement les signaux d'usurpation et d'ingénierie sociale.
      </p>
    </div>

    <!-- Scanner Box -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Cible d'analyse :</span>
        <button id="btn-paste" class="text-cyan-400 hover:text-cyan-300">Coller</button>
      </div>

      <textarea
        id="scan-input"
        rows="3"
        placeholder="Ex: https://paypa1-verification.xyz/login ou URGENT: Votre compte est bloqué sous 24h..."
        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
      ></textarea>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div class="flex flex-wrap gap-1.5">
          <button class="sample-btn text-xs px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-900/60 font-mono" data-val="https://paypa1-account-verification.xyz/login.php">Faux PayPal</button>
          <button class="sample-btn text-xs px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-900/60 font-mono" data-val="URGENT AMELI : Votre carte vitale est bloquée sous 24h. Cliquez ici : http://ameli-dossier-securise.top/vitale">Faux Ameli</button>
          <button class="sample-btn text-xs px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 font-mono" data-val="https://accounts.google.com/signin">Site Google</button>
        </div>

        <button
          id="btn-analyze"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all cursor-pointer"
        >
          Analyser la menace
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div id="results-area" class="hidden space-y-6">
      <!-- Risk Score Card -->
      <div id="risk-card" class="rounded-2xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-mono" id="score-circle">
            <span class="text-3xl font-extrabold" id="score-value">0</span>
            <span class="text-[9px] uppercase tracking-wider text-slate-400">/ 100</span>
          </div>
          <div>
            <div id="risk-badge" class="inline-block px-3 py-1 rounded-full text-xs font-bold mb-1">FAIBLE</div>
            <h2 id="risk-verdict" class="text-lg font-bold text-white">Légitime</h2>
            <p id="risk-summary" class="text-xs text-slate-400 mt-1 max-w-md"></p>
          </div>
        </div>

        <div class="w-full sm:w-56 space-y-2 text-xs font-mono">
          <div class="flex justify-between text-slate-400"><span>Domaine:</span><span id="m-domain" class="font-bold text-slate-200">0%</span></div>
          <div class="flex justify-between text-slate-400"><span>Urgence:</span><span id="m-urgency" class="font-bold text-slate-200">0%</span></div>
          <div class="flex justify-between text-slate-400"><span>Technique:</span><span id="m-tech" class="font-bold text-slate-200">0%</span></div>
          <div class="flex justify-between text-slate-400"><span>Identifiants:</span><span id="m-cred" class="font-bold text-slate-200">0%</span></div>
        </div>
      </div>

      <!-- Signals List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200">Signaux d'Alerte Détectés</h3>
        <div id="signals-container" class="space-y-2.5"></div>
      </div>

      <!-- Recommendations -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200">Conseils & Conduite à Tenir</h3>
        <ul id="recommendations-container" class="space-y-2 text-xs text-slate-300"></ul>
      </div>
    </div>
  </main>

  <footer class="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono">
    PhishGuard - Outil de Cybersécurité & Détection Phishing | Code 100% Autonome
  </footer>

  <script>
    // Detection logic embedded
    const KNOWN_BRANDS = [
      { name: 'PayPal', domain: 'paypal.com', aliases: ['paypal', 'paypa1'] },
      { name: 'Amazon', domain: 'amazon.com', aliases: ['amazon', 'amaz0n'] },
      { name: 'Apple', domain: 'apple.com', aliases: ['apple', 'app1e'] },
      { name: 'Netflix', domain: 'netflix.com', aliases: ['netflix', 'netf1ix'] },
      { name: 'Ameli', domain: 'ameli.fr', aliases: ['ameli', 'amelie'] },
      { name: 'Impots.gouv.fr', domain: 'impots.gouv.fr', aliases: ['impots', 'impot-gouv'] },
      { name: 'Banque Postale', domain: 'labanquepostale.fr', aliases: ['labanquepostale', 'banquepostale'] },
      { name: 'Crédit Agricole', domain: 'credit-agricole.fr', aliases: ['credit-agricole'] }
    ];

    const SUSPICIOUS_TLDS = new Set(['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'loan', 'click']);

    const URGENCY = [
      { term: 'urgent', desc: "Urgence artificielle" },
      { term: 'compte bloqué', desc: "Menace de suspension" },
      { term: '24h', desc: "Délai arbitraire très court" },
      { term: 'action requise', desc: "Formule impérative forçant une réaction immédiate" },
      { term: 'carte vitale', desc: "Usurpation de l'Assurance Maladie" }
    ];

    const CREDENTIALS = [
      { term: 'mot de passe', desc: "Demande directe de mot de passe" },
      { term: 'carte bancaire', desc: "Demande de données de paiement" },
      { term: 'cliquez ici', desc: "Lien d'action typique des faux courriers" },
      { term: 'code reçu par sms', desc: "Interception de code 2FA" }
    ];

    function analyze(input) {
      const text = input.trim().toLowerCase();
      let signals = [];
      let urgencyScore = 0;
      let domainScore = 0;
      let techScore = 0;
      let credScore = 0;

      // Extract domain if present
      let domain = '';
      if (text.includes('://')) {
        domain = text.split('://')[1].split('/')[0];
      } else if (text.includes('/') && !text.includes(' ')) {
        domain = text.split('/')[0];
      } else if (text.includes('@')) {
        domain = text.split('@')[1] || '';
      }

      // 1. IP check
      if (/^(\\d{1,3}\\.){3}\\d{1,3}$/.test(domain)) {
        techScore += 50;
        signals.push({
          title: "Adresse IP brute au lieu d'un nom de domaine",
          desc: "L'URL pointe directement sur une adresse IP. Les sites légitimes n'utilisent jamais cette méthode.",
          sev: 'high'
        });
      }

      // 2. TLD check
      const parts = domain.split('.');
      const tld = parts[parts.length - 1];
      if (SUSPICIOUS_TLDS.has(tld)) {
        domainScore += 40;
        signals.push({
          title: "Extension à haut risque (." + tld + ")",
          desc: "Cette extension est massivement surreprésentée dans les kits de phishing.",
          sev: 'high'
        });
      }

      // 3. Typosquatting
      for (const brand of KNOWN_BRANDS) {
        if (domain && !domain.endsWith(brand.domain) && (domain.includes(brand.aliases[0]) || (brand.aliases[1] && domain.includes(brand.aliases[1])))) {
          domainScore += 55;
          signals.push({
            title: "Typosquatting / Usurpation : " + brand.name,
            desc: "Le domaine imite l'enseigne officielle. Le vrai site est : https://" + brand.domain,
            sev: 'high'
          });
          break;
        }
      }

      // 4. Urgency
      for (const u of URGENCY) {
        if (text.includes(u.term)) {
          urgencyScore += 25;
          signals.push({
            title: u.desc + " ('" + u.term + "')",
            desc: "Les cybercriminels créent une fausse urgence pour vous forcer à agir sans réfléchir.",
            sev: 'medium'
          });
        }
      }

      // 5. Credential harvesting
      for (const c of CREDENTIALS) {
        if (text.includes(c.term)) {
          credScore += 30;
          signals.push({
            title: c.desc + " ('" + c.term + "')",
            desc: "Tentative d'interception d'informations confidentielles ou bancaires.",
            sev: 'high'
          });
        }
      }

      urgencyScore = Math.min(100, urgencyScore);
      domainScore = Math.min(100, domainScore);
      techScore = Math.min(100, techScore);
      credScore = Math.min(100, credScore);

      let overall = Math.round(domainScore * 0.45 + techScore * 0.2 + urgencyScore * 0.2 + credScore * 0.15);
      if (signals.some(s => s.sev === 'high') && overall < 70) overall = 75;
      overall = Math.min(100, overall);

      let level = overall >= 70 ? 'high' : overall >= 30 ? 'medium' : 'low';
      let verdict = level === 'high' ? 'DANGER : Phishing Très Probable' : level === 'medium' ? 'VIGILANCE : Risque Modéré' : 'Légitime / Risque Faible';
      let summary = level === 'high' ? 'Signaux d\\'usurpation et d\\'urgence critique détectés. Ne cliquez pas et ne saisissez aucune donnée.' : level === 'medium' ? 'Certains éléments suspects méritent une attention particulière.' : 'Aucun indicateur classique de fraude détecté.';

      return { overall, level, verdict, summary, signals, metrics: { domainScore, urgencyScore, techScore, credScore } };
    }

    // UI Wire-up
    const inputEl = document.getElementById('scan-input');
    const analyzeBtn = document.getElementById('btn-analyze');
    const pasteBtn = document.getElementById('btn-paste');
    const resultsArea = document.getElementById('results-area');

    pasteBtn.addEventListener('click', async () => {
      try {
        const txt = await navigator.clipboard.readText();
        if (txt) inputEl.value = txt;
      } catch (e) {}
    });

    document.querySelectorAll('.sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        inputEl.value = btn.getAttribute('data-val');
        runScan();
      });
    });

    analyzeBtn.addEventListener('click', runScan);

    function runScan() {
      const val = inputEl.value.trim();
      if (!val) return;
      const res = analyze(val);

      resultsArea.classList.remove('hidden');
      document.getElementById('score-value').innerText = res.overall;
      document.getElementById('risk-verdict').innerText = res.verdict;
      document.getElementById('risk-summary').innerText = res.summary;

      document.getElementById('m-domain').innerText = res.metrics.domainScore + '%';
      document.getElementById('m-urgency').innerText = res.metrics.urgencyScore + '%';
      document.getElementById('m-tech').innerText = res.metrics.techScore + '%';
      document.getElementById('m-cred').innerText = res.metrics.credScore + '%';

      const card = document.getElementById('risk-card');
      const badge = document.getElementById('risk-badge');
      const circle = document.getElementById('score-circle');

      if (res.level === 'high') {
        card.className = "rounded-2xl border border-rose-500/40 bg-rose-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-6";
        badge.className = "inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 bg-rose-500/20 text-rose-300 border border-rose-800";
        badge.innerText = "DANGER ÉLEVÉ";
        circle.className = "w-24 h-24 rounded-full border-4 border-rose-500 flex flex-col items-center justify-center font-mono text-rose-400";
      } else if (res.level === 'medium') {
        card.className = "rounded-2xl border border-amber-500/40 bg-amber-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-6";
        badge.className = "inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 bg-amber-500/20 text-amber-300 border border-amber-800";
        badge.innerText = "RISQUE MODÉRÉ";
        circle.className = "w-24 h-24 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center font-mono text-amber-400";
      } else {
        card.className = "rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-6";
        badge.className = "inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 bg-emerald-500/20 text-emerald-300 border border-emerald-800";
        badge.innerText = "RISQUE FAIBLE";
        circle.className = "w-24 h-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center font-mono text-emerald-400";
      }

      // Signals
      const sigContainer = document.getElementById('signals-container');
      sigContainer.innerHTML = '';
      if (res.signals.length === 0) {
        sigContainer.innerHTML = '<div class="text-xs text-slate-400">Aucun signal d\\'alerte identifié.</div>';
      } else {
        res.signals.forEach(s => {
          const div = document.createElement('div');
          div.className = "bg-slate-950 p-3 rounded-xl border border-slate-800";
          div.innerHTML = '<div class="font-bold text-xs text-slate-100">' + s.title + '</div><div class="text-xs text-slate-400 mt-1">' + s.desc + '</div>';
          sigContainer.appendChild(div);
        });
      }

      // Recommendations
      const recContainer = document.getElementById('recommendations-container');
      recContainer.innerHTML = '';
      const recs = res.level === 'high' 
        ? ["Ne cliquez sur aucun lien et ne transmettez aucun identifiant.", "Changez immédiatement vos mots de passe si vous les avez saisis.", "Signalez l'URL sur PHAROS ou Signal-Spam."]
        : ["Vérifiez toujours le nom de domaine exact avant de saisir vos codes d'accès.", "Activez l'authentification à deux facteurs (2FA)."];
      
      recs.forEach(r => {
        const li = document.createElement('li');
        li.className = "bg-slate-950 p-2.5 rounded-lg border border-slate-800";
        li.innerText = "• " + r;
        recContainer.appendChild(li);
      });

      resultsArea.scrollIntoView({ behavior: 'smooth' });
    }
  </script>
</body>
</html>`;
