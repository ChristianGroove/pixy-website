/**
 * PÁGINAS DE SPACES (generadas por tools/pages/build-pages.mjs)
 * - Catálogo: un modelo 3D en cromo, fijo a la derecha, que cambia al Space que se está leyendo.
 * - Planes: el nivel elegido resalta su columna en la comparación.
 * - Listas numeradas: el punto que cruza el centro se enciende (como en la portada).
 * - Formularios: el sitio no tiene servidor, así que se abre el correo con el mensaje listo.
 */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lang = function () { return (window.pixyI18n && window.pixyI18n.getCurrentLang()) || 'es'; };
    var warp = function (p) { if (window.pixySpace) window.pixySpace.warp(p); };

    // --- Listas numeradas ----------------------------------------------------------------------
    if ('IntersectionObserver' in window) {
        var lit = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
        }, { rootMargin: '-40% 0px -40% 0px' });
        document.querySelectorAll('.sh-list li').forEach(function (li) { lit.observe(li); });
    }

    // --- Modelo 3D en cromo (catálogo y ficha de Space) -------------------------------------------
    var host = document.querySelector('.sp-model');
    if (host && !window.matchMedia('(max-width: 900px)').matches) {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.sp-block'));
        var first = blocks[0] || host;
        var model = null;
        var current = { slug: first.dataset.model, accent: first.dataset.accent };

        var start = function () { model = window.pixyModels.mount(host, current); };
        var load = function () {
            if (window.pixyModels) return start();
            window.addEventListener('pixy:models-ready', start, { once: true });
            var s = document.createElement('script');
            s.src = 'js/space-models.js';
            s.async = true;
            document.body.appendChild(s);
        };
        if ('IntersectionObserver' in window) {
            var near = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { near.disconnect(); load(); } }, { rootMargin: '100% 0px' });
            near.observe(host);
        } else {
            load();
        }

        // El bloque que cruza el centro de la pantalla decide qué modelo se ve
        if (blocks.length && 'IntersectionObserver' in window) {
            var pick = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (!e.isIntersecting) return;
                    var b = e.target;
                    blocks.forEach(function (o) { o.classList.toggle('is-on', o === b); });
                    if (b.dataset.model === current.slug) return;
                    current = { slug: b.dataset.model, accent: b.dataset.accent };
                    if (model) model.set(current.slug, current.accent);
                    warp('hop');
                });
            }, { rootMargin: '-45% 0px -45% 0px' });
            blocks.forEach(function (b) { pick.observe(b); });
        }
    }

    // --- Planes: el nivel elegido resalta su columna ------------------------------------------------
    var levels = document.querySelectorAll('.sp-levels .sh-plan');
    var table = document.querySelector('.sp-table');
    levels.forEach(function (btn) {
        btn.addEventListener('click', function () {
            levels.forEach(function (o) { o.classList.toggle('is-active', o === btn); o.setAttribute('aria-selected', o === btn ? 'true' : 'false'); });
            if (table) table.dataset.level = btn.dataset.level;
            warp('nudge');
        });
    });

    // --- Formularios: abren el correo con el mensaje armado ------------------------------------------
    document.querySelectorAll('.sp-form').forEach(function (form) {
        // Un parámetro de la URL con el nombre de un campo lo preselecciona (?space=resto, ?paquete=debut)
        var params = new URLSearchParams(location.search);
        form.querySelectorAll('select[name]').forEach(function (sel) {
            var v = params.get(sel.name);
            if (v && sel.querySelector('option[value="' + v + '"]')) sel.value = v;
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.reportValidity()) return;
            var d = new FormData(form);
            var lines = [];
            d.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ': ' + v); });
            var subject = form.dataset[lang() === 'en' ? 'subjectEn' : 'subjectEs'];
            location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
            warp('departure');
        });
    });

    if (reduce) document.querySelectorAll('.sh-list li').forEach(function (li) { li.classList.add('is-on'); });
})();
