/* Pétanque 2026 — logique pure (tirage, système suisse, Elo, terrains). Testable sous Node. */
(function (root) {
  'use strict';

  // ---------- utilitaires ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Société normalisée : « Retraité CPA » -> cpa, « Nivalis Group » -> nivalis
  function normCo(co) {
    return String(co || '?').toLowerCase()
      .replace(/retrait[ée]e?s?/g, '').replace(/\bgroup(e)?\b/g, '').replace(/\bsa\b/g, '')
      .replace(/\s+/g, ' ').trim() || '?';
  }

  // ---------- composition des équipes ----------
  // players: [{id, co, mode:'tirage'|'choisi', present}] ; pairs: [[idA,idB]]
  // Retourne {teams:[{id,num,p:[id,id]}], leftover:[ids non appariés], stats}
  function drawTeams(players, pairs, seed) {
    const rng = mulberry32(seed || Date.now());
    const present = players.filter(p => p.present !== false);
    const byId = Object.fromEntries(present.map(p => [p.id, p]));
    const used = new Set();
    const teams = [];
    (pairs || []).forEach(x => {
      const [a, b] = Array.isArray(x) ? x : [x.a, x.b];
      if (byId[a] && byId[b] && !used.has(a) && !used.has(b) && a !== b) {
        used.add(a); used.add(b); teams.push({ p: [a, b], chosen: true });
      }
    });
    let pool = shuffle(present.filter(p => !used.has(p.id)), rng);
    // Greedy : on prend toujours un joueur de la société la plus représentée restante
    // et on l'associe à un joueur d'une autre société (tiré au hasard, pondéré par la taille du groupe).
    while (pool.length >= 2) {
      const groups = {};
      pool.forEach(p => { (groups[normCo(p.co)] = groups[normCo(p.co)] || []).push(p); });
      const keys = Object.keys(groups).sort((x, y) => groups[y].length - groups[x].length || (rng() - 0.5));
      const big = keys[0];
      const a = groups[big][0];
      const others = pool.filter(p => normCo(p.co) !== big);
      let b;
      if (others.length) {
        // pondération : favorise les sociétés encore nombreuses pour ne pas épuiser les petites trop tôt
        const w = others.map(p => groups[normCo(p.co)].length);
        let r = rng() * w.reduce((s, x) => s + x, 0);
        b = others[others.length - 1];
        for (let i = 0; i < others.length; i++) { r -= w[i]; if (r <= 0) { b = others[i]; break; } }
      } else {
        b = groups[big][1];
      }
      teams.push({ p: [a.id, b.id], chosen: false });
      pool = pool.filter(p => p !== a && p !== b);
    }
    // Joueur restant (nombre impair) : il rejoint une équipe tirée au sort pour former une triplette
    // (en triplette chaque joueur a 2 boules : 6 boules par équipe, comme une doublette).
    if (pool.length === 1) {
      const x = pool[0];
      const cands = teams.filter(t => !t.chosen && t.p.every(id => normCo(byId[id].co) !== normCo(x.co)));
      const host = (cands.length ? cands : teams.filter(t => !t.chosen))[Math.floor(rng() * (cands.length || teams.filter(t => !t.chosen).length))];
      if (host) { host.p.push(x.id); pool = []; }
    }
    const ordered = shuffle(teams, rng).map((t, i) => ({ id: 'T' + String(i + 1).padStart(2, '0'), num: i + 1, p: t.p, chosen: t.chosen }));
    const mixed = ordered.filter(t => !t.chosen && normCo(byId[t.p[0]].co) !== normCo(byId[t.p[1]].co)).length;
    return { teams: ordered, leftover: pool.map(p => p.id), stats: { mixed, drawn: ordered.filter(t => !t.chosen).length, chosen: ordered.filter(t => t.chosen).length } };
  }

  // ---------- validation d'un score ----------
  // Règle : partie en 13 points ou au temps. Pas d'égalité (mène décisive).
  function validateScore(sa, sb) {
    if (!Number.isInteger(sa) || !Number.isInteger(sb)) return 'int';
    if (sa < 0 || sb < 0 || sa > 13 || sb > 13) return 'range';
    if (sa === sb) return 'tie';
    if (sa === 13 && sb === 13) return 'tie';
    return null;
  }

  // ---------- classement ----------
  const ELO0 = 1000, KBASE = 40;
  // state.rounds: [{n, matches:[{id,a,b,terrain}], bye}] ; results: {matchId: {sa,sb,status}}
  function computeStandings(state, results) {
    const S = {};
    (state.teams || []).forEach(t => {
      S[t.id] = { id: t.id, num: t.num, w: 0, l: 0, pf: 0, pa: 0, elo: ELO0, buch: 0, opps: [], terrains: [], surfaces: [], hist: [], bye: 0 };
    });
    const surfaceOf = {};
    (state.terrains || []).forEach(t => { surfaceOf[t.n] = t.surface; });
    (state.rounds || []).forEach(r => {
      const pre = {};
      Object.values(S).forEach(s => { pre[s.id] = s.elo; });
      r.matches.forEach(m => {
        const A = S[m.a], B = S[m.b];
        if (!A || !B) return;
        A.opps.push(m.b); B.opps.push(m.a);
        A.terrains.push(m.terrain); B.terrains.push(m.terrain);
        A.surfaces.push(surfaceOf[m.terrain] || ''); B.surfaces.push(surfaceOf[m.terrain] || '');
        const res = results[m.id];
        const done = res && res.status === 'validated' && res.a === m.a && res.b === m.b && !validateScore(res.sa, res.sb);
        if (!done) {
          A.hist.push({ round: r.n, opp: m.b, terrain: m.terrain, pending: true, matchId: m.id });
          B.hist.push({ round: r.n, opp: m.a, terrain: m.terrain, pending: true, matchId: m.id });
          return;
        }
        const aWin = res.sa > res.sb;
        A.pf += res.sa; A.pa += res.sb; B.pf += res.sb; B.pa += res.sa;
        if (aWin) { A.w++; B.l++; } else { B.w++; A.l++; }
        // Elo avec bonus d'écart : battre une équipe mieux classée rapporte plus
        const ea = 1 / (1 + Math.pow(10, (pre[m.b] - pre[m.a]) / 400));
        const k = KBASE * (1 + 0.5 * Math.abs(res.sa - res.sb) / 13);
        const delta = k * ((aWin ? 1 : 0) - ea);
        A.elo += delta; B.elo -= delta;
        A.hist.push({ round: r.n, opp: m.b, terrain: m.terrain, me: res.sa, them: res.sb, win: aWin, d: delta, matchId: m.id });
        B.hist.push({ round: r.n, opp: m.a, terrain: m.terrain, me: res.sb, them: res.sa, win: !aWin, d: -delta, matchId: m.id });
      });
      if (r.bye && S[r.bye]) {
        const s = S[r.bye]; s.w++; s.pf += 13; s.pa += 7; s.bye++;
        s.hist.push({ round: r.n, bye: true, me: 13, them: 7, win: true, d: 0 });
      }
    });
    Object.values(S).forEach(s => { s.buch = s.opps.reduce((sum, o) => sum + (S[o] ? S[o].w : 0), 0); s.diff = s.pf - s.pa; });
    return S;
  }

  // mode 'wins' : victoires > Elo > Buchholz > diff ; mode 'elo' : Elo > victoires > diff
  function rank(S, mode) {
    const arr = Object.values(S);
    arr.sort(mode === 'elo'
      ? (x, y) => y.elo - x.elo || y.w - x.w || y.diff - x.diff || x.num - y.num
      : (x, y) => y.w - x.w || y.elo - x.elo || y.buch - x.buch || y.diff - x.diff || x.num - y.num);
    arr.forEach((s, i) => { s.rank = i + 1; });
    return arr;
  }

  // ---------- appariement (système suisse) ----------
  function teamCos(team, playersById) { return new Set(team.p.map(id => normCo((playersById[id] || {}).co))); }

  function pairCost(a, b, S, cos) {
    const A = S[a], B = S[b];
    let c = 0;
    if (A.opps.includes(b)) c += 1e6;                    // jamais de revanche
    const dw = A.w - B.w; c += 1000 * dw * dw;           // même nombre de victoires
    c += 0.08 * Math.abs(A.elo - B.elo);                 // puis niveau Elo proche
    let shared = 0; cos[a].forEach(x => { if (cos[b].has(x)) shared++; });
    c += 25 * shared;                                    // mélange des sociétés entre adversaires
    return c;
  }

  // Retourne {pairs:[[a,b]], bye, cost}
  function pairRound(state, results, seed, opts) {
    const rng = mulberry32(seed || Date.now());
    const S = computeStandings(state, results);
    const playersById = Object.fromEntries((state.players || []).map(p => [p.id, p]));
    const active = (state.teams || []).filter(t => !t.out).map(t => t.id);
    const cos = {}; (state.teams || []).forEach(t => { cos[t.id] = teamCos(t, playersById); });
    let ids = active.slice();
    let bye = null;
    if (ids.length % 2 === 1) {
      const ranked = rank(S, 'wins').filter(s => ids.includes(s.id));
      const cand = ranked.slice().reverse().find(s => s.bye === 0) || ranked[ranked.length - 1];
      bye = cand.id; ids = ids.filter(x => x !== bye);
    }
    const cost = (a, b) => pairCost(a, b, S, cos);
    const total = P => P.reduce((s, [a, b]) => s + cost(a, b), 0);
    let best = null, bestCost = Infinity;
    const restarts = (opts && opts.restarts) || 60;
    for (let r = 0; r < restarts; r++) {
      // ordre : meilleurs d'abord, bruit pour diversifier
      const order = ids.slice().sort((x, y) => (S[y].w - S[x].w) || (S[y].elo - S[x].elo) + (rng() - 0.5) * 40);
      const free = new Set(order);
      const P = [];
      for (const a of order) {
        if (!free.has(a)) continue;
        free.delete(a);
        let bestB = null, bc = Infinity;
        free.forEach(b => { const c = cost(a, b) + rng() * 10; if (c < bc) { bc = c; bestB = b; } });
        free.delete(bestB); P.push([a, bestB]);
      }
      // amélioration locale par échange de partenaires
      let improved = true, guard = 0;
      while (improved && guard++ < 50) {
        improved = false;
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
          const [a, b] = P[i], [c, d] = P[j];
          const cur = cost(a, b) + cost(c, d);
          const o1 = cost(a, c) + cost(b, d), o2 = cost(a, d) + cost(b, c);
          if (o1 < cur - 1e-9 && o1 <= o2) { P[i] = [a, c]; P[j] = [b, d]; improved = true; }
          else if (o2 < cur - 1e-9) { P[i] = [a, d]; P[j] = [b, c]; improved = true; }
        }
      }
      const tc = total(P);
      if (tc < bestCost) { bestCost = tc; best = P; }
    }
    // tri : les matchs des équipes de tête d'abord
    best.sort((x, y) => Math.max(S[y[0]].w, S[y[1]].w) - Math.max(S[x[0]].w, S[x[1]].w));
    return { pairs: best, bye, cost: bestCost, rematches: best.filter(([a, b]) => S[a].opps.includes(b)).length };
  }

  // ---------- attribution des terrains ----------
  // Évite de rejouer sur le même terrain et fait tourner les surfaces.
  function assignTerrains(pairs, state, results, seed) {
    const rng = mulberry32((seed || Date.now()) ^ 0x9e3779b9);
    const S = computeStandings(state, results);
    const terr = (state.terrains || []).filter(t => t.active !== false);
    if (terr.length < pairs.length) throw new Error('terrains');
    const cost = (pair, t) => {
      let c = 0;
      pair.forEach(id => {
        const s = S[id];
        c += 100 * s.terrains.filter(x => x === t.n).length;
        c += 10 * s.surfaces.filter(x => x && x === t.surface).length;
        if (s.surfaces.length && s.surfaces[s.surfaces.length - 1] === t.surface && t.surface) c += 15;
      });
      return c;
    };
    let best = null, bestC = Infinity;
    for (let r = 0; r < 40; r++) {
      const order = shuffle(pairs.map((p, i) => i), rng);
      const free = new Set(terr.map((t, i) => i));
      const asg = new Array(pairs.length);
      order.forEach(i => {
        let bt = null, bc = Infinity;
        free.forEach(ti => { const c = cost(pairs[i], terr[ti]) + rng(); if (c < bc) { bc = c; bt = ti; } });
        free.delete(bt); asg[i] = bt;
      });
      let tc = asg.reduce((s, ti, i) => s + cost(pairs[i], terr[ti]), 0);
      if (tc < bestC) { bestC = tc; best = asg.slice(); }
    }
    return pairs.map((p, i) => ({ a: p[0], b: p[1], terrain: terr[best[i]].n }))
      .sort((x, y) => x.terrain - y.terrain);
  }

  // ---------- planning ----------
  function schedule(cfg, nRounds) {
    const [h, m] = String(cfg.start || '17:15').split(':').map(Number);
    const base = h * 60 + m, out = [];
    for (let i = 0; i < nRounds; i++) {
      const s = base + i * (cfg.matchMin + cfg.pauseMin), e = s + cfg.matchMin;
      const f = x => String(Math.floor(x / 60)).padStart(2, '0') + 'h' + String(x % 60).padStart(2, '0');
      out.push({ n: i + 1, start: f(s), end: f(e) });
    }
    return out;
  }

  const API = { mulberry32, shuffle, normCo, drawTeams, validateScore, computeStandings, rank, pairRound, assignTerrains, schedule, ELO0 };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.PL = API;
})(typeof self !== 'undefined' ? self : this);
