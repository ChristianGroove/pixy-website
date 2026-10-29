/**
 * PÁGINAS DE SPACES (generadas por tools/pages/build-pages.mjs)
 * - Catálogo: un modelo 3D en cromo, fijo a la derecha, que cambia al Space que se está leyendo.
 * - Precios: Space, pago mensual o anual, columna del nivel en la comparación y calculadora de Edu.
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
            s.src = 'js/space-models.js?v=754bbf80db';
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

    // --- Precios: Space, pago mensual o anual, nivel en la comparación y calculadora de Edu ------------
    // Las cifras vienen de content/pricing.json, embebidas en #pixy-pricing por el generador
    var dataEl = document.getElementById('pixy-pricing');
    if (dataEl) {
        var P = JSON.parse(dataEl.textContent);
        var q = new URLSearchParams(location.search);
        var state = { space: P.spaces[q.get('space')] ? q.get('space') : null, billing: q.get('billing') === 'annual' ? 'y' : 'm' };
        var fmt = function (n) {
            var en = lang() === 'en';
            var parts = String(n).split('.');
            var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : '.');
            return parts[1] ? int + (en ? '.' : ',') + (parts[1] + '0').slice(0, 2) : int;
        };
        var yearly = function (p) { return Math.round(p * P.annualMonths / 12); };
        var scopes = document.querySelectorAll('.pr-scope');
        var pressed = function (list, fn) { list.forEach(function (b) { b.setAttribute('aria-pressed', fn(b) ? 'true' : 'false'); }); };

        var calc = function (sc) {
            var box = sc.querySelector('[data-calc]');
            if (!box) return;
            var edu = P.spaces.edu;
            var n = Math.max(1, Math.round(+box.querySelector('input').value || 1));
            var i = 0;
            while (i < edu.students.length - 1 && edu.students[i] < n) i++;
            var extra = Math.max(0, Math.ceil((n - edu.students[i]) / 100));
            var base = state.billing === 'y' ? yearly(edu.prices[i]) : edu.prices[i];
            var t = P.calc[lang() === 'en' ? 'en' : 'es'];
            box.querySelector('[data-calc-level]').textContent = P.names[lang() === 'en' ? 'en' : 'es'][i];
            box.querySelector('[data-calc-price]').textContent = fmt(base + extra * edu.extraStudents100);
            box.querySelector('[data-calc-note]').textContent = (extra ? t.extra : t.inc)
                .replace('{n}', fmt(edu.students[i])).replace('{k}', extra).replace('{x}', fmt(extra * edu.extraStudents100));
        };

        var render = function () {
            scopes.forEach(function (sc) {
                var sp = sc.hasAttribute('data-fixed') ? sc.dataset.space : (state.space || sc.dataset.space);
                var prices = P.spaces[sp].prices;
                sc.dataset.space = sp;
                sc.dataset.billing = state.billing;
                sc.querySelectorAll('[data-amount]').forEach(function (el) {
                    var p = prices[+el.dataset.amount];
                    el.textContent = fmt(state.billing === 'y' ? yearly(p) : p);
                });
                sc.querySelectorAll('[data-total]').forEach(function (el) { el.textContent = fmt(prices[+el.dataset.total] * P.annualMonths); });
                sc.querySelectorAll('[data-includes]').forEach(function (el) { el.hidden = el.dataset.includes !== sp; });
                pressed(sc.querySelectorAll('[data-space-set]'), function (b) { return b.dataset.spaceSet === sp; });
                pressed(sc.querySelectorAll('[data-billing-set]'), function (b) { return b.dataset.billingSet === state.billing; });
                calc(sc);
            });
        };

        document.addEventListener('click', function (e) {
            var b = e.target.closest('[data-space-set], [data-billing-set], [data-level-set]');
            if (!b) return;
            if (b.dataset.spaceSet) state.space = b.dataset.spaceSet;
            if (b.dataset.billingSet) state.billing = b.dataset.billingSet;
            if (b.dataset.levelSet) {
                var tab = document.querySelector('.pr-table');
                if (tab) tab.dataset.level = b.dataset.levelSet;
                pressed(document.querySelectorAll('[data-level-set]'), function (o) { return o === b; });
                return;
            }
            render();
            warp('nudge');
            // La dirección guarda la elección para compartirla (?space=tiendas&billing=annual)
            if (document.querySelector('[data-space-set]')) {
                var u = new URLSearchParams(location.search);
                if (state.space) u.set('space', state.space);
                if (state.billing === 'y') u.set('billing', 'annual'); else u.delete('billing');
                history.replaceState(null, '', location.pathname + '?' + u.toString() + location.hash);
            }
        });
        document.querySelectorAll('[data-calc] input').forEach(function (inp) {
            inp.addEventListener('input', function () { calc(inp.closest('.pr-scope')); });
        });
        // Al elegir un nivel en las tarjetas de precios, la comparación resalta su columna
        document.querySelectorAll('.pr-levels .pr-card').forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;
                var btn = document.querySelector('[data-level-set="' + card.dataset.level + '"]');
                if (btn) btn.click();
            });
        });
        window.addEventListener('pixy:langChange', render);
        render();
    }

    // --- Formularios: abren el correo con el mensaje armado ------------------------------------------
    document.querySelectorAll('.sp-form').forEach(function (form) {
        // Un parámetro de la URL con el nombre de un campo lo preselecciona (?space=resto, ?paquete=debut)
        var params = new URLSearchParams(location.search);
        form.querySelectorAll('select[name]').forEach(function (sel) {
            var v = params.get(sel.name);
            if (v && sel.querySelector('option[value="' + v + '"]')) sel.value = v;
        });
        form.querySelectorAll('input[type="hidden"][name]').forEach(function (inp) { if (params.get(inp.name)) inp.value = params.get(inp.name); });

        // Consentimiento: el botón queda deshabilitado hasta marcar la autorización (dictamen legal §4)
        var auth = form.querySelector('[data-consent="auth"]');
        var news = form.querySelector('[data-consent="news"]');
        var send = form.querySelector('[type="submit"]');
        var syncSend = function () { if (auth && send) send.disabled = !auth.checked; };
        if (auth) auth.addEventListener('change', syncSend);
        syncSend();

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.reportValidity() || (auth && !auth.checked)) return;
            var en = lang() === 'en';
            var d = new FormData(form);
            var lines = [];
            // Los campos que empiezan con _ son las casillas: van en la constancia, no en el mensaje
            d.forEach(function (v, k) { if (k.charAt(0) !== '_' && String(v).trim()) lines.push(k + ': ' + v); });
            // Constancia de la autorización al final del correo: es la prueba (no hay servidor que la guarde)
            var wa = form.hasAttribute('data-news-wa');
            var yes = news && news.checked;
            var today = new Date().toISOString().slice(0, 10);
            lines.push('', '—');
            lines.push(en
                ? 'Personal data authorization: Yes (Personal Data Policy, version 1.0)'
                : 'Autorización de tratamiento de datos: Sí (Política de tratamiento de datos personales, versión 1.0)');
            lines.push(en
                ? 'News and offers by email' + (wa ? ' and WhatsApp' : '') + ': ' + (yes ? 'Yes' : 'No')
                : 'Novedades y ofertas por correo' + (wa ? ' y WhatsApp' : '') + ': ' + (yes ? 'Sí' : 'No'));
            lines.push((en ? 'Form: ' : 'Formulario: ') + form.dataset[en ? 'formEn' : 'formEs'] + ' · ' + today);
            var subject = form.dataset[en ? 'subjectEn' : 'subjectEs'];
            location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
            warp('departure');
        });
    });

    if (reduce) document.querySelectorAll('.sh-list li').forEach(function (li) { li.classList.add('is-on'); });
})();
