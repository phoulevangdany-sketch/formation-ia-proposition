/* Page interactive « Formation IA » : vocaux, modules, réponses cochées, envoi. Aucune dépendance. */
(() => {
  'use strict';

  // ------------------------------------------------------------ réglages
  // Où arrivent les réponses. Laisser vide tant que l'adresse n'est pas choisie : les boutons e-mail / WhatsApp restent cachés.
  const CONFIG = {
    email: 'direction@otomeo.com',
    whatsapp: '',   // numéro international sans « + », ex. '33612345678'
    objet: 'Formation IA : mes réponses',
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NB = ' ';

  // ------------------------------------------------------------ contenu
  const MODS = [
    ['m1', 'M1', 'Fondamentaux et panorama des IA', 'Principes, limites et usages professionnels. ChatGPT, Claude, Perplexity : à quoi sert chacun ? Comment garder un esprit critique.', 'Comprendre ce que l’IA sait bien faire, ce qu’elle fait mal, et quand vérifier.'],
    ['m2', 'M2', 'Prompts et productivité documentaire', 'Structurer ses instructions, faire des recherches fiables, rédiger, synthétiser, analyser des fichiers.', 'Un « prompt » est simplement la consigne que l’on donne à l’IA. Bien la formuler change beaucoup le résultat.'],
    ['m3', 'M3', 'Claude Code sous Windows', 'Terminal, installation, permissions, dossiers, prompts, vérification des changements, erreurs simples.', 'Le « terminal » est une fenêtre où l’on écrit des instructions à l’ordinateur. Claude Code y travaille sur vos fichiers, et vous gardez la main sur chaque autorisation.'],
    ['m4', 'M4', 'No-Code et création d’un petit outil', 'Décomposer un besoin, réaliser ensemble un outil simple, découvrir GitHub en aperçu.', '« No-Code » : créer un outil sans écrire soi-même le code. GitHub est un espace où l’on conserve les versions d’un projet.'],
    ['m5', 'M5', 'Automatisations et intégrations', 'Déclencheurs, enchaînement d’étapes simple (workflow), supervision humaine ; introduction aux API, aux MCP et aux agents.', 'Une automatisation enchaîne des étapes quand un événement se produit. Une API ou un MCP sont des « prises » qui relient des outils entre eux. Un agent est une IA qui enchaîne des actions, sous votre supervision.'],
    ['m6', 'M6', 'Sécurité, tests et consolidation', 'Confidentialité, RGPD, sauvegardes, secrets, tests ; démonstration et restitution.', 'Un « secret » est un mot de passe ou une clé d’accès : on ne le colle jamais dans une conversation avec l’IA. Le RGPD est le cadre européen de protection des données personnelles.'],
  ];
  const EX = [
    ['e1', 'Module 2', 'Résumer un long document', 'Demander une synthèse et la liste des points à vérifier, puis relire avec un regard critique.'],
    ['e2', 'Module 2', 'Préparer un modèle de document', 'Obtenir une première trame (compte rendu, fiche, courrier) à compléter et corriger vous-même.'],
    ['e3', 'Module 3', 'Ranger un dossier d’exercice', 'Demander à Claude Code de classer des fichiers fictifs, puis contrôler chaque changement proposé.'],
    ['e4', 'Module 4', 'Construire un petit outil simple', 'Partir d’un besoin, le découper en étapes et réaliser ensemble un outil, choisi avec vous.'],
    ['e5', 'Module 5', 'Imaginer une automatisation prudente', 'Par exemple : un brouillon préparé automatiquement, que vous validez avant tout envoi.'],
    ['e6', 'Module 6', 'Repérer ce qu’on ne partage jamais', 'Identifier les informations sensibles ; sauvegardes et tests avant de modifier quoi que ce soit.'],
  ];
  const PEOPLE = [
    ['Sarah', 'var(--terra)', 'Documents professionnels et démarche qualité', 'Structurer un programme pédagogique, des modèles de documents, un classement et un contrôle des informations de référence.', 'Les enjeux Qualiopi demandent des documents exacts et des vérifications humaines. L’IA aide à rédiger et organiser ; elle ne remplace ni un audit ni une expertise juridique.'],
    ['Mélissa', 'var(--sage)', 'Application de commandes pour quatre restaurants', 'Examiner une fonction de l’application, formuler une amélioration, comprendre une connexion API, tester et préparer une correction sur une copie de travail (non en production).', 'Il ne s’agit ni d’un audit complet ni d’une refonte de l’application.'],
    ['Nobilie', 'var(--gold)', 'Gestion documentaire et automatisations', 'Organiser des fichiers entre plusieurs postes et réaliser une automatisation administrative simple, sur des fichiers autorisés, avec validation humaine.', 'Votre activité et votre besoin prioritaire restent à confirmer.'],
  ];
  const PROJ_OPT = ['Cela me correspond', 'À ajuster', 'J’ai un autre sujet'];

  // ------------------------------------------------------------ état (navigateur seulement)
  const KEY = 'formation-ia:v1';
  let S = {};
  try { S = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { S = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* indisponible */ } };
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), S);
  const set = (path, v) => {
    const ks = path.split('.'); let o = S;
    ks.slice(0, -1).forEach((k) => { o = o[k] = o[k] || {}; });
    o[ks[ks.length - 1]] = v;
  };

  // ------------------------------------------------------------ rendu des blocs dynamiques
  $('#mods').innerHTML = MODS.map(([id, n, t, c, cl]) => `
    <details class="mod" id="mod-${id}">
      <summary><span class="mod__n">${n}</span><span class="mod__t">${esc(t)}<small>3${NB}h · module ${n.slice(1)} sur 6</small></span><span class="mod__tick">coché</span></summary>
      <div class="mod__body">
        <div data-voice="${id}" data-label="Écouter ce module" data-compact></div>
        <p>${esc(c)}</p>
        <p class="clair"><b>En clair :</b> ${esc(cl)}</p>
        <div class="tick">
          <label><input type="checkbox" data-k="mods.${id}.int"><span>Ce module m’intéresse</span></label>
          <label><input type="checkbox" data-k="mods.${id}.deep"><span>J’aimerais l’approfondir</span></label>
          <label><input type="checkbox" data-k="mods.${id}.mod"><span>À modifier ou alléger</span></label>
        </div>
        <label class="field" style="margin:0"><span style="font-weight:600;font-size:15px">Un commentaire sur ce module&nbsp;? (facultatif)</span><textarea data-k="mods.${id}.cmt" rows="2"></textarea></label>
      </div>
    </details>`).join('');

  $('#ex').innerHTML = EX.map(([id, m, t, d]) => `
    <label class="pick"><input type="checkbox" data-k="ex.${id}"><span class="pick__box"></span>
      <span class="pick__body"><small style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--sage);font-size:12px">${m}</small><b>${esc(t)}</b><small>${esc(d)}</small></span></label>`).join('');

  $('#people').innerHTML = PEOPLE.map(([nom, col, role, proj, vig], i) => `
    <article class="person" style="--c:${col}" id="p-${nom}">
      <div class="person__av" aria-hidden="true">${nom[0]}</div>
      <h3>${nom}</h3><p class="role">${esc(role)}</p>
      <p class="lab">Projet envisagé</p><p>${esc(proj)}</p>
      <p class="lab">À savoir</p><p>${esc(vig)}</p>
      <span class="tag">Hypothèse à confirmer</span>
      <div role="radiogroup" aria-label="Votre réponse pour ${nom}">
        ${PROJ_OPT.map((o) => `<label class="opt"><input type="radio" name="proj-${nom}" value="${esc(o)}" data-k="proj.${nom}.r"><span>${esc(o)}</span></label>`).join('')}
      </div>
      <textarea data-k="proj.${nom}.t" rows="2" placeholder="Précisions, ou votre propre sujet…" aria-label="Précisions pour ${nom}"></textarea>
    </article>`).join('');

  // ------------------------------------------------------------ liaison champs ↔ état
  function bind() {
    $$('[data-k]').forEach((el) => {
      const k = el.dataset.k, type = el.type;
      const v = get(k);
      if (type === 'radio') el.checked = v === el.value;
      else if (type === 'checkbox') el.checked = el.hasAttribute('value') ? Array.isArray(v) && v.includes(el.value) : !!v;
      else el.value = v || '';
      el.addEventListener('input', () => {
        if (type === 'radio') { if (el.checked) set(k, el.value); }
        else if (type === 'checkbox') {
          if (el.hasAttribute('value')) { const a = new Set(get(k) || []); el.checked ? a.add(el.value) : a.delete(el.value); set(k, [...a]); }
          else set(k, el.checked);
        } else set(k, el.value);
        save(); refresh();
      });
    });
  }

  // ------------------------------------------------------------ synthèse et progression
  const names = { n1: 'Choisir le bon outil', n2: 'Gagner du temps', n3: 'Oser Claude Code', n4: 'Rester en sécurité' };
  function modsBy(flag) { return MODS.filter(([id]) => get(`mods.${id}.${flag}`)).map(([, n]) => n); }
  function summary() {
    const L = [];
    const who = S.prenom || '(non renseigné)';
    L.push('RÉPONSES : FORMATION IA (initiation à l’IA, au No-Code et à l’automatisation)', `De la part de : ${who}`, '');
    L.push('1. Proposition conforme à mes attentes : ' + (S.q1 || '(non renseigné)'));
    const needs = Object.keys(names).filter((k) => get('needs.' + k)).map((k) => names[k]);
    L.push('', 'Besoins qui comptent pour moi : ' + (needs.join(', ') || '(aucun coché)'));
    if (S.needsNote) L.push('Besoin manquant ou à corriger : ' + S.needsNote);
    L.push('', 'Modules qui m’intéressent : ' + (modsBy('int').join(', ') || '(aucun coché)'));
    L.push('Modules à approfondir : ' + (modsBy('deep').join(', ') || '(aucun)'));
    L.push('Modules à modifier ou alléger : ' + (modsBy('mod').join(', ') || '(aucun)'));
    MODS.forEach(([id, n]) => { const c = get(`mods.${id}.cmt`); if (c) L.push(`  Commentaire ${n} : ${c}`); });
    const ex = EX.filter(([id]) => get('ex.' + id)).map(([, , t]) => t);
    L.push('', 'Exemples que j’aimerais travailler : ' + (ex.length ? '' : '(aucun coché)'));
    ex.forEach((t) => L.push(' - ' + t));
    L.push('', 'Projets individuels (hypothèses) :');
    PEOPLE.forEach(([nom]) => { const p = (S.proj || {})[nom] || {}; if (p.r || p.t) L.push(` - ${nom} : ${p.r || '(sans choix)'}${p.t ? ' | ' + p.t : ''}`); });
    if (!PEOPLE.some(([nom]) => ((S.proj || {})[nom] || {}).r)) L.push(' (non renseigné)');
    L.push('', 'Organisation : format : ' + (S.fmt || '(non renseigné)'));
    L.push('Créneaux : ' + ((S.slots || []).join(', ') || '(non renseigné)'));
    L.push('Module de 3 h : ' + (S.rythme || '(non renseigné)'));
    L.push('Jours, horaires ou périodes à éviter : ' + (S.contraintes || '(non renseigné)'));
    L.push('', 'À approfondir ou modifier : ' + (S.q3 || '(non renseigné)'), 'Besoins particuliers : ' + (S.q5 || '(non renseigné)'));
    return L.join('\n');
  }
  function done() {
    const mine = S.prenom ? ((S.proj || {})[S.prenom] || {}).r : PEOPLE.some(([n]) => ((S.proj || {})[n] || {}).r);
    return [!!S.prenom, !!S.q1, MODS.some(([id]) => get(`mods.${id}.int`) || get(`mods.${id}.deep`) || get(`mods.${id}.mod`)), !!mine, !!S.fmt].filter(Boolean).length;
  }
  function refresh() {
    $('#tray-n').textContent = `${done()}${NB}/${NB}5`;
    $$('.mod').forEach((m, i) => m.classList.toggle('has-tick', !!(get(`mods.${MODS[i][0]}.int`) || get(`mods.${MODS[i][0]}.deep`) || get(`mods.${MODS[i][0]}.mod`))));
    const i = modsBy('int'), d = modsBy('deep'), m = modsBy('mod');
    $('#recap-mods').innerHTML = `<b>D’après vos cases cochées dans les modules :</b> intéressée par ${i.length ? i.join(', ') : 'aucun pour l’instant'}${d.length ? ` · à approfondir : ${d.join(', ')}` : ''}${m.length ? ` · à modifier : ${m.join(', ')}` : ''}.`;
    const t = summary();
    $('#preview').textContent = t;
    const body = encodeURIComponent(t);
    const mail = $('#btn-mail'), wa = $('#btn-wa');
    if (CONFIG.email) { mail.hidden = false; mail.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(CONFIG.objet)}&body=${body}`; }
    if (CONFIG.whatsapp) { wa.hidden = false; wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${body}`; }
    if (!CONFIG.email && !CONFIG.whatsapp) $('#send-lead').textContent = 'Vos réponses restent dans votre navigateur tant que vous ne les envoyez pas. Copiez-les, puis collez-les dans un message à Dany.';
  }
  const hint = (t) => { $('#send-hint').textContent = t; };
  $('#btn-copy').addEventListener('click', async () => {
    const t = summary();
    try { await navigator.clipboard.writeText(t); hint('Copié ✓ Collez maintenant le texte dans un message à Dany.'); }
    catch { const r = document.createRange(); r.selectNodeContents($('#preview')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); hint('Le texte est sélectionné : copiez-le (Ctrl+C ou ⌘+C).'); }
  });
  $('#btn-dl').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([summary()], { type: 'text/plain;charset=utf-8' }));
    a.download = `reponses_formation_IA${S.prenom ? '_' + S.prenom : ''}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); hint('Fichier téléchargé ✓ Joignez-le à votre message.');
  });

  // ------------------------------------------------------------ heures 30 / 22
  const HOURS = {
    30: ['30 h', 'd’intervention du formateur', 60, 40, '18 h collectives', '12 h individuelles (3 × 4 h)', 'Les 18 h collectives sont partagées : vous les suivez toutes les trois. Les 12 h individuelles sont réparties à parts égales, soit 4 h par personne.'],
    22: ['22 h', 'd’accompagnement direct, pour chacune de vous', 81.8, 18.2, '18 h collectives', '4 h', '18 h collectives + 4 h individuelles = 22 h pour chacune. Vos exercices entre les séances s’ajoutent à ces heures.'],
  };
  $$('.tab').forEach((b) => b.addEventListener('click', () => {
    const h = HOURS[b.dataset.bar];
    $$('.tab').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    $('#h-total').textContent = h[0]; $('#h-label').textContent = h[1];
    $('#seg-a').style.width = h[2] + '%'; $('#seg-b').style.width = h[3] + '%';
    $('#seg-a em').textContent = h[4]; $('#seg-b em').textContent = h[5]; $('#h-txt').textContent = h[6];
  }));

  // ------------------------------------------------------------ vocaux (un seul lecteur pour la page)
  const audio = new Audio(); audio.preload = 'none';
  let cur = null, MAN = {};
  const fmt = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const PLAY = '<svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg><svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>';
  function wave(id, n) {
    let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const env = 0.55 + 0.45 * Math.sin((i / (n - 1)) * Math.PI); const v = Math.max(0.2, Math.min(1, env * (0.45 + ((h >> 8) % 55) / 100))); return `<i style="height:${Math.round(v * 24)}px"></i>`; }).join('');
  }
  function mountVoices() {
    $$('[data-voice]').forEach((el) => {
      if (el.dataset.mounted) return; el.dataset.mounted = '1';
      const id = el.dataset.voice, compact = el.hasAttribute('data-compact'), label = el.dataset.label || 'Écouter';
      el.innerHTML = `<div class="vn${compact ? ' vn--compact' : ''}" data-vn="${id}"><button class="vn__btn" type="button" aria-label="${esc(label)}">${PLAY}</button><span class="vn__label">${esc(label)}</span><span class="vn__wave" aria-hidden="true">${wave(id, compact ? 16 : 26)}</span><span class="vn__time">${MAN[id] ? fmt(MAN[id].duree) : ''}</span></div>`;
    });
  }
  function paint(vn, p) { const bars = $$('.vn__wave i', vn); const k = Math.round(p * bars.length); bars.forEach((b, i) => b.classList.toggle('on', i < k)); }
  function stop() { audio.pause(); if (cur) { cur.classList.remove('is-on'); } }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.vn__btn'); if (!btn) return;
    const vn = btn.closest('.vn'), id = vn.dataset.vn;
    if (cur === vn && !audio.paused) { stop(); return; }
    if (cur && cur !== vn) { cur.classList.remove('is-on'); paint(cur, 0); }
    cur = vn; if (!audio.src.endsWith(`audio/${id}.mp3`)) audio.src = `audio/${id}.mp3`;
    audio.play().then(() => vn.classList.add('is-on')).catch(() => { vn.querySelector('.vn__label').textContent = 'Lecture impossible : touchez à nouveau'; });
  });
  audio.addEventListener('timeupdate', () => { if (cur && audio.duration) { paint(cur, audio.currentTime / audio.duration); $('.vn__time', cur).textContent = fmt(audio.duration - audio.currentTime); } });
  audio.addEventListener('ended', () => { if (cur) { cur.classList.remove('is-on'); paint(cur, 0); $('.vn__time', cur).textContent = fmt(audio.duration); } });
  audio.addEventListener('pause', () => { if (cur && !audio.ended) cur.classList.remove('is-on'); });
  document.getElementById('film').addEventListener('play', stop);

  // ------------------------------------------------------------ barre : étape et avancement
  const secs = $$('[data-step]');
  const step = $('#bar-step'), prog = $('#bar-progress');
  function onScroll() {
    const y = scrollY + 120; let name = 'Votre proposition';
    secs.forEach((s) => { if (s.offsetTop <= y) name = s.dataset.step; });
    step.textContent = name;
    prog.style.width = Math.min(100, (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });

  // ------------------------------------------------------------ démarrage
  fetch('audio/manifest.json').then((r) => r.json()).catch(() => ({})).then((m) => { MAN = m; $$('.vn').forEach((vn) => { const d = MAN[vn.dataset.vn]; if (d) $('.vn__time', vn).textContent = fmt(d.duree); }); });
  mountVoices(); bind(); refresh(); onScroll();
  // ouvre le module demandé par l'adresse (#mod-m3)
  if (location.hash.startsWith('#mod-')) { const d = $(location.hash); if (d) d.open = true; }
})();
