/* Pétanque 2026 — interface (joueurs, classement, organisateur) */
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const SCREEN = /ecran|screen/i.test(location.search + location.hash);
  if (SCREEN) document.documentElement.classList.add('screen');
  const GESTION = !SCREEN && /gestion|manage/i.test(location.search + location.hash);
  if (GESTION) document.documentElement.classList.add('gestion');
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k) { try { return localStorage.getItem('pet26.' + k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem('pet26.' + k) : localStorage.setItem('pet26.' + k, v); } catch (e) { } }
  };
  document.documentElement.dataset.skin = CFG.skin || 'C';

  // ---------------- textes FR / EN ----------------
  const I = {
    fr: {
      ciTitle: 'Je suis là !', ciHelp: 'Avant le tirage au sort, cherche ton nom et confirme ta présence. Tu peux aussi pointer un collègue qui est avec toi.', ciBtn: 'Je suis là', ciUndo: 'Pointé · annuler', ciDone: 'présence confirmée', ciCount: 'participants ont confirmé leur présence',
      tabMe: 'Mon match', tabRound: 'Direct', tabRank: 'Classement', tabRules: 'Règles', admin: 'Organisateur',
      pickTeam: 'Quelle est ton équipe ?', pickHelp: 'Cherche ton nom. L’app s’en souviendra sur ce téléphone.',
      search: 'Nom ou prénom', team: 'Équipe', change: 'Changer d’équipe', noTeams: 'Les équipes ne sont pas encore formées. Reviens un peu avant 17h15.',
      round: 'Tour', of: 'sur', terrain: 'Terrain', vs: 'contre', waitRound: 'En attente du prochain tour', nextAt: 'Prochain tour prévu à',
      bye: 'Exempt ce tour : victoire 13-7 comptée automatiquement.', remaining: 'Temps restant', timeUp: 'Temps écoulé : finissez la mène en cours. En cas d’égalité, une mène décisive.',
      notStarted: 'Le chrono n’a pas encore démarré.', enterScore: 'Saisir le score', us: 'Nous', them: 'Eux', send: 'Envoyer le score',
      waitConfirm: 'Score envoyé. En attente de confirmation par l’adversaire.', edit: 'Modifier', oppEntered: 'L’adversaire a saisi',
      confirm: 'Confirmer', contest: 'Contester', disputed: 'Score contesté : mettez-vous d’accord ou allez voir l’organisateur.',
      validated: 'Score validé', won: 'Victoire', lost: 'Défaite', history: 'Mes matchs', pending: 'en cours',
      eTie: 'Pas d’égalité possible : jouez une mène décisive.', eRange: 'Score entre 0 et 13.',
      rank: 'Classement', w: 'V', l: 'D', elo: 'Pts', buch: 'Bh', diff: '+/−', rankHelp: 'Victoires, puis points Elo (battre une équipe forte rapporte plus), puis Buchholz (Bh, force des adversaires), puis différence de points.',
      rankHelpElo: 'Classement aux points Elo, puis victoires, puis différence de points.',
      roundN: 'Tour', allRounds: 'Tours', noRound: 'Aucun tour généré pour l’instant.', schedule: 'Planning',
      stValidated: 'validé', stSubmitted: 'à confirmer', stDisputed: 'contesté', stNone: 'en jeu', stLive: 'en direct', liveUpd: 'Mettre à jour en direct', liveHelp: 'Le score est partagé en direct automatiquement à chaque modification. Envoie le score final à la fin du match.', tapHint: 'Touche une équipe pour voir ses statistiques et tous ses matchs.', sendFinal: 'Envoyer le score final', liveNow: 'Score en direct', sortRank: 'Haut du classement', sortTerrain: 'Par terrain', findPlayer: 'Trouver un joueur…', noMatch: 'Aucun match trouvé.', liveSaved: 'Score en direct mis à jour', stats: 'Statistiques', close: 'Fermer',
      players: 'Joueurs', saved: 'Enregistré', demo: 'Mode démo : données enregistrées seulement sur cet appareil (Firebase non configuré).', offline: 'Connexion perdue, nouvelle tentative…',
      pin: 'Code organisateur', enter: 'Entrer', badPin: 'Code incorrect', logout: 'Quitter le mode organisateur'
    },
    en: {
      ciTitle: "I'm here!", ciHelp: 'Before the draw, find your name and confirm you are here. You can also check in a colleague who is with you.', ciBtn: "I'm here", ciUndo: 'Checked in · undo', ciDone: 'presence confirmed', ciCount: 'participants have checked in',
      tabMe: 'My match', tabRound: 'Live', tabRank: 'Standings', tabRules: 'Rules', admin: 'Organiser',
      pickTeam: 'Which team are you on?', pickHelp: 'Search your name. The app will remember it on this phone.',
      search: 'First or last name', team: 'Team', change: 'Change team', noTeams: 'Teams have not been formed yet. Check back shortly before 5:15 pm.',
      round: 'Round', of: 'of', terrain: 'Pitch', vs: 'vs', waitRound: 'Waiting for the next round', nextAt: 'Next round planned at',
      bye: 'Bye this round: counted as a 13-7 win.', remaining: 'Time left', timeUp: 'Time is up: finish the current end. If tied, play one deciding end.',
      notStarted: 'The clock has not started yet.', enterScore: 'Enter the score', us: 'Us', them: 'Them', send: 'Send score',
      waitConfirm: 'Score sent. Waiting for the other team to confirm.', edit: 'Edit', oppEntered: 'The other team entered',
      confirm: 'Confirm', contest: 'Dispute', disputed: 'Score disputed: agree on it or see the organiser.',
      validated: 'Score confirmed', won: 'Win', lost: 'Loss', history: 'My matches', pending: 'in play',
      eTie: 'No draws: play one deciding end.', eRange: 'Score must be between 0 and 13.',
      rank: 'Standings', w: 'W', l: 'L', elo: 'Pts', buch: 'Bh', diff: '+/−', rankHelp: 'Wins, then Elo points (beating a strong team earns more), then Buchholz (Bh, strength of opponents), then point difference.',
      rankHelpElo: 'Ranked by Elo points, then wins, then point difference.',
      roundN: 'Round', allRounds: 'Rounds', noRound: 'No round generated yet.', schedule: 'Schedule',
      stValidated: 'confirmed', stSubmitted: 'to confirm', stDisputed: 'disputed', stNone: 'in play', stLive: 'live', liveUpd: 'Update live score', liveHelp: 'The score is shared live automatically each time you change it. Send the final score when the match is over.', tapHint: 'Tap a team to see its statistics and all its matches.', sendFinal: 'Send final score', liveNow: 'Live score', sortRank: 'Top of the table', sortTerrain: 'By pitch', findPlayer: 'Find a player…', noMatch: 'No match found.', liveSaved: 'Live score updated', stats: 'Statistics', close: 'Close',
      players: 'Players', saved: 'Saved', demo: 'Demo mode: data saved on this device only (Firebase not configured).', offline: 'Connection lost, retrying…',
      pin: 'Organiser code', enter: 'Enter', badPin: 'Wrong code', logout: 'Leave organiser mode'
    }
  };
  let lang = ls.get('lang') || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en');
  const t = k => (I[lang] && I[lang][k]) || I.fr[k] || k;

  // ---------------- stockage ----------------
  const DEFAULT_STATE = () => ({
    players: [], pairs: [], teams: [], rounds: [], gen: 0, phase: 'setup',
    terrains: Array.from({ length: 20 }, (_, i) => ({ n: i + 1, surface: '', active: true })),
    cfg: { rounds: 5, matchMin: 20, pauseMin: 5, start: '17:15', rankMode: 'wins' }
  });
  const clean = o => JSON.parse(JSON.stringify(o));

  function makeStore() {
    if (CFG.firebase && CFG.firebase.apiKey && window.firebase) {
      firebase.initializeApp(CFG.firebase);
      const db = firebase.firestore();
      const err = e => { console.error(e); showBanner(t('offline')); };
      return {
        kind: 'firebase',
        onState: cb => db.doc('t/state').onSnapshot(s => { hideBanner(); cb(s.exists ? s.data() : null); }, err),
        onResults: cb => db.collection('m').onSnapshot(q => { const o = {}; q.forEach(d => { o[d.id] = d.data(); }); cb(o); }, err),
        setState: s => db.doc('t/state').set(clean(s)),
        setResult: (id, r) => db.collection('m').doc(id).set(clean(r)),
        clearResults: async () => { const q = await db.collection('m').get(); const b = db.batch(); q.forEach(d => b.delete(d.ref)); await b.commit(); },
        // pointage : un document par joueur (pas de conflit si 70 personnes pointent en même temps)
        onCheckins: cb => db.collection('c').onSnapshot(q => { const o = {}; q.forEach(d => { o[d.id] = d.data(); }); cb(o); }, err),
        setCheckin: (pid, on) => on ? db.collection('c').doc(pid).set({ at: Date.now() }) : db.collection('c').doc(pid).delete(),
        clearCheckins: async () => { const q = await db.collection('c').get(); const b = db.batch(); q.forEach(d => b.delete(d.ref)); await b.commit(); }
      };
    }
    // Mode démo : localStorage + synchronisation entre onglets
    const subs = { s: [], r: [], c: [] };
    const read = k => { try { return JSON.parse(localStorage.getItem('pet26.demo.' + k)); } catch (e) { return null; } };
    const write = (k, v) => { try { localStorage.setItem('pet26.demo.' + k, JSON.stringify(v)); } catch (e) { } };
    const fire = () => { subs.s.forEach(f => f(read('state'))); subs.r.forEach(f => f(read('results') || {})); subs.c.forEach(f => f(read('checkins') || {})); };
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith('pet26.demo.')) fire(); });
    return {
      kind: 'demo',
      onState: cb => { subs.s.push(cb); setTimeout(() => cb(read('state')), 0); },
      onResults: cb => { subs.r.push(cb); setTimeout(() => cb(read('results') || {}), 0); },
      setState: async s => { write('state', clean(s)); fire(); },
      setResult: async (id, r) => { const o = read('results') || {}; o[id] = clean(r); write('results', o); fire(); },
      clearResults: async () => { write('results', {}); fire(); },
      onCheckins: cb => { subs.c.push(cb); setTimeout(() => cb(read('checkins') || {}), 0); },
      setCheckin: async (pid, on) => { const o = read('checkins') || {}; if (on) o[pid] = { at: Date.now() }; else delete o[pid]; write('checkins', o); fire(); },
      clearCheckins: async () => { write('checkins', {}); fire(); }
    };
  }

  // ---------------- état ----------------
  let state = null, results = {}, checkins = {}, ciQ = '', loaded = { s: false, r: false };
  let view = ls.get('view') || 'me';
  let myTeam = ls.get('team');
  let isAdmin = ls.get('admin') === '1';
  let ciOnlyMissing = false, searchQ = '', liveQ = '', liveSort = 'rank', draft = {}, editing = {}, selChip = null, armed = {}, sheetTeam = null, roundView = null, adminTab = ls.get('atab') || 'tour';
  const store = makeStore();
  if (store.kind === 'demo') showBanner(t('demo'));

  store.onState(s => { state = Object.assign(DEFAULT_STATE(), s || {}); loaded.s = true; render(); });
  store.onResults(r => { results = r || {}; loaded.r = true; render(); });
  store.onCheckins(c => { checkins = c || {}; render(); });

  function save(mut) {
    const s = clean(state); mut(s); s.updatedAt = Date.now();
    state = s; render();
    return store.setState(s).catch(e => { console.error(e); toast('Erreur : ' + e.message); });
  }

  // ---------------- dérivés ----------------
  // inscrit = sur la liste (non exclu) ; arrivé = inscrit ET pointé « Je suis là »
  const inscrit = p => !!p && p.present !== false;
  const here = p => inscrit(p) && !!checkins[p.id];
  const pById = () => Object.fromEntries((state.players || []).map(p => [p.id, p]));
  const tById = () => Object.fromEntries((state.teams || []).map(x => [x.id, x]));
  const pName = (p, short) => p ? (short ? (p.first ? p.first.charAt(0) + '. ' : '') + p.last : p.first + ' ' + p.last) : '?';
  function teamNames(team, short) { const P = pById(); return team ? team.p.map(id => esc(pName(P[id], short))).join(' · ') : ''; }
  function teamCos(team) { const P = pById(); return team ? [...new Set(team.p.map(id => (P[id] || {}).co || ''))].join(' / ') : ''; }
  const teamLabel = team => team ? t('team') + ' ' + String(team.num).padStart(2, '0') : '?';
  const surfaceOf = n => ((state.terrains || []).find(x => x.n === n) || {}).surface || '';
  function standings() { return PL.computeStandings(state, results); }
  function ranked() { return PL.rank(standings(), state.cfg.rankMode); }
  const curRound = () => state.rounds[state.rounds.length - 1] || null;
  function resultFor(m) { const r = results[m.id]; return r && r.a === m.a && r.b === m.b ? r : null; }
  function roundStatus(r) {
    const ms = r.matches.map(m => resultFor(m));
    return { total: ms.length, valid: ms.filter(x => x && x.status === 'validated').length, disputed: ms.filter(x => x && x.status === 'disputed').length };
  }

  // ---------------- rendu ----------------
  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#sub').textContent = (CFG.subtitle || {})[lang] || '';
    renderTabs();
    if (!loaded.s) { $('#app').innerHTML = '<div class="card"><p class="muted">…</p></div>'; return; }
    if (SCREEN) { $('#app').innerHTML = vScreen(); tick(); return; }
    // préserve les champs de saisie entre deux rendus
    const keep = {}; document.querySelectorAll('#app [id]').forEach(el => { if ('value' in el && el.type !== 'button') keep[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
    const focus = document.activeElement && document.activeElement.id;
    const html = GESTION ? vGestion() : view === 'round' ? vRound() : view === 'rank' ? vRank() : view === 'rules' ? vRules() : view === 'admin' ? vAdmin() : vMe();
    $('#app').innerHTML = html;
    Object.entries(keep).forEach(([id, v]) => { const el = document.getElementById(id); if (el && el.dataset.keep !== 'no') { if (el.type === 'checkbox') el.checked = v; else el.value = v; } });
    if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); if (el.setSelectionRange && el.type === 'search') { const n = el.value.length; el.setSelectionRange(n, n); } } }
    renderSheet(); tick();
  }
  function renderTabs() {
    const tabs = [['me', t('tabMe')], ['round', t('tabRound')], ['rank', t('tabRank')], ['rules', t('tabRules')]];
    $('#tabs').innerHTML = tabs.map(([k, l]) => `<button type="button" data-act="view" data-v="${k}" ${view === k || (view === 'admin' && k === 'rules') ? 'aria-current="page"' : ''}>${l}</button>`).join('');
  }

  // ----- Mon match -----
  function vMe() {
    const T = tById();
    if (!state.teams.length) return vCheckin();
    if ((!myTeam || !T[myTeam]) && ls.get('me')) { const mt = state.teams.find(x => x.p.includes(ls.get('me'))); if (mt) { myTeam = mt.id; ls.set('team', mt.id); } }
    if (!myTeam || !T[myTeam]) return vPicker();
    const team = T[myTeam], S = standings(), s = S[myTeam];
    const R = ranked(), me = R.find(x => x.id === myTeam);
    let out = `<div class="card"><div class="row between"><div><div class="lbl">${t('team')}</div><h2>${teamLabel(team)}</h2></div>
      <div class="row"><span class="chip soft">${me.rank}ᵉ / ${R.length}</span><span class="chip soft">${s.w} ${t('w')} · ${s.l} ${t('l')}</span></div></div>
      <div class="names">${teamNames(team)}<br>${esc(teamCos(team))}</div></div>`;
    const r = curRound();
    if (!r) {
      out += `<div class="card"><p>${t('waitRound')}.</p>${scheduleLine(1)}</div>`;
    } else if (r.bye === myTeam) {
      out += `<div class="card"><div class="lbl">${t('round')} ${r.n} ${t('of')} ${state.cfg.rounds}</div><p>${t('bye')}</p>${scheduleLine(r.n + 1)}</div>`;
    } else {
      const m = r.matches.find(x => x.a === myTeam || x.b === myTeam);
      out += m ? matchCard(r, m) : `<div class="card"><p>${t('waitRound')}.</p></div>`;
    }
    out += historyCard(s);
    out += `<button type="button" class="btn ghost full" data-act="unpick">${t('change')}</button>`;
    return out;
  }
  // ----- Tableau de bord organisateur sur portable (?gestion) -----
  function vGestion() {
    if (!isAdmin) return `<div class="card" style="max-width:420px"><h2>${t('admin')}</h2><label class="lbl" for="pin">${t('pin')}</label><input type="password" id="pin" inputmode="numeric" autocomplete="off"><button type="button" class="btn" data-act="login">${t('enter')}</button></div>`;
    const T = tById(), P = pById(), c = state.cfg, r = curRound(), st = r ? roundStatus(r) : null;
    const nextN = state.rounds.length + 1;
    const canNext = state.teams.length >= 2 && (!r || st.valid === st.total) && nextN <= c.rounds;
    const sc = PL.schedule(c, Math.max(c.rounds, state.rounds.length + 1));
    const ins = state.players.filter(inscrit), arrived = ins.filter(here), miss = ins.filter(p => !here(p)).sort((a, b) => a.last.localeCompare(b.last));
    const brokenPairs = state.pairs.filter(x => P[x.a] && P[x.b] && here(P[x.a]) !== here(P[x.b]));
    const counts = r ? r.matches.reduce((o, m) => { const x = resultFor(m); const k = x ? x.status : 'none'; o[k] = (o[k] || 0) + 1; return o; }, {}) : {};
    const phase = !state.teams.length ? 'Arrivées / pointage' : !state.rounds.length ? 'Équipes tirées, prêt à lancer' : (st.valid === st.total && nextN > c.rounds ? 'Tournoi terminé' : `Tour ${r.n} en cours`);
    // barre du haut
    let h = `<header class="g-top">
      <div><div class="lbl">Phase</div><b class="g-phase">${phase}</b></div>
      <div><div class="lbl">Tour</div><b>${r ? r.n : 0} / ${c.rounds}</b></div>
      <div><div class="lbl">Chrono</div>${r && r.startedAt ? `<span class="clock g-clock" data-clock="${r.startedAt}">--:--</span>` : '<b class="muted">—</b>'}</div>
      <div><div class="lbl">Arrivés</div><b>${arrived.length} / ${ins.length}</b></div>
      <div><div class="lbl">Équipes</div><b>${state.teams.length}</b></div>
      ${r ? `<div><div class="lbl">Scores tour ${r.n}</div><span class="chip ok">${counts.validated || 0} validés</span> <span class="chip warn">${(counts.live || 0) + (counts.submitted || 0)} en cours/à confirmer</span> ${counts.disputed ? `<span class="chip bad">${counts.disputed} contestés</span>` : ''} <span class="chip soft">${counts.none || 0} sans score</span></div>` : ''}
      <div class="g-actions">
        ${!state.rounds.length ? armBtn('draw', state.teams.length ? 'Refaire le tirage' : 'Tirer les équipes', 'sm') : ''}
        <button type="button" class="btn sm" data-act="gen" ${canNext ? '' : 'disabled'}>Générer tour ${nextN}</button>
        ${r ? `<button type="button" class="btn sm ghost" data-act="startclock">${r.startedAt ? 'Redémarrer' : 'Démarrer'} chrono</button>` : ''}
        ${nextN > c.rounds ? `<button type="button" class="btn sm ghost" data-act="addround">+ Tour ${c.rounds + 1}</button>` : ''}
        ${r ? armBtn('undo', 'Annuler tour ' + r.n, 'sm danger') : ''}
        <a class="btn sm ghost" href="./?ecran" target="_blank" rel="noopener">Écran géant ↗</a>
        <a class="btn sm ghost" href="./" target="_blank" rel="noopener">App complète ↗</a>
      </div></header>`;
    // colonne 1 : pointage + paramètres
    let c1 = `<section class="card"><div class="row between"><h3>Pointage</h3><span class="chip ${miss.length ? 'warn' : 'ok'}">${arrived.length} / ${ins.length}</span></div>
      ${brokenPairs.length ? `<p class="small" style="color:var(--bad)"><b>Binôme incomplet :</b> ${brokenPairs.map(x => `${esc(pName(P[x.a]))} + ${esc(pName(P[x.b]))}`).join(' ; ')}</p>` : ''}
      <div class="lbl">Encore attendus (${miss.length})</div>
      <div class="g-list">${miss.map(p => `<div class="row between"><span>${esc(pName(p))} <span class="muted small">${esc(p.co)}</span></span><button type="button" class="btn sm ghost" data-act="acheckin" data-id="${p.id}" data-on="1">Arrivé</button></div>`).join('') || '<p class="muted small">Tout le monde est là.</p>'}</div>
      <p class="muted small">${state.pairs.length} binômes choisis · ${state.rounds.length ? 'tournoi lancé' : 'pas encore de tour'}</p></section>
      <section class="card"><h3>Timing</h3><div class="grid2">
        <label class="small">Tours<input type="number" id="c_rounds" min="1" max="12" value="${c.rounds}"></label>
        <label class="small">Début<input type="time" id="c_start" value="${esc(c.start)}"></label>
        <label class="small">Match (min)<input type="number" id="c_match" min="5" max="60" value="${c.matchMin}"></label>
        <label class="small">Pause (min)<input type="number" id="c_pause" min="0" max="30" value="${c.pauseMin}"></label></div>
        <select id="c_rank" style="display:none"><option value="${c.rankMode || 'wins'}" selected></option></select>
        <button type="button" class="btn sm ghost" data-act="savecfg">Enregistrer</button>
        <p class="muted small">${sc.map(x => `T${x.n} ${x.start}`).join(' · ')}</p></section>`;
    // colonne 2 : matchs du tour
    let c2 = '';
    if (r) {
      const ms = r.matches.slice().sort((a, b) => {
        const o = x => { const z = resultFor(x); return z ? ({ disputed: 0, submitted: 1, live: 2, validated: 4 }[z.status] ?? 3) : 3; };
        return o(a) - o(b) || a.terrain - b.terrain;
      });
      c2 = `<section class="card"><div class="row between"><h3>Tour ${r.n} · matchs</h3><span class="muted small">contestés et à confirmer en premier</span></div>
        <table class="g-tbl"><thead><tr><th>T.</th><th>Équipe A</th><th class="n">A</th><th class="n">B</th><th>Équipe B</th><th>État</th><th></th></tr></thead><tbody>
        ${ms.map(m => { const res = resultFor(m), stt = res ? res.status : 'none';
          return `<tr class="${stt === 'disputed' ? 'g-bad' : stt === 'validated' ? 'g-ok' : ''}"><td><b>${m.terrain}</b><div class="muted small">${esc(surfaceOf(m.terrain))}</div></td>
            <td><b>${String(T[m.a].num).padStart(2, '0')}</b> <span class="small">${teamNames(T[m.a], true)}</span></td>
            <td class="n"><input class="g-in" type="number" min="0" max="13" id="sa_${m.id}" value="${res ? res.sa : ''}" inputmode="numeric"></td>
            <td class="n"><input class="g-in" type="number" min="0" max="13" id="sb_${m.id}" value="${res ? res.sb : ''}" inputmode="numeric"></td>
            <td><b>${String(T[m.b].num).padStart(2, '0')}</b> <span class="small">${teamNames(T[m.b], true)}</span></td>
            <td>${statusChip(res)}</td>
            <td class="g-btns">${res && stt !== 'validated' && !PL.validateScore(res.sa, res.sb) ? `<button type="button" class="btn sm" data-act="adminquick" data-id="${m.id}">✓ ${res.sa}:${res.sb}</button>` : ''}<button type="button" class="btn sm ghost" data-act="adminscore" data-id="${m.id}">Valider</button></td></tr>`; }).join('')}
        ${r.bye ? `<tr><td>—</td><td colspan="6">Exempt : ${teamLabel(T[r.bye])} (${teamNames(T[r.bye], true)})</td></tr>` : ''}
        </tbody></table></section>`;
    } else if (state.teams.length) {
      c2 = `<section class="card"><h3>Équipes (${state.teams.length})</h3><p class="muted small">Pour échanger des joueurs, ouvre l'app complète > Organisateur > Équipes.</p>
        <div class="g-teams">${state.teams.map(x => `<div><b>${String(x.num).padStart(2, '0')}</b> ${teamNames(x, true)} ${x.chosen ? '<span class="chip soft">choisi</span>' : ''}</div>`).join('')}</div></section>`;
    } else {
      c2 = `<section class="card"><h3>Avant le tirage</h3><p class="small">${arrived.length} joueurs arrivés seront tirés au sort${arrived.length % 2 ? ' (nombre impair : une triplette sera formée)' : ''}. Les absents restent hors tirage.</p></section>`;
    }
    // colonne 3 : classement complet
    let c3 = '';
    if (state.teams.length) {
      const R = ranked();
      c3 = `<section class="card"><h3>Classement</h3><table class="g-rank"><tbody>${R.map(x => `<tr class="click" data-act="sheet" data-id="${x.id}"><td class="c-rk">${x.rank}</td><td><b>${String(x.num).padStart(2, '0')}</b> <span class="small">${teamNames(T[x.id], true)}</span></td><td>${pastLine(x)}</td><td class="n"><b>${x.w}-${x.l}</b></td><td class="n muted">${Math.round(x.elo)}</td><td class="n muted">${x.diff > 0 ? '+' : ''}${x.diff}</td></tr>`).join('')}</tbody></table></section>`;
    }
    return h + `<div class="g-grid"><div class="g-col">${c1}</div><div class="g-col">${c2}</div><div class="g-col">${c3}</div></div>`;
  }

  // ----- Écran géant (?ecran ou #ecran) -----
  function vScreen() {
    const T = tById(), P = pById();
    const url = location.host + (location.pathname.length > 1 ? location.pathname : '');
    const qr = `<div class="scr-qr"><img src="qr.png" alt="QR code"><div class="scr-url">${esc(url)}</div></div>`;
    const sn = id => teamNames(T[id], true);
    // 1) Avant le tirage : arrivées
    if (!state.teams.length) {
      const ins = state.players.filter(inscrit), ok = ins.filter(here);
      const miss = ins.filter(p => !here(p)).sort((a, b) => a.last.localeCompare(b.last));
      const recent = ok.slice().sort((a, b) => (checkins[b.id].at || 0) - (checkins[a.id].at || 0)).slice(0, 8);
      const pct = ins.length ? Math.round(100 * ok.length / ins.length) : 0;
      return `<div class="scr scr-ci">
        <section class="scr-left"><h1>Pétanque 2026</h1><p class="scr-lead">Scanne le QR code<br>et appuie sur <b>« Je suis là »</b></p>${qr}
          <p class="scr-sub">Scan the QR code and tap <b>“I'm here”</b></p></section>
        <section class="scr-right"><div class="scr-count"><span class="big-n">${ok.length}</span><span> / ${ins.length} arrivés</span></div>
          <div class="scr-bar"><i style="width:${pct}%"></i></div>
          ${recent.length ? `<h2>Derniers arrivés</h2><div class="scr-recent">${recent.map(p => `<span>✓ ${esc(pName(p))} <small>${esc(p.co)}</small></span>`).join('')}</div>` : ''}
          <h2>Encore attendus (${miss.length})</h2>
          <div class="scr-miss ${miss.length > 45 ? 'dense' : ''}">${miss.map(p => `<span>${esc(p.first)} <b>${esc(p.last)}</b> <small>${esc(p.co)}</small></span>`).join('')}</div></section></div>`;
    }
    const R = ranked();
    const rankBox = (n, title) => `<section class="scr-rank"><h2>${title}</h2><table>${R.slice(0, n).map(x => `<tr><td class="c-rk">${x.rank}</td><td class="c-tm"><b>${String(x.num).padStart(2, '0')}</b> ${sn(x.id)}</td><td class="c-dots">${pastLine(x)}</td><td class="n c-wl">${x.w}-${x.l}</td><td class="n muted">${Math.round(x.elo)}</td></tr>`).join('')}</table></section>`;
    // 2) Équipes tirées, tournoi pas commencé
    if (!state.rounds.length) {
      return `<div class="scr scr-teams"><header class="scr-head"><h1>Les équipes</h1><p>Trouve ton équipe dans l'app · <i>Find your team in the app</i> · début ${esc(state.cfg.start.replace(':', 'h'))}</p></header>
        <div class="scr-tgrid">${state.teams.map(x => `<div><b>${String(x.num).padStart(2, '0')}</b> ${teamNames(x)}</div>`).join('')}</div>${qr}</div>`;
    }
    // 3) Tournoi en cours
    const r = curRound(), st = roundStatus(r);
    const done = state.rounds.length >= state.cfg.rounds && st.valid === st.total;
    if (done) {
      return `<div class="scr scr-final"><header class="scr-head"><h1>Classement final</h1><p>Bravo à tous ! · <i>Well played everyone!</i></p></header>
        <div class="scr-podium">${R.slice(0, 3).map((x, i) => `<div class="pod p${i + 1}"><span class="pod-n">${i + 1}</span><b>Équipe ${String(x.num).padStart(2, '0')}</b><span>${teamNames(T[x.id])}</span><small>${x.w} victoires · ${Math.round(x.elo)} pts</small></div>`).join('')}</div>
        ${rankBox(20, 'Classement')}</div>`;
    }
    const sc = PL.schedule(state.cfg, Math.max(state.cfg.rounds, r.n + 1))[r.n];
    const ms = r.matches.slice().sort((a, b) => a.terrain - b.terrain);
    const score = res => !res ? '<span class="sc none">–</span>' : `<span class="sc ${res.status === 'validated' ? 'ok' : res.status === 'disputed' ? 'bad' : 'live'}">${res.sa}:${res.sb}</span>`;
    return `<div class="scr scr-live"><header class="scr-head row between"><div><h1>Tour ${r.n} <small>/ ${state.cfg.rounds}</small></h1><p>${st.valid}/${st.total} matchs terminés${sc && r.n < state.cfg.rounds ? ` · tour ${r.n + 1} à ${sc.start}` : ''}</p></div>
        <div class="scr-clock">${r.startedAt ? `<span class="clock" data-clock="${r.startedAt}">--:--</span>` : '<span class="muted">chrono en attente</span>'}</div></header>
      <div class="scr-body"><section class="scr-matches">${ms.map(m => { const res = resultFor(m); return `<div class="scr-m ${res && res.status === 'validated' ? 'fin' : ''}"><div class="scr-t">T${m.terrain}${surfaceOf(m.terrain) ? ` <small>${esc(surfaceOf(m.terrain))}</small>` : ''}</div>
          <div class="scr-a"><b>${String(T[m.a].num).padStart(2, '0')}</b> ${sn(m.a)}</div>${score(res)}<div class="scr-b"><b>${String(T[m.b].num).padStart(2, '0')}</b> ${sn(m.b)}</div></div>`; }).join('')}
          ${r.bye ? `<div class="scr-m"><div class="scr-t">BYE</div><div class="scr-a">${sn(r.bye)}</div></div>` : ''}</section>
        ${rankBox(20, 'Classement')}</div></div>`;
  }

  // ----- Pointage « Je suis là » (avant le tirage) -----
  function vCheckin() {
    const P = state.players.filter(p => p.present !== false);
    const me = ls.get('me'), meP = P.find(p => p.id === me);
    const n = P.filter(p => checkins[p.id]).length;
    let h = `<div class="card"><h2>${t('ciTitle')}</h2><p class="muted small">${t('ciHelp')}</p>`;
    if (meP && checkins[meP.id]) h += `<p class="chip ok">✓ ${esc(pName(meP))} · ${esc(meP.co)} — ${t('ciDone')}</p>`;
    const q = ciQ.trim().toLowerCase();
    const list = q.length >= 2 ? P.filter(p => pName(p).toLowerCase().includes(q) || (p.last + ' ' + p.first).toLowerCase().includes(q)).slice(0, 12) : [];
    h += `<input type="search" id="ciq" placeholder="${t('search')}" autocomplete="off" value="${esc(ciQ)}" data-keep="no">
      <div>${list.map(p => {
        const on = !!checkins[p.id];
        return `<div class="pick" style="cursor:default"><span><b>${esc(pName(p))}</b><br><span class="names">${esc(p.co)}</span></span>
          ${on ? `<button type="button" class="btn sm ghost" data-act="checkin" data-id="${p.id}" data-on="0">✓ ${t('ciUndo')}</button>` : `<button type="button" class="btn sm" data-act="checkin" data-id="${p.id}" data-on="1">${t('ciBtn')}</button>`}</div>`;
      }).join('')}${q.length >= 2 && !list.length ? `<p class="muted small">${t('noMatch')}</p>` : ''}</div>
      <p class="muted small">${n} / ${P.length} ${t('ciCount')}</p></div>
      <div class="card"><p class="small">${t('noTeams')}</p></div>`;
    return h;
  }
  function scheduleLine(n) {
    if (n > state.cfg.rounds) return '';
    const sc = PL.schedule(state.cfg, n)[n - 1];
    return `<p class="muted small">${t('nextAt')} ${sc.start}</p>`;
  }
  function vPicker() {
    const P = pById(), q = searchQ.trim().toLowerCase();
    const teams = state.teams.filter(x => !q || x.p.some(id => pName(P[id]).toLowerCase().includes(q)) || String(x.num) === q);
    return `<div class="card"><h2>${t('pickTeam')}</h2><p class="muted small">${t('pickHelp')}</p>
      <input type="search" id="q" data-act="search" placeholder="${t('search')}" autocomplete="off" value="${esc(searchQ)}" data-keep="no">
      <div>${teams.slice(0, 40).map(x => `<button type="button" class="pick" data-act="pick" data-id="${x.id}"><span><b>${teamLabel(x)}</b><br><span class="names">${teamNames(x)}</span></span><span class="chip soft">${esc(teamCos(x))}</span></button>`).join('')}</div></div>`;
  }
  function matchCard(r, m) {
    const T = tById(), mineA = m.a === myTeam, opp = T[mineA ? m.b : m.a];
    const res = resultFor(m);
    const surf = surfaceOf(m.terrain);
    let html = `<div class="card"><div class="row between"><span class="lbl">${t('round')} ${r.n} ${t('of')} ${state.cfg.rounds}</span>${surf ? `<span class="chip">${esc(surf)}</span>` : ''}</div>
      <div class="big">${t('terrain')} ${m.terrain}</div>
      <div><span class="muted small">${t('vs')}</span> <b>${teamLabel(opp)}</b><div class="names">${teamNames(opp)} · ${esc(teamCos(opp))}</div></div>
      ${clockHtml(r)}`;
    const mine = res ? (mineA ? res.sa : res.sb) : null, theirs = res ? (mineA ? res.sb : res.sa) : null;
    if (res && res.status === 'validated') {
      html += `<div class="row between"><span class="chip ${mine > theirs ? 'ok' : 'bad'}">${mine > theirs ? t('won') : t('lost')}</span><span class="big">${mine} : ${theirs}</span></div><p class="muted small">${t('validated')}.</p>${scheduleLine(r.n + 1)}`;
    } else if (res && res.status === 'submitted' && res.by !== myTeam && !editing[m.id]) {
      html += `<p>${t('oppEntered')} :</p><div class="score"><div><div class="lbl">${t('us')}</div><div class="big">${mine}</div></div><div>:</div><div><div class="lbl">${t('them')}</div><div class="big">${theirs}</div></div></div>
        <div class="grid2"><button type="button" class="btn" data-act="confirm" data-id="${m.id}">${t('confirm')}</button><button type="button" class="btn danger" data-act="contest" data-id="${m.id}">${t('contest')}</button></div>`;
    } else if (res && res.status === 'submitted' && res.by === myTeam && !editing[m.id]) {
      html += `<div class="score"><div><div class="lbl">${t('us')}</div><div class="big">${mine}</div></div><div>:</div><div><div class="lbl">${t('them')}</div><div class="big">${theirs}</div></div></div>
        <p class="muted small">${t('waitConfirm')}</p><button type="button" class="btn ghost" data-act="editscore" data-id="${m.id}">${t('edit')}</button>`;
    } else {
      if (res && res.status === 'disputed') html += `<p class="chip bad">${t('disputed')}</p>`;
      // brouillon : resynchronisé quand l'autre équipe met à jour le score en direct
      let d = draft[m.id];
      const focused = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.score === m.id;
      if (!d || (res && res.status === 'live' && d.src !== res.at && !focused)) d = draft[m.id] = { me: mine != null ? mine : 0, them: theirs != null ? theirs : 0, src: res ? res.at : null };
      if (res && res.status === 'live') html += `<p class="small"><span class="chip warn">${t('liveNow')} ${mine}:${theirs}</span> <span class="muted">${ago(res.at)}</span></p>`;
      html += `<div class="lbl">${t('enterScore')}</div><div class="score">
        ${stepper(m.id, 'me', t('us'), d.me)}<div class="big">:</div>${stepper(m.id, 'them', t('them'), d.them)}</div>
        <button type="button" class="btn full" data-act="send" data-id="${m.id}">${t('sendFinal')}</button>
        <p class="muted small">${t('liveHelp')}</p>`;
    }
    return html + '</div>';
  }
  const stepper = (id, k, label, v) => `<div class="stepper"><label class="lbl" for="sc_${id}_${k}">${label}</label><input class="val" type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="13" id="sc_${id}_${k}" data-score="${id}" data-k="${k}" data-keep="no" value="${v}" aria-label="${label}"><div class="ctl"><button type="button" aria-label="−1" data-act="step" data-id="${id}" data-k="${k}" data-d="-1">−</button><button type="button" aria-label="+1" data-act="step" data-id="${id}" data-k="${k}" data-d="1">+</button></div></div>`;
  function ago(ts) {
    if (!ts) return '';
    const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    return lang === 'fr' ? (m < 1 ? "à l'instant" : `il y a ${m} min`) : (m < 1 ? 'just now' : `${m} min ago`);
  }
  // pastille d'état d'un match (vue publique et organisateur)
  function statusChip(res) {
    const st = res ? res.status : 'none';
    if (st === 'validated') return `<span class="chip ok">${res.sa}:${res.sb}</span>`;
    if (st === 'submitted') return `<span class="chip warn">${res.sa}:${res.sb} · ${t('stSubmitted')}</span>`;
    if (st === 'live') return `<span class="chip warn">● ${res.sa}:${res.sb} · ${t('stLive')}</span>`;
    if (st === 'disputed') return `<span class="chip bad">${t('stDisputed')}</span>`;
    return `<span class="chip soft">${t('stNone')}</span>`;
  }
  function clockHtml(r) {
    if (!r.startedAt) return `<p class="muted small">${t('notStarted')}</p>`;
    return `<div class="row between"><span class="lbl">${t('remaining')}</span><span class="clock" data-clock="${r.startedAt}">--:--</span></div><p class="small muted" data-timeup hidden>${t('timeUp')}</p>`;
  }
  function historyCard(s) {
    if (!s.hist.length) return '';
    const T = tById();
    return `<div class="card"><h3>${t('history')}</h3><div class="list">${s.hist.map(h => h.bye
      ? `<div class="row between"><span>${t('round')} ${h.round}</span><span class="chip soft">BYE 13:7</span></div>`
      : `<div class="row between"><span>${t('round')} ${h.round} · ${t('terrain')} ${h.terrain}<br><span class="names">${t('vs')} ${teamLabel(T[h.opp])}</span></span>${h.pending ? `<span class="chip soft">${t('pending')}</span>` : `<span><span class="chip ${h.win ? 'ok' : 'bad'}">${h.me}:${h.them}</span> <span class="small muted">${h.d >= 0 ? '+' : ''}${Math.round(h.d)}</span></span>`}</div>`).join('')}</div></div>`;
  }

  // ----- Tours -----
  function vRound() {
    const sc = PL.schedule(state.cfg, Math.max(state.cfg.rounds, state.rounds.length));
    let html = `<div class="card"><h2>${t('schedule')}</h2><div class="row">${sc.map(x => {
      const r = state.rounds.find(y => y.n === x.n);
      const st = r ? roundStatus(r) : null;
      return `<button type="button" class="pchip ${roundView === x.n || (roundView == null && curRound() && curRound().n === x.n) ? 'sel' : ''}" data-act="roundview" data-n="${x.n}" ${r ? '' : 'disabled'}>${t('round')} ${x.n} · ${x.start}${st ? ` · ${st.valid}/${st.total}` : ''}</button>`;
    }).join('')}</div></div>`;
    const n = roundView || (curRound() && curRound().n);
    const r = state.rounds.find(y => y.n === n);
    if (!r) return html + `<div class="card"><p>${t('noRound')}</p></div>`;
    const T = tById(), P = pById();
    const Rk = Object.fromEntries(ranked().map(x => [x.id, x]));
    const q = liveQ.trim().toLowerCase();
    let ms = r.matches.slice();
    if (q) ms = ms.filter(m => [m.a, m.b].some(id => T[id] && T[id].p.some(pid => pName(P[pid]).toLowerCase().includes(q))) || String(m.terrain) === q);
    if (liveSort === 'rank') ms.sort((x, y) => Math.min(Rk[x.a].rank, Rk[x.b].rank) - Math.min(Rk[y.a].rank, Rk[y.b].rank));
    else ms.sort((x, y) => x.terrain - y.terrain);
    const side = id => `<div><b>${teamLabel(T[id])}</b> <span class="muted small">#${Rk[id].rank} · ${Rk[id].w}-${Rk[id].l}</span><span class="names" style="display:block">${teamNames(T[id], true)}</span></div>`;
    html += `<div class="card"><div class="row between"><h2>${t('round')} ${r.n}</h2>${r === curRound() ? clockHtml(r).replace('<p class="small muted" data-timeup hidden>' + t('timeUp') + '</p>', '') : ''}</div>
      <div class="row"><button type="button" class="pchip ${liveSort === 'rank' ? 'sel' : ''}" data-act="livesort" data-k="rank">${t('sortRank')}</button><button type="button" class="pchip ${liveSort === 'terrain' ? 'sel' : ''}" data-act="livesort" data-k="terrain">${t('sortTerrain')}</button></div>
      <input type="search" id="lq" placeholder="${t('findPlayer')}" autocomplete="off" value="${esc(liveQ)}" data-keep="no">
      <div class="list">` +
      (ms.length ? ms.map(m => {
        const res = resultFor(m);
        const mine = m.a === myTeam || m.b === myTeam;
        return `<div style="${mine ? 'background:var(--soft);padding-inline:8px;border-radius:8px' : ''}"><div class="row between"><b>${t('terrain')} ${m.terrain}${surfaceOf(m.terrain) ? ` <span class="muted small">· ${esc(surfaceOf(m.terrain))}</span>` : ''}</b>${statusChip(res)}</div>
          <div class="vs small">${side(m.a)}<div class="muted">${t('vs')}</div>${side(m.b)}</div></div>`;
      }).join('') : `<p class="muted">${t('noMatch')}</p>`) + (r.bye && !q ? `<div class="row between"><span>${teamLabel(T[r.bye])} <span class="names">${teamNames(T[r.bye], true)}</span></span><span class="chip soft">BYE</span></div>` : '') + '</div></div>';
    return html;
  }

  // ----- Classement -----
  function vRank() {
    if (!state.teams.length) return `<div class="card"><p>${t('noTeams')}</p></div>`;
    const R = ranked(), T = tById();
    return `<div class="card"><h2>${t('rank')}</h2><p class="muted small">${state.cfg.rankMode === 'elo' ? t('rankHelpElo') : t('rankHelp')}</p>
      <p class="hint">${t('tapHint')}</p>
      <p class="small muted legend"><i class="dot w"></i> ${t('won')} <i class="dot l"></i> ${t('lost')} <i class="dot pend"></i> ${t('pending')}</p>
      <div class="tbl"><table><thead><tr><th>#</th><th>${t('team')}</th><th class="n">${t('w')}</th><th class="n">${t('l')}</th><th class="n">${t('elo')}</th><th class="n">${t('buch')}</th><th class="n">${t('diff')}</th><th aria-hidden="true"></th></tr></thead><tbody>
      ${R.map(s => `<tr class="click ${s.id === myTeam ? 'me' : ''}" data-act="sheet" data-id="${s.id}" tabindex="0" role="button" aria-label="${teamLabel(T[s.id])}"><td><span class="rk">${s.rank}</span></td><td><b>${String(s.num).padStart(2, '0')}</b> <span class="names">${teamNames(T[s.id], true)}</span>${pastLine(s)}</td><td class="n">${s.w}</td><td class="n">${s.l}</td><td class="n">${Math.round(s.elo)}</td><td class="n">${s.buch}</td><td class="n">${s.diff > 0 ? '+' : ''}${s.diff}</td><td class="go" aria-hidden="true">›</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  // une pastille par tour : verte = victoire, rouge = défaite, grise = en cours, contour = exempt
  function pastLine(s) {
    if (!s.hist.length) return '';
    const T = tById(), nn = id => String((T[id] || {}).num || '').padStart(2, '0');
    return `<span class="dots">${s.hist.map(h => {
      const cls = h.bye ? 'bye' : h.pending ? 'pend' : h.win ? 'w' : 'l';
      const tip = h.bye ? `T${h.round} BYE` : h.pending ? `T${h.round} vs ${nn(h.opp)}` : `T${h.round} ${h.me}:${h.them} vs ${nn(h.opp)}`;
      return `<i class="dot ${cls}" title="${tip}"></i>`;
    }).join('')}</span>`;
  }
  function renderSheet() {
    const el = $('#sheet');
    if (!sheetTeam || !state || !tById()[sheetTeam]) { el.innerHTML = ''; return; }
    const T = tById(), S = standings(), s = S[sheetTeam], R = ranked(), me = R.find(x => x.id === sheetTeam);
    const avgOpp = s.opps.length ? Math.round(s.opps.reduce((a, o) => a + S[o].elo, 0) / s.opps.length) : '-';
    el.innerHTML = `<div class="sheet" data-act="closesheet"><div class="card" role="dialog" aria-modal="true" data-stop="1">
      <div class="row between"><h2>${teamLabel(T[sheetTeam])}</h2><button type="button" class="btn ghost sm" data-act="closesheet">${t('close')}</button></div>
      <div class="names">${teamNames(T[sheetTeam])}<br>${esc(teamCos(T[sheetTeam]))}</div>
      <div class="grid3">
        <div class="card"><span class="lbl">#</span><span class="big">${me.rank}</span></div>
        <div class="card"><span class="lbl">${t('w')}-${t('l')}</span><span class="big">${s.w}-${s.l}</span></div>
        <div class="card"><span class="lbl">Elo</span><span class="big">${Math.round(s.elo)}</span></div>
        <div class="card"><span class="lbl">${t('diff')}</span><span class="big">${s.diff > 0 ? '+' : ''}${s.diff}</span></div>
        <div class="card"><span class="lbl">Buchholz</span><span class="big">${s.buch}</span></div>
        <div class="card"><span class="lbl">Elo adv.</span><span class="big">${avgOpp}</span></div>
      </div>${historyCard(s).replace(t('history'), t('stats'))}</div></div>`;
  }

  // ----- Règles -----
  function vRules() {
    const c = state.cfg;
    const R = lang === 'fr' ? `
      <h3>Notre tournoi</h3><ul>
        <li>Doublettes : 3 boules par joueur. Une éventuelle triplette joue avec 2 boules par joueur (6 boules par équipe dans les deux cas).</li>
        <li>${c.rounds} tours de ${c.matchMin} min, un nouveau tour toutes les ${c.matchMin + c.pauseMin} min dès ${c.start.replace(':', 'h')}.</li>
        <li>Le match s’arrête dès qu’une équipe atteint <b>13 points</b>, même avant la fin du temps.</li>
        <li>Au coup de sifflet (chrono à 0) : on <b>termine la mène en cours</b>, puis le match s’arrête. L’équipe qui mène gagne.</li>
        <li>En cas d’<b>égalité</b> à ce moment-là : on joue <b>une mène décisive</b>. Il n’y a jamais de match nul.</li>
        <li>Saisie : une équipe entre le score dans l’app, l’autre le confirme. En cas de désaccord, « Contester » et l’organisateur tranche.</li>
        <li>Appariements : à chaque tour, vous affrontez une équipe avec le même nombre de victoires, jamais deux fois la même, en mélangeant les sociétés. Les terrains tournent.</li>
        <li>Classement : victoires, puis points Elo (battre une équipe forte rapporte plus, avec un petit bonus selon l’écart), puis Buchholz (somme des victoires de vos adversaires), puis différence de points.</li>
        <li>Une équipe exempte (nombre impair d’équipes) gagne 13-7.</li></ul>
      <h3>Règles de base de la pétanque</h3><ul>
        <li>Un tirage au sort désigne l’équipe qui commence. Elle trace un cercle de 35 à 50 cm et lance le cochonnet entre 6 et 10 m.</li>
        <li>On joue les pieds dans le cercle, sans les décoller du sol, jusqu’à ce que la boule retombe.</li>
        <li>La première équipe joue une boule. Ensuite, c’est toujours l’équipe qui <b>n’a pas le point</b> qui joue, jusqu’à reprendre le point ou épuiser ses boules.</li>
        <li>Quand toutes les boules sont jouées, l’équipe gagnante marque 1 point par boule plus proche du cochonnet que la meilleure boule adverse.</li>
        <li>L’équipe qui a gagné la mène trace le nouveau cercle à l’endroit du cochonnet et le relance.</li>
        <li>On ne ramasse aucune boule avant la fin de la mène et la mesure.</li>
        <li>Une boule qui sort du terrain est morte. Si le cochonnet sort : mène nulle si les deux équipes ont encore des boules ; sinon, l’équipe qui en a encore marque autant de points que de boules restantes.</li>
        <li>Si les deux meilleures boules adverses sont à égale distance et qu’il n’y a plus de boules à jouer, la mène est nulle.</li>
        <li>Fair-play : environ une minute par boule, on se tient à l’écart et en silence pendant que l’adversaire joue.</li></ul>` : `
      <h3>Our tournament</h3><ul>
        <li>Doubles: 3 boules per player. A possible team of three plays with 2 boules each (6 boules per team either way).</li>
        <li>${c.rounds} rounds of ${c.matchMin} min, a new round every ${c.matchMin + c.pauseMin} min from ${c.start}.</li>
        <li>A match ends as soon as a team reaches <b>13 points</b>, even before time is up.</li>
        <li>At the whistle (clock at 0): <b>finish the current end</b>, then the match stops. The team ahead wins.</li>
        <li>If the score is <b>tied</b> at that point, play <b>one deciding end</b>. There are no draws.</li>
        <li>Scores: one team enters the score in the app, the other confirms it. If you disagree, tap "Dispute" and the organiser decides.</li>
        <li>Pairings: each round you meet a team with the same number of wins, never the same team twice, mixing companies. Pitches rotate.</li>
        <li>Standings: wins, then Elo points (beating a strong team earns more, with a small bonus for the margin), then Buchholz (your opponents’ total wins), then point difference.</li>
        <li>A team with a bye (odd number of teams) wins 13-7.</li></ul>
      <h3>Basic pétanque rules</h3><ul>
        <li>A coin toss decides who starts. That team draws a circle of 35 to 50 cm and throws the jack 6 to 10 m away.</li>
        <li>Throw with both feet inside the circle and on the ground until the boule lands.</li>
        <li>The first team plays one boule. After that, the team <b>not holding the point</b> always plays, until it takes the point or runs out of boules.</li>
        <li>When all boules are played, the winning team scores 1 point for each boule closer to the jack than the opponents’ best boule.</li>
        <li>The team that won the end draws the new circle where the jack lies and throws it again.</li>
        <li>Do not pick up any boule before the end is over and measured.</li>
        <li>A boule leaving the pitch is dead. If the jack leaves the pitch: the end is void if both teams still have boules; otherwise the team with boules left scores one point per remaining boule.</li>
        <li>If the two closest opposing boules are at equal distance and no boules remain, the end is void.</li>
        <li>Fair play: about one minute per boule; stand aside and stay quiet while the other team plays.</li></ul>`;
    return `<div class="card rules"><h2>${t('tabRules')}</h2>${R}</div>
      <button type="button" class="btn ghost full" data-act="view" data-v="admin">${t('admin')}</button>`;
  }

  // ----- Organisateur -----
  function vAdmin() {
    if (!isAdmin) return `<div class="card"><h2>${t('admin')}</h2><label class="lbl" for="pin">${t('pin')}</label><input type="password" id="pin" inputmode="numeric" autocomplete="off"><button type="button" class="btn" data-act="login">${t('enter')}</button></div>`;
    const tabs = [['tour', 'Tournoi'], ['teams', 'Équipes'], ['players', 'Joueurs'], ['pairs', 'Binômes'], ['terr', 'Terrains']];
    let h = `<div class="card"><div class="row between"><h2>${t('admin')}</h2><button type="button" class="btn ghost sm" data-act="logout">${t('logout')}</button></div>
      <div class="row">${tabs.map(([k, l]) => `<button type="button" class="pchip ${adminTab === k ? 'sel' : ''}" data-act="atab" data-k="${k}">${l}</button>`).join('')}</div></div>`;
    h += adminTab === 'teams' ? aTeams() : adminTab === 'players' ? aPlayers() : adminTab === 'pairs' ? aPairs() : adminTab === 'terr' ? aTerr() : aTour();
    return h;
  }
  const armBtn = (key, label, cls, extra) => `<button type="button" class="btn ${cls || ''}" data-act="arm" data-key="${key}" ${extra || ''}>${armed[key] ? 'Confirmer ?' : label}</button>`;

  function aTour() {
    const c = state.cfg, r = curRound(), st = r ? roundStatus(r) : null;
    const sc = PL.schedule(c, Math.max(c.rounds, state.rounds.length + 1));
    const nextN = state.rounds.length + 1;
    const canNext = state.teams.length >= 2 && (!r || st.valid === st.total) && nextN <= c.rounds;
    let h = `<div class="card"><h3>Paramètres</h3><div class="grid2">
        <label>Tours<input type="number" id="c_rounds" min="1" max="12" value="${c.rounds}"></label>
        <label>Début<input type="time" id="c_start" value="${esc(c.start)}"></label>
        <label>Match (min)<input type="number" id="c_match" min="5" max="60" value="${c.matchMin}"></label>
        <label>Pause (min)<input type="number" id="c_pause" min="0" max="30" value="${c.pauseMin}"></label></div>
        <label>Classement<select id="c_rank"><option value="wins" ${c.rankMode !== 'elo' ? 'selected' : ''}>Victoires, puis Elo, Buchholz, diff.</option><option value="elo" ${c.rankMode === 'elo' ? 'selected' : ''}>Points Elo d'abord</option></select></label>
        <button type="button" class="btn ghost" data-act="savecfg">Enregistrer les paramètres</button>
        <p class="muted small">${sc.map(x => `T${x.n} ${x.start}–${x.end}`).join(' · ')}</p></div>`;
    h += `<div class="card"><h3>Déroulement</h3>
      <p class="small">${state.teams.length} équipes · ${state.rounds.length}/${c.rounds} tours générés${r ? ` · tour ${r.n} : ${st.valid}/${st.total} scores validés${st.disputed ? `, <b style="color:var(--bad)">${st.disputed} contesté(s)</b>` : ''}` : ''}</p>
      <button type="button" class="btn" data-act="gen" ${canNext ? '' : 'disabled'}>Générer le tour ${nextN}</button>
      ${!canNext && r && st.valid < st.total ? '<p class="muted small">Tous les scores du tour en cours doivent être validés (tu peux les saisir ci-dessous).</p>' : ''}
      ${nextN > c.rounds ? `<button type="button" class="btn ghost" data-act="addround">Ajouter un tour (${c.rounds + 1})</button>` : ''}
      ${r ? `<button type="button" class="btn ghost" data-act="startclock">${r.startedAt ? 'Redémarrer' : 'Démarrer'} le chrono du tour ${r.n}</button>
      ${armBtn('undo', 'Annuler le tour ' + r.n, 'danger')}` : ''}</div>`;
    if (r) {
      const T = tById();
      h += `<div class="card"><h3>Scores du tour ${r.n}</h3><div class="list">${r.matches.map(m => {
        const res = resultFor(m), stt = res ? res.status : 'none';
        return `<div><div class="row between"><b>${t('terrain')} ${m.terrain}</b>${statusChip(res)}</div>
          <div class="grid2 small"><span>${teamLabel(T[m.a])} <span class="names">${teamNames(T[m.a], true)}</span></span><span>${teamLabel(T[m.b])} <span class="names">${teamNames(T[m.b], true)}</span></span>
          <input type="number" min="0" max="13" id="sa_${m.id}" value="${res ? res.sa : ''}" inputmode="numeric"><input type="number" min="0" max="13" id="sb_${m.id}" value="${res ? res.sb : ''}" inputmode="numeric"></div>
          <div class="row">${res && (stt === 'submitted' || stt === 'live' || stt === 'disputed') && !PL.validateScore(res.sa, res.sb) ? `<button type="button" class="btn sm" data-act="adminquick" data-id="${m.id}">Valider ${res.sa}:${res.sb}</button>` : ''}<button type="button" class="btn sm ghost" data-act="adminscore" data-id="${m.id}">Valider les cases</button></div></div>`;
      }).join('')}</div></div>`;
    }
    h += `<div class="card"><h3>Sauvegarde</h3><button type="button" class="btn ghost" data-act="export">Exporter les données (JSON)</button>
      ${armBtn('reset', 'Tout effacer (tours et scores)', 'danger')}</div>`;
    return h;
  }

  function aTeams() {
    const P = pById(), inTeam = new Set(state.teams.flatMap(x => x.p));
    const bench = state.players.filter(p => here(p) && !inTeam.has(p.id));
    const absentIn = state.teams.flatMap(x => x.p).filter(id => P[id] && !here(P[id]));
    const unpairedChosen = state.players.filter(p => p.mode === 'choisi' && here(p) && !state.pairs.some(x => x.a === p.id || x.b === p.id));
    const present = state.players.filter(here).length;
    const miss = state.players.filter(p => inscrit(p) && !here(p));
    const brokenPairs = state.pairs.filter(x => P[x.a] && P[x.b] && (here(P[x.a]) !== here(P[x.b])));
    let h = `<div class="card"><h3>Tirage des équipes</h3>
      <p class="small"><b>${present} joueurs arrivés</b> (seuls eux sont tirés au sort) · ${state.pairs.length} binômes choisis${present % 2 ? ' · nombre impair : une triplette sera formée' : ''}.</p>
      ${miss.length ? `<p class="small" style="color:var(--warn)"><b>Encore attendus (${miss.length}) :</b> ${miss.map(p => esc(pName(p))).join(', ')}</p>` : ''}
      ${brokenPairs.length ? `<p class="small" style="color:var(--bad)"><b>Binôme incomplet :</b> ${brokenPairs.map(x => `${esc(pName(P[x.a]))} + ${esc(pName(P[x.b]))}`).join(' ; ')}. Le joueur arrivé ira au tirage si son partenaire n'est pas là.</p>` : ''}
      ${unpairedChosen.length ? `<p class="small">« Je choisis » sans binôme (iront au tirage) : ${unpairedChosen.map(p => esc(pName(p))).join(', ')}</p>` : ''}
      ${state.rounds.length ? '<p class="small" style="color:var(--bad)">Le tournoi a commencé : refaire le tirage efface les tours et les scores.</p>' : ''}
      ${armBtn('draw', state.teams.length ? 'Refaire le tirage' : 'Tirer les équipes', '')}
      ${state.lastDraw ? `<p class="muted small">Dernier tirage : ${state.lastDraw.mixed}/${state.lastDraw.drawn} équipes tirées au sort sont inter-sociétés.</p>` : ''}</div>`;
    if (absentIn.length) h += `<div class="card" style="border-color:var(--bad)"><p class="small"><b>Absents encore dans une équipe :</b> ${absentIn.map(id => esc(pName(P[id]))).join(', ')}. Remplace-les avec le banc ci-dessous.</p></div>`;
    h += `<div class="card"><h3>Modifier les équipes</h3><p class="muted small">Touche un joueur, puis un autre pour les échanger. Touche un joueur du banc puis « + » sur une équipe pour l'ajouter (triplette). × renvoie un joueur sur le banc.</p>
      <div class="lbl">Banc (${bench.length})</div><div class="row">${bench.map(p => chip(p, true)).join('') || '<span class="muted small">vide</span>'}</div>
      <div class="list">${state.teams.map(x => `<div><div class="row between"><b>${teamLabel(x)}</b><span class="row">${x.chosen ? '<span class="chip soft">choisi</span>' : ''}<button type="button" class="btn sm ghost" data-act="addto" data-id="${x.id}" ${selChip && bench.some(p => p.id === selChip) ? '' : 'disabled'}>+</button>${armBtn('delteam_' + x.id, 'Suppr.', 'sm danger')}</span></div>
        <div class="row">${x.p.map(id => chip(P[id], false, x.id)).join('')}</div></div>`).join('')}</div>
      <button type="button" class="btn ghost" data-act="newteam" ${bench.length >= 2 ? '' : 'disabled'}>Créer une équipe avec 2 joueurs du banc</button></div>`;
    return h;
  }
  function chip(p, onBench, teamId) {
    if (!p) return '';
    const abs = !here(p);
    return `<span class="pchip ${selChip === p.id ? 'sel' : ''}" data-act="chip" data-id="${p.id}" role="button" tabindex="0" style="${abs ? 'text-decoration:line-through;border-color:var(--bad)' : ''}">${esc(pName(p))} <span class="muted small">${esc(p.co)}</span>${!onBench ? `<button type="button" class="x" data-act="tobench" data-id="${p.id}" data-team="${teamId}" aria-label="Retirer">×</button>` : ''}</span>`;
  }

  function ciBox() {
    const P = state.players.filter(inscrit);
    const ok = P.filter(here).length;
    return `<div class="row between"><b>${ok} arrivés / ${P.length} inscrits</b>
      <button type="button" class="pchip ${ciOnlyMissing ? 'sel' : ''}" data-act="cifilter">Encore attendus (${P.length - ok})</button></div>
      <p class="muted small">Seuls les joueurs arrivés (pointés) sont tirés au sort. Ils pointent eux-mêmes avec « Je suis là », ou tu les pointes ici avec le bouton « Arrivé ».</p>`;
  }
  function aPlayers() {
    const cos = [...new Set(state.players.map(p => p.co))].sort();
    const present = state.players.filter(here).length;
    return `<div class="card"><h3>Ajouter un joueur</h3><div class="grid2"><input type="text" id="np_first" placeholder="Prénom"><input type="text" id="np_last" placeholder="Nom"></div>
      <input type="text" id="np_co" placeholder="Société" list="cos"><datalist id="cos">${cos.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <select id="np_mode"><option value="tirage">Tirage au sort</option><option value="choisi">Je choisis</option></select>
      <button type="button" class="btn" data-act="addplayer">Ajouter</button></div>
      <div class="card"><h3>Participants (${present} arrivés / ${state.players.length})</h3>
      ${ciBox()}
      <div class="list">${state.players.filter(p => !ciOnlyMissing || (inscrit(p) && !here(p))).map(p => `<div class="row between"><span><b style="${inscrit(p) ? '' : 'text-decoration:line-through'}">${esc(pName(p))}</b> <span class="muted small">${esc(p.co)} · ${p.mode === 'choisi' ? 'choisit' : 'tirage'}</span></span>
        <span class="row">${inscrit(p) ? (here(p) ? `<button type="button" class="btn sm" style="background:var(--ok);border-color:var(--ok);color:#fff" data-act="acheckin" data-id="${p.id}" data-on="0">✓ Arrivé</button>` : `<button type="button" class="btn sm ghost" data-act="acheckin" data-id="${p.id}" data-on="1">Arrivé ?</button>`) : ''}<label class="small row"><input type="checkbox" data-act="present" data-id="${p.id}" ${inscrit(p) ? 'checked' : ''}> inscrit</label><button type="button" class="btn sm ghost" data-act="mode" data-id="${p.id}">⇄</button></span></div>`).join('')}</div></div>
      <div class="card"><h3>Pointage</h3>${armBtn('ciclear', 'Effacer tous les pointages', 'danger')}</div>
      <details class="card"><summary>Importer une liste</summary><p class="muted small">Une ligne par joueur : Prénom;Nom;Société;tirage|choisi</p><textarea id="imp"></textarea><button type="button" class="btn ghost" data-act="import">Importer</button></details>`;
  }
  function aPairs() {
    const P = pById(), used = new Set(state.pairs.flatMap(x => [x.a, x.b]));
    const opts = state.players.filter(p => !used.has(p.id) && inscrit(p)).sort((x, y) => (x.mode === 'choisi' ? 0 : 1) - (y.mode === 'choisi' ? 0 : 1) || pName(x).localeCompare(pName(y)))
      .map(p => `<option value="${p.id}">${esc(pName(p))} (${esc(p.co)}${p.mode === 'choisi' ? ', choisit' : ''})</option>`).join('');
    return `<div class="card"><h3>Binômes choisis</h3><p class="muted small">Saisis ici les réponses reçues sur Teams. Les binômes sont gardés tels quels au tirage.</p>
      <select id="pa">${opts}</select><select id="pb">${opts}</select><button type="button" class="btn" data-act="addpair">Ajouter le binôme</button>
      <div class="list">${state.pairs.map((x, i) => `<div class="row between"><span>${esc(pName(P[x.a]))} + ${esc(pName(P[x.b]))}</span><button type="button" class="btn sm danger" data-act="delpair" data-i="${i}">Retirer</button></div>`).join('')}</div></div>`;
  }
  function aTerr() {
    const surf = ['Gravier', 'Sable', 'Terre battue', 'Stabilisé', 'Gazon', 'Goudron'];
    return `<div class="card"><h3>Terrains</h3><p class="muted small">Type de surface et terrains disponibles. Les équipes tournent pour éviter de rejouer sur le même terrain ou la même surface.</p>
      <datalist id="surfs">${surf.map(s => `<option value="${s}">`).join('')}</datalist>
      <div class="list">${state.terrains.map((x, i) => `<div class="row"><b style="width:3ch">${x.n}</b><input type="text" id="ts_${i}" list="surfs" value="${esc(x.surface)}" placeholder="Surface" style="flex:1;min-width:0"><label class="small row"><input type="checkbox" id="ta_${i}" ${x.active !== false ? 'checked' : ''}> actif</label></div>`).join('')}</div>
      <div class="grid2"><button type="button" class="btn ghost" data-act="addterr">+ Terrain</button><button type="button" class="btn" data-act="saveterr">Enregistrer</button></div></div>`;
  }

  // ---------------- chrono ----------------
  function tick() {
    const c = state && state.cfg;
    document.querySelectorAll('[data-clock]').forEach(el => {
      const end = Number(el.dataset.clock) + c.matchMin * 60000, ms = end - Date.now();
      const s = Math.max(0, Math.round(ms / 1000));
      el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      el.classList.toggle('over', ms <= 0);
      const up = el.closest('.card') && el.closest('.card').querySelector('[data-timeup]');
      if (up) up.hidden = ms > 0;
    });
  }
  setInterval(tick, 1000);
  if (SCREEN) setInterval(() => render(), 30000);

  // ---------------- actions ----------------
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2600); }
  function showBanner(msg) { const b = $('#banner'); b.textContent = msg; b.hidden = false; }
  function hideBanner() { if (store && store.kind === 'demo') return; $('#banner').hidden = true; }
  const nextPid = () => 'P' + String(Math.max(0, ...state.players.map(p => parseInt(String(p.id).slice(1), 10) || 0)) + 1).padStart(2, '0');

  document.addEventListener('click', e => {
    if (e.target.closest('[data-lang]')) { lang = e.target.closest('[data-lang]').dataset.lang; ls.set('lang', lang); render(); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset.act === 'closesheet' && e.target.closest('[data-stop]') && !e.target.closest('button[data-act="closesheet"]')) return;
    const a = el.dataset.act, id = el.dataset.id;
    const H = actions[a];
    if (H) { e.preventDefault(); H(el, id); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'q') { searchQ = e.target.value; render(); return; }
    if (e.target.id === 'lq') { liveQ = e.target.value; render(); return; }
    if (e.target.id === 'ciq') { ciQ = e.target.value; render(); return; }
    const el = e.target;
    if (el.dataset && el.dataset.score) {
      // saisie directe du score : on met à jour le brouillon sans redessiner (garde le curseur)
      const d = draft[el.dataset.score]; if (!d) return;
      const n = parseInt(el.value, 10);
      d[el.dataset.k] = Number.isNaN(n) ? 0 : Math.min(13, Math.max(0, n));
      if (el.value !== '' && String(d[el.dataset.k]) !== el.value) el.value = d[el.dataset.k];
      scheduleLive(el.dataset.score);
    }
  });
  document.addEventListener('focusin', e => { if (e.target.dataset && e.target.dataset.score) { try { e.target.select(); } catch (x) { } } });
  document.addEventListener('change', e => { const el = e.target; if (el.dataset && el.dataset.act === 'present') actions.present(el, el.dataset.id); });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pchip') && e.target.dataset.act === 'chip') { e.preventDefault(); actions.chip(e.target, e.target.dataset.id); } if (e.key === 'Enter' && e.target.id === 'pin') actions.login(); if (e.key === 'Enter' && e.target.matches && e.target.matches('tr.click')) actions.sheet(e.target, e.target.dataset.id); });

  const val = id => (document.getElementById(id) || {}).value;
  const liveTimers = {};
  // envoi automatique du score en direct, 1 s après la dernière modification
  function scheduleLive(id) { clearTimeout(liveTimers[id]); liveTimers[id] = setTimeout(() => actions.live(null, id), 1000); }
  const actions = {
    view(el) { view = el.dataset.v; ls.set('view', view === 'admin' ? 'rules' : view); window.scrollTo(0, 0); render(); },
    pick(el, id) { myTeam = id; ls.set('team', id); searchQ = ''; render(); },
    unpick() { myTeam = null; ls.set('team', null); ls.set('me', null); render(); },
    step(el, id) { const d = draft[id]; d[el.dataset.k] = Math.min(13, Math.max(0, d[el.dataset.k] + Number(el.dataset.d))); render(); scheduleLive(id); },
    editscore(el, id) { editing[id] = true; render(); },
    send(el, id) {
      const r = curRound(), m = r.matches.find(x => x.id === id), d = draft[id];
      const mineA = m.a === myTeam, sa = mineA ? d.me : d.them, sb = mineA ? d.them : d.me;
      const err = PL.validateScore(sa, sb);
      if (err) { toast(err === 'tie' ? t('eTie') : t('eRange')); return; }
      editing[id] = false; clearTimeout(liveTimers[id]);
      store.setResult(id, { a: m.a, b: m.b, sa, sb, by: myTeam, status: 'submitted', at: Date.now() }).then(() => toast(t('saved')));
    },
    live(el, id) {
      const r = curRound(), m = r && r.matches.find(x => x.id === id), d = draft[id];
      if (!m || !d) return;
      const cur = results[id];
      if (cur && cur.a === m.a && cur.status && cur.status !== 'live') return; // déjà envoyé / validé : on ne revient pas en direct
      const mineA = m.a === myTeam, sa = mineA ? d.me : d.them, sb = mineA ? d.them : d.me;
      if (!(sa >= 0 && sb >= 0 && sa <= 13 && sb <= 13)) { toast(t('eRange')); return; }
      const at = Date.now(); d.src = at;
      store.setResult(id, { a: m.a, b: m.b, sa, sb, by: myTeam, status: 'live', at });
    },
    livesort(el) { liveSort = el.dataset.k; render(); },
    checkin(el, id) {
      const on = el.dataset.on === '1';
      if (on && !ls.get('me')) ls.set('me', id);
      store.setCheckin(id, on).then(() => { if (on) { ciQ = ''; toast(t('ciDone')); } render(); });
    },
    acheckin(el, id) { store.setCheckin(id, el.dataset.on === '1'); },
    ciclear() { store.clearCheckins().then(() => toast('Pointages effacés')); },
    cifilter() { ciOnlyMissing = !ciOnlyMissing; render(); },
    adminquick(el, id) {
      const r = results[id];
      store.setResult(id, Object.assign({}, r, { status: 'validated', confirmedBy: 'admin', at: Date.now() })).then(() => toast(t('saved')));
    },
    confirm(el, id) { const r = results[id]; store.setResult(id, Object.assign({}, r, { status: 'validated', confirmedBy: myTeam, at: Date.now() })).then(() => toast(t('validated'))); },
    contest(el, id) { const r = results[id]; delete draft[id]; store.setResult(id, Object.assign({}, r, { status: 'disputed', disputedBy: myTeam, at: Date.now() })); },
    roundview(el) { roundView = Number(el.dataset.n); render(); },
    sheet(el, id) { sheetTeam = id; renderSheet(); },
    closesheet() { sheetTeam = null; renderSheet(); },
    login() { if (val('pin') === String(CFG.adminPin || '')) { isAdmin = true; ls.set('admin', '1'); render(); } else toast(t('badPin')); },
    logout() { isAdmin = false; ls.set('admin', null); view = 'rules'; render(); },
    atab(el) { adminTab = el.dataset.k; ls.set('atab', adminTab); selChip = null; render(); },
    arm(el) {
      const k = el.dataset.key;
      if (!armed[k]) { armed[k] = true; render(); setTimeout(() => { if (armed[k]) { delete armed[k]; render(); } }, 4000); return; }
      delete armed[k];
      if (k === 'draw') return doDraw();
      if (k === 'ciclear') return actions.ciclear();
      if (k === 'undo') return save(s => { s.rounds.pop(); s.phase = s.rounds.length ? 'running' : 'setup'; });
      if (k === 'reset') return save(s => { s.rounds = []; s.phase = 'setup'; }).then(() => store.clearResults());
      if (k.startsWith('delteam_')) { const tid = k.slice(8); return save(s => { s.teams = s.teams.filter(x => x.id !== tid); }); }
    },
    savecfg() {
      const c = { rounds: +val('c_rounds') || 5, start: val('c_start') || '17:15', matchMin: +val('c_match') || 20, pauseMin: +val('c_pause') || 0, rankMode: val('c_rank') };
      save(s => { s.cfg = c; }).then(() => toast(t('saved')));
    },
    addround() { save(s => { s.cfg.rounds += 1; }); },
    gen() {
      try {
        const seed = Date.now();
        const pr = PL.pairRound(state, results, seed);
        const ms = PL.assignTerrains(pr.pairs, state, results, seed);
        save(s => {
          s.gen = (s.gen || 0) + 1; const n = s.rounds.length + 1;
          s.rounds.push({ n, gen: s.gen, bye: pr.bye || null, startedAt: null, matches: ms.map(m => ({ id: `r${n}g${s.gen}t${m.terrain}`, a: m.a, b: m.b, terrain: m.terrain })) });
          s.phase = 'running';
        }).then(() => toast(`Tour généré${pr.rematches ? ' (attention : ' + pr.rematches + ' revanche(s) inévitable(s))' : ''}`));
      } catch (e) { toast(e.message === 'terrains' ? 'Pas assez de terrains actifs' : 'Erreur : ' + e.message); }
    },
    startclock() { save(s => { s.rounds[s.rounds.length - 1].startedAt = Date.now(); }); },
    adminscore(el, id) {
      const r = curRound(), m = r.matches.find(x => x.id === id);
      const sa = parseInt(val('sa_' + id), 10), sb = parseInt(val('sb_' + id), 10);
      const err = PL.validateScore(sa, sb);
      if (err) { toast(err === 'tie' ? t('eTie') : t('eRange')); return; }
      store.setResult(id, { a: m.a, b: m.b, sa, sb, by: 'admin', status: 'validated', at: Date.now() }).then(() => toast(t('saved')));
    },
    export() {
      const blob = new Blob([JSON.stringify({ state, results }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'petanque-2026-' + new Date().toISOString().slice(0, 16).replace(':', 'h') + '.json'; a.click();
    },
    chip(el, id) {
      if (!selChip) { selChip = id; render(); return; }
      if (selChip === id) { selChip = null; render(); return; }
      const a = selChip, b = id; selChip = null;
      save(s => {
        const ta = s.teams.find(x => x.p.includes(a)), tb = s.teams.find(x => x.p.includes(b));
        if (ta) ta.p = ta.p.map(x => x === a ? b : x === b ? a : x);
        if (tb && tb !== ta) tb.p = tb.p.map(x => x === b ? a : x);
        if (ta && tb && ta !== tb) { ta.chosen = false; tb.chosen = false; }
      });
    },
    tobench(el, id) { const tid = el.dataset.team; save(s => { const x = s.teams.find(y => y.id === tid); if (x) x.p = x.p.filter(p => p !== id); }); },
    addto(el, tid) { const pid = selChip; selChip = null; save(s => { const x = s.teams.find(y => y.id === tid); if (x && !x.p.includes(pid)) x.p.push(pid); }); },
    newteam() {
      const inTeam = new Set(state.teams.flatMap(x => x.p));
      const bench = state.players.filter(p => here(p) && !inTeam.has(p.id)).slice(0, 2);
      save(s => { const num = Math.max(0, ...s.teams.map(x => x.num)) + 1; s.teams.push({ id: 'T' + String(num).padStart(2, '0'), num, p: bench.map(p => p.id), chosen: false }); });
    },
    addplayer() {
      const first = (val('np_first') || '').trim(), last = (val('np_last') || '').trim();
      if (!first && !last) return;
      save(s => { s.players.push({ id: nextPid(), first, last, co: (val('np_co') || '').trim() || '?', mode: val('np_mode') || 'tirage', present: true }); })
        .then(() => { ['np_first', 'np_last'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; }); toast(t('saved')); });
    },
    present(el, id) { const v = el.checked; save(s => { const p = s.players.find(x => x.id === id); if (p) p.present = v; }); },
    mode(el, id) { save(s => { const p = s.players.find(x => x.id === id); if (p) p.mode = p.mode === 'choisi' ? 'tirage' : 'choisi'; }); },
    import() {
      const lines = (val('imp') || '').split(/\r?\n/).map(l => l.split(/[;\t,]/).map(x => x.trim())).filter(x => x.length >= 2 && (x[0] || x[1]));
      save(s => { lines.forEach(([first, last, co, mode]) => { const n = Math.max(0, ...s.players.map(p => parseInt(String(p.id).slice(1), 10) || 0)) + 1; s.players.push({ id: 'P' + String(n).padStart(2, '0'), first, last, co: co || '?', mode: /chois/i.test(mode || '') ? 'choisi' : 'tirage', present: true }); }); })
        .then(() => toast(lines.length + ' joueurs importés'));
    },
    addpair() { const a = val('pa'), b = val('pb'); if (!a || !b || a === b) { toast('Choisis deux joueurs différents'); return; } save(s => { s.pairs.push({ a, b }); }); },
    delpair(el) { const i = Number(el.dataset.i); save(s => { s.pairs.splice(i, 1); }); },
    addterr() { save(s => { s.terrains.push({ n: Math.max(0, ...s.terrains.map(x => x.n)) + 1, surface: '', active: true }); }); },
    saveterr() { save(s => { s.terrains.forEach((x, i) => { x.surface = (val('ts_' + i) || '').trim(); const c = document.getElementById('ta_' + i); x.active = c ? c.checked : true; }); }).then(() => toast(t('saved'))); }
  };

  function doDraw() {
    const arrived = state.players.map(p => Object.assign({}, p, { present: here(p) }));
    if (!arrived.some(p => p.present)) { toast('Personne n\'a encore pointé : rien à tirer'); return; }
    const d = PL.drawTeams(arrived, state.pairs, Date.now());
    const hadRounds = state.rounds.length > 0;
    save(s => { s.teams = d.teams; s.rounds = []; s.phase = 'setup'; s.lastDraw = d.stats; })
      .then(() => { if (hadRounds) store.clearResults(); toast(`${d.teams.length} équipes · ${d.stats.mixed}/${d.stats.drawn} inter-sociétés`); });
  }
})();
