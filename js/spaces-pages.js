/**
 * PÁGINAS DE SPACES (generadas por tools/pages/build-pages.mjs)
 * - Catálogo: un modelo 3D en cromo, fijo a la derecha, que cambia al Space que se está leyendo.
 * - Precios: Space, pago mensual o anual, columna del nivel en la comparación y calculadora de Edu.
 * - Listas numeradas: el punto que cruza el centro se enciende (como en la portada).
 * - Formularios: la solicitud llega al correo del equipo (FormSubmit) y se confirma en la página;
 *   si el envío falla, se puede mandar desde el correo de la persona con un clic.
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
            s.src = 'js/space-models.js?v=7e2a41c2ce';
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

    // --- Formularios: envían la solicitud y confirman en la página --------------------------------------
    // Verificación de Cloudflare Turnstile (widget «pixy-sitio-y-demo»): la entrada de leads rechaza sin su token.
    // La clave de sitio es pública; la secreta vive solo en la plataforma. Solo carga en páginas con formulario.
    var TURNSTILE_KEY = window.pixyTurnstileKey || '0x4AAAAAAFrbwsCNF2t_ZQeS';
    var turnstileReady = null;
    var loadTurnstile = function () {
        if (!turnstileReady) turnstileReady = new Promise(function (resolve, reject) {
            window.pixyTurnstileLoaded = function () { resolve(window.turnstile); };
            var s = document.createElement('script');
            s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=pixyTurnstileLoaded';
            s.async = true;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        return turnstileReady;
    };

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

        // Envío: la solicitud entra directo al CRM de Pixy (api/public/site-lead de la plataforma) con la constancia
        // de autorización, y la persona ve la confirmación en la página. Si falla, puede mandarla desde su correo.
        var T = function (k, fallback) { return (window.pixyI18n && window.pixyI18n.t('chrome.' + k)) || fallback; };
        // Trampa para robots: un campo que una persona no ve ni llena
        var trap = document.createElement('input');
        trap.type = 'text'; trap.name = '_honey'; trap.tabIndex = -1; trap.autocomplete = 'off';
        trap.className = 'sp-trap'; trap.setAttribute('aria-hidden', 'true');
        form.appendChild(trap);
        // Desde cuándo está el formulario en pantalla: un envío en menos de 3 s es de un robot
        var shownAt = Date.now();
        // Turnstile antes del botón: invisible salvo que Cloudflare necesite que la persona lo toque
        var ts = null;
        var widget = null;
        var box = document.createElement('div');
        box.className = 'sp-turnstile sp-wide';
        if (send) send.parentNode.insertBefore(box, send);
        loadTurnstile().then(function (api) {
            ts = api;
            widget = api.render(box, {
                sitekey: TURNSTILE_KEY,
                action: 'site-lead',
                'response-field': false,
                appearance: 'interaction-only',
                size: 'flexible',
                language: lang(),
                theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
            });
        }).catch(function () {});
        var token = function () { return ts && widget !== null ? ts.getResponse(widget) || '' : ''; };

        var build = function () {
            var en = lang() === 'en';
            var d = new FormData(form);
            var fields = {};
            var lines = [];
            // Los campos que empiezan con _ son las casillas y la trampa: van en la constancia, no en el mensaje
            d.forEach(function (v, k) { if (k.charAt(0) !== '_' && String(v).trim()) { fields[k] = String(v); lines.push(k + ': ' + v); } });
            // Constancia de la autorización: viaja con la solicitud y queda en el correo del equipo
            var wa = form.hasAttribute('data-news-wa');
            var yes = news && news.checked;
            var today = new Date().toISOString().slice(0, 10);
            var proof = [
                en ? 'Personal data authorization: Yes (Personal Data Policy, version 1.0)'
                    : 'Autorización de tratamiento de datos: Sí (Política de tratamiento de datos personales, versión 1.0)',
                en ? 'News and offers by email' + (wa ? ' and WhatsApp' : '') + ': ' + (yes ? 'Yes' : 'No')
                    : 'Novedades y ofertas por correo' + (wa ? ' y WhatsApp' : '') + ': ' + (yes ? 'Sí' : 'No'),
                (en ? 'Form: ' : 'Formulario: ') + form.dataset[en ? 'formEn' : 'formEs'] + ' · ' + today
            ];
            return { fields: fields, lines: lines.concat(['', '—'], proof), proof: proof.join(' | '), subject: form.dataset[en ? 'subjectEn' : 'subjectEs'] };
        };
        var byMail = function () {
            var m = build();
            location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.lines.join('\n'));
            warp('departure');
        };
        // Mensaje prellenado para WhatsApp: quién es, su empresa, su Space y lo que contó, más la referencia que lee
        // el Inbox. Es el primer mensaje del cliente, así que la IA lo usa como cualquier cosa que él dijo
        var waText = function (f, ref) {
            var en = lang() === 'en';
            var space = form.querySelector('select[name="space"]');
            var spaceName = space && space.value && space.value !== 'otra' ? space.options[space.selectedIndex].text : '';
            var msg = (f.message || '').replace(/\s+/g, ' ').trim();
            if (msg.length > 160) msg = msg.slice(0, 157) + '…';
            var parts = en
                ? ['Hi, I am ' + (f.name || f.nombre || '') + (f.company ? ' from ' + f.company : '') + '. I just requested access to Pixy' + (spaceName ? ' for ' + spaceName : '') + '.']
                : ['Hola, soy ' + (f.name || f.nombre || '') + (f.company ? ' de ' + f.company : '') + '. Acabo de solicitar acceso a Pixy' + (spaceName ? ' para ' + spaceName : '') + '.'];
            if (msg) parts.push((en ? 'About us: ' : 'Les cuento: ') + msg);
            parts.push('(ref ' + ref + ')');
            return parts.join(' ');
        };
        var label = send ? send.textContent : '';
        var error = null;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.reportValidity() || (auth && !auth.checked)) return;
            if (error) { error.remove(); error = null; }
            var m = build();
            var done = function (ref) {
                // Confirmación en el lugar del formulario. Con referencia, la acción principal es seguir por WhatsApp:
                // la persona escribe primero, el Inbox une el chat a su solicitud y la IA la atiende con este contexto
                var ok = document.createElement('div');
                ok.className = 'sp-sent';
                ok.setAttribute('role', 'status');
                ok.tabIndex = -1;
                ok.innerHTML = '<h3 class="sh-h3l"></h3><p class="sh-body"></p><a target="_blank" rel="noopener"></a>';
                ok.children[0].textContent = T('f_ok_t', 'Listo, recibimos tu solicitud.');
                var email = m.fields.email || '';
                if (ref) {
                    ok.children[1].textContent = T('f_ok_ref', 'Te enviamos la confirmación a {email}. Si quieres empezar ya, sigue por WhatsApp: nuestra IA conoce tu solicitud y te atiende al instante.').replace('{email}', email);
                    ok.children[2].className = 'btn-neon';
                    ok.children[2].href = 'https://wa.me/573504076800?text=' + encodeURIComponent(waText(m.fields, ref));
                    ok.children[2].textContent = T('f_follow', 'Seguir por WhatsApp');
                    var refLine = document.createElement('p');
                    refLine.className = 'sh-small';
                    refLine.textContent = T('f_ref', 'Tu referencia') + ': ' + ref;
                    ok.appendChild(refLine);
                } else {
                    ok.children[1].textContent = T('f_ok_d', 'Te escribimos a {email} muy pronto.').replace('{email}', email);
                    ok.children[2].className = 'sh-link';
                    ok.children[2].href = 'https://wa.me/573504076800';
                    ok.children[2].textContent = T('f_ok_wa', '¿Prefieres hablar ya? Escríbenos por WhatsApp');
                }
                // Ocupa el mismo lugar del formulario en la cuadrícula
                form.replaceWith(ok);
                ok.focus({ preventScroll: true });
                warp('departure');
            };
            // Un robot llenó la trampa: se le muestra la confirmación y no se envía nada
            if (trap.value) return done();

            if (send) { send.disabled = true; send.textContent = T('f_sending', 'Enviando…'); }
            var payload = {
                fields: m.fields,
                consent: !!(auth && auth.checked),
                news: !!(news && news.checked),
                form: form.dataset.formEs,
                page: location.origin + location.pathname,
                lang: lang(),
                trap: trap.value,
                elapsed_ms: Date.now() - shownAt,
                turnstile_token: token()
            };
            fetch(window.pixyLeadsUrl || 'https://app.pixy.com.co/api/public/site-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, reason: j.reason, ref: /^PX-[A-Z0-9]{6}$/.test(j.ref || '') ? j.ref : null }; }); })
                .catch(function () { return { ok: false }; })
                .then(function (res) {
                    if (res.ok) return done(res.ref);
                    // El token de Turnstile sirve una sola vez: uno nuevo para el próximo intento
                    if (ts && widget !== null) ts.reset(widget);
                    if (send) { send.disabled = false; send.textContent = label; }
                    // Lo que la persona puede corregir: verificación pendiente, autorización o nombre y correo
                    var fix = { challenge: ['f_wait', 'Estamos verificando que no eres un robot. Vuelve a enviarlo en unos segundos.'],
                        no_consent: ['f_consent', 'Marca la autorización de datos para poder enviar tu solicitud.'],
                        invalid: ['f_invalid', 'Revisa tu nombre y tu correo e inténtalo de nuevo.'] }[res.reason];
                    error = document.createElement('p');
                    error.className = 'sp-form-error sp-wide';
                    error.setAttribute('role', 'alert');
                    if (fix) {
                        error.textContent = T(fix[0], fix[1]);
                        return send.parentNode.insertBefore(error, send.nextSibling);
                    }
                    // No llegó (límite, plataforma caída o sin red): correo con el mensaje listo, o WhatsApp
                    error.innerHTML = '<span></span> <button type="button" class="sh-link"></button> <a class="sh-link" target="_blank" rel="noopener" href="https://wa.me/573504076800"></a>';
                    error.children[0].textContent = T('f_err', 'No pudimos enviarlo ahora. Escríbenos a contact@pixy.com.co o por WhatsApp.');
                    error.children[1].textContent = T('f_err_b', 'Enviar desde mi correo');
                    error.children[2].textContent = T('f_err_wa', 'WhatsApp');
                    error.children[1].addEventListener('click', byMail);
                    send.parentNode.insertBefore(error, send.nextSibling);
                });
        });
    });

    if (reduce) document.querySelectorAll('.sh-list li').forEach(function (li) { li.classList.add('is-on'); });
})();
