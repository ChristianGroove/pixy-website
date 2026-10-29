/**
 * LA IA DE PIXY EN CINCO ACTOS (adaptada del sitio oscuro: pixy-web, ai-mind.tsx)
 * 1 · Nace el orbe.
 * 2 · Los canales entran al orbe (puntos de flujo neutros).
 * 3 · Sale clasificado hacia cada intención; las intenciones se encienden por turnos.
 * 4 · Se alimenta del conocimiento: paredes de palabras en perspectiva que avanzan hacia el orbe con el scroll;
 *     el orbe toma el tono «IA pensando» de la plataforma (celeste).
 * 5 · Y de cada módulo.
 * El fondo espacial acelera por tramos (window.pixySpace.boost): es el tramo más rápido del viaje.
 * Contenido verificado contra docs/comercial/01-ecosistema/nucleo.md; el sitio es global.
 */
(function () {
    'use strict';
    var section = document.querySelector('.ai');
    if (!section) return;
    var stage = section.querySelector('.ai-stage');
    var orbEl = section.querySelector('.ai-orb');
    var canvas = section.querySelector('.ai-canvas');
    var srcs = Array.prototype.slice.call(section.querySelectorAll('.ai-src'));
    var lanes = Array.prototype.slice.call(section.querySelectorAll('.ai-lane'));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var space = function () { return window.pixySpace; };
    var warp = function (p) { if (space()) space().warp(p); };
    var boost = function (v) { if (space() && space().boost) space().boost(v); };

    // Peso de cada corriente de puntos (0–1); lo mueve la línea de tiempo con el scroll.
    var w = { inflow: 0, outflow: 0 };

    // --- Paredes de palabras: el texto viene del idioma activo ----------------------------------
    var WALL_TRAVEL = 2.4;
    var fillWalls = function () {
        var t = window.pixyI18n && window.pixyI18n.t;
        var lists = {
            'knowledge-l': (t && t('home2.ai.know_l')) || ['Servicios', 'Precios', 'Horarios', 'Políticas', 'Preguntas frecuentes', 'Documentos', 'Perfil del negocio', 'Respuestas del equipo', 'Procesos'],
            'knowledge-r': (t && t('home2.ai.know_r')) || ['Productos', 'Promociones', 'Garantías', 'Métodos de pago', 'Sedes', 'Tono de marca', 'Manuales', 'Condiciones', 'ADN del negocio'],
            'modules-l': (t && t('home2.ai.mods_l')) || ['Bandeja', 'Pipeline', 'Tareas', 'Catálogo', 'Automatizador', 'Cotizaciones', 'Contactos', 'Campañas', 'Formularios'],
            'modules-r': (t && t('home2.ai.mods_r')) || ['Pixy Social', 'Proyectos', 'Facturación', 'Suscripciones', 'Portal del cliente', 'Asistencia', 'Conocimiento', 'Pixy Help', 'Modo 3D']
        };
        section.querySelectorAll('[data-wall]').forEach(function (p) {
            var words = lists[p.dataset.wall];
            p.textContent = words.concat(words, words).join('  ');
        });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };
    fillWalls();
    window.addEventListener('pixy:langChange', fillWalls);

    // --- Línea de tiempo de los actos -------------------------------------------------------------
    if (window.gsap && window.ScrollTrigger && !reduce) {
        gsap.registerPlugin(ScrollTrigger);
        var q = gsap.utils.selector(section);
        var acts = q('.ai-act');
        gsap.set(acts.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(q('.ai-src, .ai-lane'), { autoAlpha: 0 });

        var hyper = { v: 0 };
        var tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
                trigger: stage,
                start: 'top top',
                end: '+=480%',
                scrub: 0.8,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: function () { warp('departure'); },
                onEnterBack: function () { warp('hop'); },
                onLeave: function () { boost(0); },
                onLeaveBack: function () { boost(0); }
            }
        });
        var boostTo = function (v, at, duration) {
            tl.to(hyper, { v: v, duration: duration || 0.8, ease: 'power1.inOut', onUpdate: function () { boost(hyper.v); } }, at);
        };
        boostTo(5, 0, 1.4);
        boostTo(9, 1.8);
        boostTo(12, 3.8);
        boostTo(18, 6);
        boostTo(7, 8.4);
        boostTo(2, 9.4, 0.6);

        var actSwap = function (from, to, at) {
            tl.to(acts[from], { autoAlpha: 0, y: -40, duration: 0.4 }, at)
                .to(acts[to], { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.3)
                .call(function () { warp('nudge'); }, undefined, at + 0.3);
        };
        var orb = section.querySelector('.ai-orb-el');

        // 1 · Nace el orbe
        // Con el orbe viajero (js/orb-route.js) el orbe no nace aquí: llega desde la sección anterior
        tl.fromTo(orbEl, { scale: window.pixyOrbTravel ? 1 : 0.04 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
            .fromTo(acts[0], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.5);

        // 2 · Los canales entran al orbe
        actSwap(0, 1, 1.8);
        tl.to(w, { inflow: 1, duration: 0.6 }, 2)
            .to(q('.ai-src'), { autoAlpha: 1, stagger: 0.12, duration: 0.5 }, 2)
            .set(orb, { attr: { 'data-activity': 'think' } }, 2);

        // 3 · Sale clasificado
        actSwap(1, 2, 3.8);
        tl.to(w, { outflow: 1, duration: 0.6 }, 4)
            .to(q('.ai-lane'), { autoAlpha: 1, stagger: 0.08, duration: 0.4 }, 4)
            .to(w, { inflow: 0.3, duration: 0.6 }, 5.2)
            .to(q('.ai-src'), { autoAlpha: 0.15, duration: 0.4 }, 5.2);

        // 4 · El orbe se alimenta del conocimiento y toma el tono «IA pensando» (sky-400 / sky-600)
        actSwap(2, 3, 5.8);
        tl.to(w, { outflow: 0, inflow: 0, duration: 0.5 }, 5.8)
            .to(q('.ai-src, .ai-lane'), { autoAlpha: 0, duration: 0.4 }, 5.8)
            .to(orbEl, { scale: 0.7, duration: 0.8 }, 5.9)
            .fromTo(orb,
                { '--orb-core': '#f650eb', '--orb-deep': '#f205e2', '--orb-accent': 'rgba(218, 108, 213, 0.36)' },
                { '--orb-core': '#38bdf8', '--orb-deep': '#0284c7', '--orb-accent': 'rgba(125, 211, 252, 0.36)', duration: 0.9 },
                5.8)
            .to(q('.ai-walls-knowledge'), { autoAlpha: 1, duration: 0.8 }, 6);

        // 5 · Y de cada módulo
        actSwap(3, 4, 8.4);
        tl.to(orbEl, { scale: 0.6, duration: 0.6 }, 8.5)
            .to(q('.ai-walls-knowledge'), { autoAlpha: 0, duration: 0.6 }, 8.4)
            .to(q('.ai-walls-modules'), { autoAlpha: 1, duration: 0.8 }, 8.6)
            .to({}, { duration: 0.8 });

        // Las paredes avanzan hacia el orbe solo con el scroll y siguen hasta que la sección sale de la pantalla.
        // La izquierda va al fondo con +x en su plano; la derecha con −x (está girada al revés).
        var travel = function (el) { return el.parentElement.clientWidth * WALL_TRAVEL; };
        var leftStart = function (el) { return -(el.scrollWidth - el.parentElement.clientWidth); };
        var flow = { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true };
        gsap.fromTo(q('.ai-wall-l .ai-wall-text'),
            { x: function (_, el) { return leftStart(el); } },
            { x: function (_, el) { return leftStart(el) + travel(el); }, ease: 'none', scrollTrigger: flow });
        gsap.fromTo(q('.ai-wall-r .ai-wall-text'),
            { x: 0 },
            { x: function (_, el) { return -travel(el); }, ease: 'none', scrollTrigger: Object.assign({}, flow) });
    }

    // --- Lienzo: puntos que entran desde cada canal y salen hacia cada intención ----------------------
    var ctx = canvas.getContext('2d');
    var FLOW_COLOR = '#d4d4d8';
    var FLOW_DOTS = 24;
    var FLOW_SPEED = 0.13;
    var W = 0, H = 0, visible = false;
    var dpr = Math.min(1.5, window.devicePixelRatio || 1);

    var resize = function () {
        W = stage.clientWidth;
        H = stage.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var quad = function (ax, ay, bx, by, cx, cy, t) {
        var u = 1 - t;
        return [u * u * ax + 2 * u * t * bx + t * t * cx, u * u * ay + 2 * u * t * by + t * t * cy];
    };
    // Neutros e iguales a ambos lados: mismo tamaño, color, densidad y ritmo
    var flowDot = function (x, y, k, u, weight) {
        ctx.globalAlpha = weight * 0.7 * Math.sin(Math.PI * u);
        ctx.fillStyle = FLOW_COLOR;
        ctx.beginPath();
        ctx.arc(x, y, 1 + (k % 3) * 0.4, 0, Math.PI * 2);
        ctx.fill();
    };

    var draw = function (time) {
        requestAnimationFrame(draw);
        if (!visible) return;
        ctx.clearRect(0, 0, W, H);
        if (w.inflow < 0.01 && w.outflow < 0.01) return;
        var sr = stage.getBoundingClientRect();
        var or = orbEl.getBoundingClientRect();
        var cx = or.left - sr.left + or.width / 2;
        var cy = or.top - sr.top + or.height / 2;
        var R = (or.width / 2) * 0.8;
        var t = reduce ? 0 : time / 1000;
        var narrow = W < 768;

        // Entradas: nacen al final de cada canal y caen hacia el orbe con una curva, como atraídas por su gravedad
        if (w.inflow > 0.01) {
            srcs.forEach(function (src, i) {
                var el = src.getBoundingClientRect();
                var sx = narrow ? 0 : el.right - sr.left + 14;
                var sy = narrow ? H * (0.4 + i * 0.1) : el.top - sr.top + el.height / 2;
                var bx = sx + (cx - sx) * 0.6, by = sy + (cy - sy) * 0.15;
                for (var k = 0; k < FLOW_DOTS; k++) {
                    var u = (t * FLOW_SPEED + k / FLOW_DOTS) % 1;
                    var pt = quad(sx, sy, bx, by, cx, cy, Math.pow(u, 1.6)); // aceleran al acercarse al orbe
                    if (Math.hypot(pt[0] - cx, pt[1] - cy) < R) continue;
                    flowDot(pt[0], pt[1], k, u, w.inflow);
                }
            });
        }
        // Salidas: brotan del orbe y vuelan hasta el comienzo de cada intención
        if (w.outflow > 0.01) {
            lanes.forEach(function (ln, i) {
                var el = ln.getBoundingClientRect();
                var ex = narrow ? W : el.left - sr.left - 14;
                var ey = narrow ? H * (0.32 + i * 0.09) : el.top - sr.top + el.height / 2;
                var bx = cx + (ex - cx) * 0.4, by = cy + (ey - cy) * 0.9;
                for (var k = 0; k < FLOW_DOTS; k++) {
                    var u = (t * FLOW_SPEED + k / FLOW_DOTS) % 1;
                    var pt = quad(cx, cy, bx, by, ex, ey, 1 - Math.pow(1 - u, 1.6)); // salen rápido y frenan al llegar
                    if (Math.hypot(pt[0] - cx, pt[1] - cy) < R) continue;
                    flowDot(pt[0], pt[1], k, u, w.outflow);
                }
            });
        }
        ctx.globalAlpha = 1;
    };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(stage);
    requestAnimationFrame(draw);
})();
