// guide.inphox.net: the index drawer (phones), search over /search.json, the section you are reading marked in "On this
// page", and Copy buttons. No libraries; every part fails quietly (the page reads fine without it).
(function () {
  'use strict';
  var body = document.body;

  // the index drawer on phones: Menu opens it, a tap outside, Escape or a link closes it
  var menu = document.querySelector('.g-menu');
  var side = document.getElementById('g-side');
  function setOpen(open) { body.classList.toggle('g-open', open); if (menu) menu.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  if (menu && side) {
    menu.addEventListener('click', function () { setOpen(!body.classList.contains('g-open')); });
    document.addEventListener('click', function (e) {
      if (body.classList.contains('g-open') && !side.contains(e.target) && e.target !== menu) setOpen(false);
    });
    side.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    // pull the drawer left to close it (rule 16: popups follow the finger)
    var x0 = null;
    side.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    side.addEventListener('touchend', function (e) {
      if (x0 !== null && x0 - e.changedTouches[0].clientX > 60) setOpen(false);
      x0 = null;
    }, { passive: true });
  }

  // search: titles first, then section headings, then the text
  var input = document.getElementById('g-q');
  var list = document.getElementById('g-results');
  var index = null, loading = null, picked = -1;
  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch('/search.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
      .then(function (j) { index = j; return j; }).catch(function () { loading = null; return []; });
    return loading;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function search(q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var hits = [];
    index.forEach(function (p) {
      var title = p.title.toLowerCase(), text = (p.summary + ' ' + p.text).toLowerCase();
      var all = words.every(function (w) { return title.indexOf(w) >= 0 || text.indexOf(w) >= 0 || p.sections.some(function (s) { return s.title.toLowerCase().indexOf(w) >= 0; }); });
      if (!all) return;
      var score = words.reduce(function (n, w) { return n + (title.indexOf(w) >= 0 ? 10 : 0) + (text.split(w).length - 1); }, 0);
      hits.push({ href: '/' + p.slug + '/', title: p.title, where: p.group, score: score + 5 });
      p.sections.forEach(function (s) {
        var st = s.title.toLowerCase();
        if (words.some(function (w) { return st.indexOf(w) >= 0; })) hits.push({ href: '/' + p.slug + '/#' + s.id, title: s.title, where: p.title, score: score + 8 });
      });
    });
    return hits.sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
  }
  function show(hits, q) {
    picked = -1;
    if (!q) { list.hidden = true; list.innerHTML = ''; return; }
    list.innerHTML = hits.length
      ? hits.map(function (h, i) { return '<li><a id="g-r' + i + '" href="' + h.href + '">' + esc(h.title) + '<small>' + esc(h.where) + '</small></a></li>'; }).join('')
      : '<li><a href="/report-an-issue/">Nothing found for “' + esc(q) + '”<small>Tell us what you were looking for</small></a></li>';
    list.hidden = false;
  }
  if (input && list) {
    input.addEventListener('focus', load);
    input.addEventListener('input', function () { var q = input.value.trim(); load().then(function () { show(search(q), q); }); });
    input.addEventListener('keydown', function (e) {
      var links = list.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!links.length) return;
        e.preventDefault();
        picked = (picked + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length;
        links.forEach(function (a, i) { a.setAttribute('aria-selected', i === picked ? 'true' : 'false'); });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var a = links[picked >= 0 ? picked : 0];
        if (a) location.href = a.getAttribute('href');
      } else if (e.key === 'Escape') { show([], ''); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.g-search')) show([], ''); });
    var q0 = new URLSearchParams(location.search).get('q');
    if (q0) { input.value = q0; load().then(function () { show(search(q0), q0); }); }
  }

  // "On this page": mark the section being read
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.g-toc-side a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && byId[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('is-here'); });
          byId[en.target.id].classList.add('is-here');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('.g-body h2[id]').forEach(function (h) { obs.observe(h); });
  }

  // Copy buttons (support's email and any code on a page)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.g-copy');
    if (!b) return;
    var v = b.getAttribute('data-copy');
    function done(ok) { var t = b.textContent; b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(function () { b.textContent = t; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
})();
