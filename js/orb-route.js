/**
 * ORBE VIAJERO (experimento de la portada Spaces)
 * Un solo orbe de IA recorre la portada al ritmo del scroll: nace en la mano del astronauta, se acopla en
 * cada sección en un punto fijo (.orb-dock o un elemento propio), toma el acento de la sección, en la
 * sección de IA ocupa el lugar y el tamaño del orbe central con más resplandor, y al final baja y se
 * esconde detrás del pie.
 *
 * Cómo se mueve: cada parada tiene un tramo de scroll [desde, hasta] (ScrollTriggers sin animación, así
 * respetan los pines). Dentro del tramo el orbe sigue a su ancla; entre dos tramos viaja de una a la otra
 * en arco, leyendo las dos posiciones en vivo en cada fotograma. Solo escritorio y sin «reducir movimiento»
 * (window.pixyOrbTravel, js/main.js); si no, la portada queda como siempre.
 */
(function () {
    'use strict';
    if (!window.pixyOrbTravel || !window.gsap || !window.ScrollTrigger) return;
    document.documentElement.classList.add('orb-travel');

    var PINK = '#f205e2';
    var BASE = 400; // tamaño de dibujo del orbe; se escala con transform
    var $ = function (s) { return document.querySelector(s); };

    // --- Colores ------------------------------------------------------------------------------------
    var hexRgb = function (h) {
        h = String(h || '').trim();
        var m = /^#?([0-9a-f]{6})$/i.exec(h);
        if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
        m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(h);
        return m ? [+m[1], +m[2], +m[3]] : null;
    };
    var mix = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
    var css = function (c, alpha) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (alpha == null ? 1 : alpha) + ')'; };
    var pink = hexRgb(PINK);

    // --- Anclas -------------------------------------------------------------------------------------
    // Cada ancla devuelve el centro y el diámetro del orbe en coordenadas de la ventana.
    var onEl = function (el) {
        return function () {
            var r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: Math.max(r.width, r.height) };
        };
    };
    var heroOrb = $('.sh-hero-orb');
    var sv = $('.sv');
    var aiOrb = $('.ai-orb-el');
    var plans = $('.sh-plans');
    var footer = $('.footer');
    var dock = function (name) { return $('.orb-dock[data-dock="' + name + '"]'); };
    if (!heroOrb || !aiOrb || !footer) return;

    // Color del orbe de IA: lo cambia su línea de tiempo (rosa → celeste «IA pensando»)
    var aiColor = function () { return hexRgb(getComputedStyle(aiOrb).getPropertyValue('--orb-deep')) || pink; };
    var svColor = function () { return hexRgb(getComputedStyle(sv).getPropertyValue('--sv-accent')) || pink; };
    var pin = function (el) { return ScrollTrigger.getAll().find(function (s) { return s.pin === el; }); };

    var st = function (trigger, start, end) { return ScrollTrigger.create({ trigger: trigger, start: start, end: end }); };
    var svPin = sv && pin(sv.querySelector('.sv-stage'));
    var aiPin = pin($('.ai-stage'));

    // Paradas en orden de la página. range() devuelve [desde, hasta] en px de scroll.
    var stops = [
        { name: 'hero', at: onEl(heroOrb), color: function () { return pink; }, range: function () { return [0, window.innerHeight * 0.12]; } },
        { name: 'plataforma', el: dock('plataforma'), trig: ['#plataforma', 'top 35%', 'bottom 75%'] },
        sv && svPin && { name: 'spaces', el: dock('spaces'), color: svColor, pinST: svPin },
        aiPin && { name: 'ia', at: onEl(aiOrb), color: aiColor, pinST: aiPin, powered: true },
        { name: 'modo-3d', el: dock('modo-3d'), trig: ['#modo-3d', 'top 55%', 'bottom 45%'] },
        { name: 'pasos', el: dock('pasos'), trig: ['#pasos', 'top 40%', 'bottom 70%'] },
        plans && {
            name: 'planes',
            // Una cuenta sobre la línea del plan elegido: se desliza cuando el visitante cambia de plan
            at: function () {
                var p = plans.querySelector('.sh-plan.is-active') || plans.firstElementChild;
                var r = p.getBoundingClientRect();
                return { x: r.left + 9, y: r.top + 1, s: 18 };
            },
            trig: ['#planes', 'top 50%', 'bottom 55%']
        },
        { name: 'cierre', el: dock('cierre'), trig: ['.sh-final', 'top 65%', 'center 45%'] },
        {
            name: 'salida',
            // Debajo del borde superior del pie: el recorte del orbe lo esconde detrás
            at: function () {
                var r = footer.getBoundingClientRect();
                return { x: window.innerWidth / 2, y: r.top + 140, s: 64 };
            },
            range: function () { return [ScrollTrigger.maxScroll(window) - 2, ScrollTrigger.maxScroll(window)]; }
        }
    ].filter(function (s) { return s && (s.at || s.el); });

    stops.forEach(function (s) {
        if (!s.at) s.at = onEl(s.el);
        if (!s.color) s.color = function () { return pink; };
        if (s.trig) s.st = st(s.trig[0], s.trig[1], s.trig[2]);
        if (!s.range) {
            s.range = s.pinST
                ? function () { return [s.pinST.start, s.pinST.end]; }
                : function () { return [s.st.start, s.st.end]; };
        }
    });

    // --- El orbe ------------------------------------------------------------------------------------
    var orb = document.createElement('span');
    orb.className = 'ds-orb orb-traveler';
    orb.setAttribute('data-activity', 'flow');
    orb.setAttribute('aria-hidden', 'true');
    orb.innerHTML = '<span class="ds-orb-halo"></span><span class="ds-orb-body"><span class="ds-orb-swirl"></span>' +
        '<span class="ds-orb-blob"></span><span class="ds-orb-shine"></span></span>';
    document.body.appendChild(orb);

    // Curva pareja: el orbe nunca va mucho más rápido que el scroll en mitad del viaje
    var ease = function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; };

    // Tramos de cada parada sin solaparse y con un viaje mínimo entre paradas (medio alto de pantalla):
    // si dos paradas quedan muy juntas, cada una cede la mitad de lo que falta
    var layout = function () {
        var minGap = window.innerHeight * 0.5;
        var r = stops.map(function (s) { return s.range().slice(); });
        for (var i = 1; i < r.length; i++) {
            if (r[i][0] < r[i - 1][1]) r[i][0] = r[i - 1][1];
            if (r[i][1] < r[i][0]) r[i][1] = r[i][0];
            var gap = r[i][0] - r[i - 1][1];
            if (gap < minGap) {
                var need = (minGap - gap) / 2;
                var prevLen = r[i - 1][1] - r[i - 1][0];
                var nextLen = r[i][1] - r[i][0];
                var takePrev = Math.min(need, prevLen), takeNext = Math.min(need, nextLen);
                r[i - 1][1] -= takePrev;
                r[i][0] += takeNext;
            }
        }
        return r;
    };
    var cur = null;
    var lastT = 0;
    var power = 0;

    // Dónde debe estar el orbe con el scroll actual
    var target = function () {
        var y = window.scrollY;
        var ranges = layout();
        for (var k = 0; k < stops.length; k++) {
            if (y <= ranges[k][1] || k === stops.length - 1) {
                var s = stops[k];
                if (y >= ranges[k][0] || k === 0) {
                    var p = s.at();
                    return { x: p.x, y: p.y, s: p.s, c: s.color(), powered: !!s.powered };
                }
                // Viaje entre la parada anterior y esta
                var from = stops[k - 1];
                var t = (y - ranges[k - 1][1]) / Math.max(1, ranges[k][0] - ranges[k - 1][1]);
                t = Math.min(1, Math.max(0, t));
                var e = ease(t);
                var A = from.at(), B = s.at();
                // Arco: se aparta hacia un lado y vuelve; el lado alterna en cada tramo
                var side = k % 2 ? 1 : -1;
                var bow = Math.sin(Math.PI * e) * Math.min(180, window.innerWidth * 0.12) * side;
                var size = Math.exp(Math.log(Math.max(4, A.s)) + (Math.log(Math.max(4, B.s)) - Math.log(Math.max(4, A.s))) * e);
                return {
                    x: A.x + (B.x - A.x) * e + bow,
                    y: A.y + (B.y - A.y) * e,
                    s: size,
                    c: mix(from.color(), s.color(), e),
                    powered: (from.powered && t < 0.15) || (s.powered && t > 0.85)
                };
            }
        }
    };

    var frame = function (now) {
        var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
        lastT = now;
        var g = target();
        // Suavizado corto: absorbe saltos de ancla (cambio de plan, pegado del título) sin retrasar el scroll
        var k = cur ? 1 - Math.exp(-dt * 20) : 1;
        if (!cur) cur = { x: g.x, y: g.y, s: g.s, c: g.c.slice() };
        cur.x += (g.x - cur.x) * k;
        cur.y += (g.y - cur.y) * k;
        cur.s += (g.s - cur.s) * k;
        cur.c = mix(cur.c, g.c, k);
        power += ((g.powered ? 1 : 0) - power) * (1 - Math.exp(-dt * 6));

        var sc = cur.s / BASE;
        orb.style.transform = 'translate3d(' + (cur.x - BASE / 2) + 'px,' + (cur.y - BASE / 2) + 'px,0) scale(' + sc + ')';
        orb.style.setProperty('--orb-deep', css(cur.c));
        orb.style.setProperty('--orb-core', css(mix(cur.c, [255, 255, 255], 0.3)));
        orb.style.setProperty('--orb-accent', css(mix(cur.c, [255, 255, 255], 0.35), 0.36));
        orb.style.setProperty('--orb-glow', css(cur.c, 0.55 * power));
        orb.style.setProperty('--orb-power', power.toFixed(3));
        orb.classList.toggle('is-powered', power > 0.5);

        // Se esconde detrás del pie: recorta lo que queda por debajo de su borde superior
        var ft = footer.getBoundingClientRect().top;
        var bottom = cur.y + cur.s / 2;
        var cut = Math.max((bottom - ft) / sc, -BASE * 0.6);
        orb.style.clipPath = 'inset(-60% -60% ' + cut.toFixed(1) + 'px -60%)';
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    // Para revisar el recorrido desde la consola
    window.pixyOrbRoute = { stops: stops, target: target };
})();
