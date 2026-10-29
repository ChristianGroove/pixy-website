/**
 * ISLA DE LA SEDE VIVA (portada, sección Modo 3D)
 * Prototipo liviano de la Sede Viva de la plataforma: una isla redonda con la sede al centro y un lote por módulo,
 * en el mismo orden de anillo (3×3) y con el Paquete de IA conectado por tubos a los edificios que usan IA.
 * - Dibujo isométrico en SVG generado aquí: sin WebGL ni librerías; colores por tema desde css/spaces-home.css.
 * - Interactiva sin clic: al pasar el cursor el edificio se eleva y muestra su ficha (nombre y estado), y la isla
 *   se inclina un poco hacia el cursor. En pantallas táctiles, tocar muestra la ficha.
 * - La actividad es simulada con datos de muestra (mensajes que llegan, la IA que responde, tratos, pagos) y solo
 *   corre con la sección en pantalla. Con movimiento reducido, la isla queda quieta.
 * Textos en locales (home2.isla).
 */
(function () {
    'use strict';
    var stage = document.querySelector('[data-isla]');
    if (!stage) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var NS = 'http://www.w3.org/2000/svg';

    // --- Proyección isométrica: unidades del mundo → coordenadas del viewBox (1000 × 700) ---------------------------
    var W = 1000, H = 700, S = 20, CX = 500, CY = 300, C = 0.8660254;
    var R = 18.5, T = 1.2, FH = 1.5, PAR = 0.7, B = 9;   // radio y espesor de la isla, alto de piso, pretil, separación
    var P = function (x, z, y) { return [CX + (x - z) * C * S, CY + (x + z) * 0.5 * S - (y || 0) * S]; };
    var pts = function (list) {
        return list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    };
    var RX = R * S * 1.2247, RY = R * S * 0.7071;

    // Lotes en el orden de la plataforma: la sede al centro y el primer anillo alrededor (color real de cada módulo)
    var LOTS = [
        { id: 'tasks', x: -B, z: -B, w: 5.6, d: 4.4, f: 2, color: '#7c5cff', ac: true },
        { id: 'crm', x: 0, z: -B, w: 6, d: 4.4, f: 2, color: '#e0599b', ac: true },
        { id: 'catalog', x: B, z: -B, w: 5, d: 4.2, f: 1, color: '#8b5cf6' },
        { id: 'ai', x: -B, z: 0, w: 6, d: 5.6, f: 3, color: '#38b6e8', tank: true },
        { id: 'hq', x: 0, z: 0, w: 6, d: 6, f: 3, color: '#f205e2', hq: true },
        { id: 'billing', x: B, z: 0, w: 5, d: 4.4, f: 2, color: '#d9a21b', alert: true },
        { id: 'social', x: -B, z: B, w: 4.8, d: 4, f: 1, color: '#f06aa6' },
        { id: 'automation', x: 0, z: B, w: 5, d: 4.2, f: 2, color: '#6366f1', ac: true },
        { id: 'inbox', x: B, z: B, w: 6, d: 4.6, f: 2, color: '#2bb3a3', ac: true },
    ];
    var byId = {};
    LOTS.forEach(function (l) { l.h = l.f * FH + PAR; byId[l.id] = l; });
    var AI_TARGETS = ['inbox', 'crm', 'social'];

    // Datos de muestra que la simulación va moviendo
    var st = { open: 23, fresh: 5, deals: 14, hot: 3, paid: 22, overdue: 3, tasks: 18, done: 7, social: 9, catalog: 87, flows: 6, used: 3120, total: 5000, online: 3 };

    var tr = function (key) { return (window.pixyI18n && window.pixyI18n.t('home2.isla.' + key)) || ''; };
    var lang = function () { return (window.pixyI18n && window.pixyI18n.getCurrentLang()) || 'es'; };
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang() === 'en' ? ',' : '.'); };
    var fill = function (s) { return s.replace(/\{(\w+)\}/g, function (_, k) { return fmt(st[k]); }); };
    var roof = function (l) { return P(l.x, l.z, l.h + (l.tank ? TANK_H : 0)); };

    // --- Piezas -----------------------------------------------------------------------------------------------------
    var el = function (tag, attrs, parent) {
        var n = document.createElementNS(NS, tag);
        for (var k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    };
    var poly = function (cls, list, parent) { return el('polygon', { 'class': cls, points: pts(list) }, parent); };

    /** Caja con techo y las dos caras visibles (+z a la izquierda, +x a la derecha). */
    function box(g, x, z, w, d, y0, h, cls) {
        var a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2, y1 = y0 + h;
        poly('isl-l ' + (cls || ''), [[a, e, y0], [b, e, y0], [b, e, y1], [a, e, y1]], g);
        poly('isl-r ' + (cls || ''), [[b, c, y0], [b, e, y0], [b, e, y1], [b, c, y1]], g);
        poly('isl-t ' + (cls || ''), [[a, c, y1], [b, c, y1], [b, e, y1], [a, e, y1]], g);
    }

    /** Tanque de cristal del Paquete de IA, abierto arriba: pared del fondo, líquido (uso del mes), brillo y cristal. */
    var TANK_R = 1.9, TANK_H = 2.6;
    function tank(g, l) {
        var y0 = l.h, base = P(l.x, l.z, y0), top = P(l.x, l.z, y0 + TANK_H);
        var rx = TANK_R * S * 1.2247, ry = TANK_R * S * 0.7071;
        l.tankGeo = { x: base[0], rx: rx, ry: ry, top: top[1], base: base[1] };
        // Pared del fondo (mitad superior de las elipses) y piso del tanque
        el('path', { 'class': 'isl-glass-back', d: 'M' + (base[0] - rx) + ',' + base[1] + ' L' + (base[0] - rx) + ',' + top[1] + ' A' + rx + ',' + ry + ' 0 0 1 ' + (base[0] + rx) + ',' + top[1] + ' L' + (base[0] + rx) + ',' + base[1] + ' A' + rx + ',' + ry + ' 0 0 0 ' + (base[0] - rx) + ',' + base[1] + ' Z' }, g);
        el('path', { 'class': 'isl-liquid-glow', 'data-glow': '' }, g);
        el('path', { 'class': 'isl-liquid', 'data-level': '' }, g);
        el('ellipse', { 'class': 'isl-liquid-top', 'data-surface': '', rx: rx, ry: ry, cx: base[0] }, g);
        // Cristal del frente y borde de la boca
        el('path', { 'class': 'isl-glass', d: 'M' + (base[0] - rx) + ',' + top[1] + ' L' + (base[0] - rx) + ',' + base[1] + ' A' + rx + ',' + ry + ' 0 0 0 ' + (base[0] + rx) + ',' + base[1] + ' L' + (base[0] + rx) + ',' + top[1] }, g);
        el('ellipse', { 'class': 'isl-glass-rim', cx: top[0], cy: top[1], rx: rx, ry: ry }, g);
        // Aros del tanque
        [0.33, 0.66].forEach(function (k) {
            var y = base[1] - (base[1] - top[1]) * k;
            el('path', { 'class': 'isl-glass-ring', d: 'M' + (base[0] - rx) + ',' + y + ' A' + rx + ',' + ry + ' 0 0 0 ' + (base[0] + rx) + ',' + y }, g);
        });
    }

    // Carga del orbe viajero (0 a 1): llena el tanque con su color y enciende los tubos (js/orb-route.js)
    var charge = 0, chargeRgb = null;
    function setLevel() {
        var g = byId.ai.tankGeo;
        var liquid = stage.querySelector('[data-level]'), glow = stage.querySelector('[data-glow]'), surface = stage.querySelector('[data-surface]');
        if (!g || !liquid) return;
        var used = Math.min(1, st.used / st.total);
        var k = used + (1 - used) * charge * 0.94;
        var y = g.base - (g.base - g.top) * k;
        var d = 'M' + (g.x - g.rx) + ',' + y + ' L' + (g.x - g.rx) + ',' + g.base + ' A' + g.rx + ',' + g.ry + ' 0 0 0 ' + (g.x + g.rx) + ',' + g.base + ' L' + (g.x + g.rx) + ',' + y + ' A' + g.rx + ',' + g.ry + ' 0 0 0 ' + (g.x - g.rx) + ',' + y + ' Z';
        liquid.setAttribute('d', d);
        glow.setAttribute('d', d);
        surface.setAttribute('cy', y.toFixed(1));
        stage.style.setProperty('--charge', charge.toFixed(3));
        if (chargeRgb) stage.style.setProperty('--orb-liquid', 'rgb(' + chargeRgb.map(Math.round).join(',') + ')');
        stage.classList.toggle('is-charged', charge > 0.5);
    }

    function building(parent, l) {
        var g = el('g', { 'class': 'isl-b', 'data-id': l.id, style: '--c:' + l.color }, parent);
        var b = el('g', { 'class': 'isl-bld' }, g);
        box(b, l.x, l.z, l.w, l.d, 0, l.h);
        // Ventanas por piso en las dos caras; unas pocas encendidas
        var e = l.z + l.d / 2, xr = l.x + l.w / 2;
        for (var f = 0; f < l.f; f++) {
            var y0 = f * FH + 0.45, y1 = y0 + 0.7;
            var nx = Math.max(2, Math.floor(l.w / 1.35)), nz = Math.max(2, Math.floor(l.d / 1.35));
            for (var i = 0; i < nx; i++) {
                var a = l.x - l.w / 2 + (i + 0.5) * (l.w / nx) - 0.32;
                if (l.hq && f === 0 && i === Math.floor(nx / 2)) {
                    poly('isl-door', [[a - 0.1, e, 0], [a + 0.74, e, 0], [a + 0.74, e, 1.15], [a - 0.1, e, 1.15]], b);
                    continue;
                }
                poly('isl-win' + (Math.random() < (l.tank ? 0.4 : 0.14) ? ' is-lit' : ''), [[a, e, y0], [a + 0.64, e, y0], [a + 0.64, e, y1], [a, e, y1]], b);
            }
            for (var j = 0; j < nz; j++) {
                var c = l.z - l.d / 2 + (j + 0.5) * (l.d / nz) - 0.32;
                poly('isl-win isl-win-r' + (Math.random() < 0.1 ? ' is-lit' : ''), [[xr, c, y0], [xr, c + 0.64, y0], [xr, c + 0.64, y1], [xr, c, y1]], b);
            }
        }
        // Letrero en el pretil con la línea del color del módulo (como el estilo arcilla de la plataforma)
        var sign = tr('b.' + l.id + '.sign');
        var at = P(l.x - l.w / 2 + 0.35, e, l.h - 0.24);
        var t = el('text', { 'class': 'isl-sign', transform: 'matrix(' + C + ',0.5,0,1,' + at[0].toFixed(1) + ',' + at[1].toFixed(1) + ')' }, b);
        t.textContent = sign;
        var len = Math.min(l.w - 0.7, sign.length * 0.36);
        var p0 = P(l.x - l.w / 2 + 0.35, e, l.h - 0.52), p1 = P(l.x - l.w / 2 + 0.35 + len, e, l.h - 0.52);
        el('line', { 'class': 'isl-sign-line', x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] }, b);
        // Techo: aire acondicionado, el tanque de la IA o la placa de la sede
        if (l.ac) box(b, l.x + l.w * 0.18, l.z - l.d * 0.12, 1.1, 0.9, l.h, 0.45, 'isl-prop');
        if (l.tank) tank(b, l);
        if (l.hq) {
            box(b, l.x, l.z, l.w * 0.56, l.d * 0.56, l.h, 0.9, 'isl-prop');
            poly('isl-plate', [[l.x - 0.9, l.z + l.d * 0.28, l.h + 0.18], [l.x + 0.9, l.z + l.d * 0.28, l.h + 0.18], [l.x + 0.9, l.z + l.d * 0.28, l.h + 0.72], [l.x - 0.9, l.z + l.d * 0.28, l.h + 0.72]], b);
        }
        if (l.alert) {
            var r = P(l.x, l.z, l.h + 1.1);
            el('circle', { 'class': 'isl-alert-ring', cx: r[0], cy: r[1], r: 7 }, b);
            el('circle', { 'class': 'isl-alert', cx: r[0], cy: r[1], r: 3.5 }, b);
        }
        // Zona sensible: la silueta completa del edificio (techo y caras), un poco más amplia
        var a2 = l.x - l.w / 2, b2 = l.x + l.w / 2, c2 = l.z - l.d / 2, e2 = l.z + l.d / 2, top = l.h + (l.tank ? TANK_H : l.hq ? 0.9 : 0.45);
        poly('isl-hit', [[a2, c2, top], [b2, c2, top], [b2, c2, 0], [b2, e2, 0], [a2, e2, 0], [a2, e2, top]], g);
    }

    function tree(parent, x, z, k) {
        var g = el('g', { 'class': 'isl-tree' }, parent), base = P(x, z, 0), top = P(x, z, 1.4 * k);
        el('line', { x1: base[0], y1: base[1], x2: top[0], y2: top[1] + 4 }, g);
        el('ellipse', { cx: top[0], cy: top[1], rx: 9 * k, ry: 11 * k }, g);
    }

    // --- Escena ------------------------------------------------------------------------------------------------------
    var base, fx, tip, tilt;
    function render() {
        stage.textContent = '';
        tilt = document.createElement('div');
        tilt.className = 'isla-tilt';
        stage.appendChild(tilt);
        var float = document.createElement('div');
        float.className = 'isla-float';
        tilt.appendChild(float);
        base = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'isla-svg', 'aria-hidden': 'true' });
        float.appendChild(base);
        fx = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'isla-svg isla-fx', 'aria-hidden': 'true' });
        float.appendChild(fx);

        var defs = el('defs', {}, base);
        var clip = el('clipPath', { id: 'isla-clip' }, defs);
        el('ellipse', { cx: CX, cy: CY, rx: RX, ry: RY }, clip);

        // Isla: base flotante con estratos, borde y suelo
        var t2 = CY + T * S, tip0 = CY + RY + 78;
        el('path', { 'class': 'isl-under', d: 'M' + (CX - RX) + ',' + t2 + ' C' + (CX - RX * 0.98) + ',' + (t2 + RY * 0.9) + ' ' + (CX - RX * 0.55) + ',' + tip0 + ' ' + CX + ',' + tip0 + ' C' + (CX + RX * 0.55) + ',' + tip0 + ' ' + (CX + RX * 0.98) + ',' + (t2 + RY * 0.9) + ' ' + (CX + RX) + ',' + t2 + ' Z' }, base);
        [0.35, 0.65].forEach(function (k) {
            var y = t2 + (tip0 - t2) * k * 0.55, rx = RX * (1 - k * k * 0.5);
            el('path', { 'class': 'isl-strata', d: 'M' + (CX - rx) + ',' + y + ' A' + rx + ',' + RY * (1 - k * 0.3) + ' 0 0 0 ' + (CX + rx) + ',' + y }, base);
        });
        el('path', { 'class': 'isl-rim', d: 'M' + (CX - RX) + ',' + CY + ' L' + (CX - RX) + ',' + t2 + ' A' + RX + ',' + RY + ' 0 0 0 ' + (CX + RX) + ',' + t2 + ' L' + (CX + RX) + ',' + CY + ' A' + RX + ',' + RY + ' 0 0 1 ' + (CX - RX) + ',' + CY + ' Z' }, base);
        el('ellipse', { 'class': 'isl-ground', cx: CX, cy: CY, rx: RX, ry: RY }, base);

        // Calles entre lotes, lotes y plaza (recortados al borde de la isla)
        var floor = el('g', { 'clip-path': 'url(#isla-clip)' }, base);
        [-B / 2, B / 2].forEach(function (k) {
            poly('isl-road', [[k - 0.7, -R, 0], [k + 0.7, -R, 0], [k + 0.7, R, 0], [k - 0.7, R, 0]], floor);
            poly('isl-road', [[-R, k - 0.7, 0], [R, k - 0.7, 0], [R, k + 0.7, 0], [-R, k + 0.7, 0]], floor);
        });
        [-B / 2, B / 2].forEach(function (k) {
            var a = P(k, -R, 0), b = P(k, R, 0), c = P(-R, k, 0), d = P(R, k, 0);
            el('line', { 'class': 'isl-dash', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, floor);
            el('line', { 'class': 'isl-dash', x1: c[0], y1: c[1], x2: d[0], y2: d[1] }, floor);
        });
        LOTS.forEach(function (l) {
            var p = l.hq ? 3.9 : 3.6;
            poly(l.hq ? 'isl-plaza' : 'isl-pad', [[l.x - p, l.z - p, 0], [l.x + p, l.z - p, 0], [l.x + p, l.z + p, 0], [l.x - p, l.z + p, 0]], floor).setAttribute('data-pad', l.id);
        });

        // Árboles en el borde y edificios, de atrás hacia adelante
        var items = LOTS.map(function (l) { return { k: l.x + l.z, draw: function (g) { building(g, l); } }; });
        [[-16.5, 3], [-15.8, -5.5], [3.2, -16.6], [-5.4, -15.9], [16.2, 4.4], [15.6, -6], [4.6, 16.2], [-6.2, 15.7], [-12.8, -11.9]].forEach(function (p, i) {
            items.push({ k: p[0] + p[1], draw: function (g) { tree(g, p[0], p[1], i % 3 === 0 ? 1.15 : 0.9); } });
        });
        items.sort(function (a, b) { return a.k - b.k; });
        var world = el('g', {}, base);
        items.forEach(function (it) { it.draw(world); });

        // Tubos del Paquete de IA a los edificios que usan IA
        AI_TARGETS.forEach(function (id) {
            el('path', { 'class': 'isl-tube', d: arc(byId.ai, byId[id]), 'data-tube': id }, base);
        });
        setLevel();

        tip = document.createElement('div');
        tip.className = 'isla-tip';
        tip.setAttribute('aria-hidden', 'true');
        stage.appendChild(tip);
        bind();
    }

    /** Arco en el aire entre dos techos (tubos y recorridos). */
    function arc(a, b, lift) {
        var p = roof(a), q = roof(b);
        var mx = (p[0] + q[0]) / 2, my = Math.min(p[1], q[1]) - (lift || 46);
        return 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1);
    }

    // --- Ficha al pasar el cursor --------------------------------------------------------------------------------------
    var hovered = null;
    function showTip(id) {
        var l = byId[id];
        if (!l || !tip) return;
        hovered = id;
        stage.classList.add('is-focus');
        stage.querySelectorAll('.isl-b').forEach(function (b) { b.classList.toggle('is-hover', b.getAttribute('data-id') === id); });
        stage.querySelectorAll('[data-pad]').forEach(function (p) { p.classList.toggle('is-hover', p.getAttribute('data-pad') === id); });
        stage.querySelectorAll('[data-tube]').forEach(function (p) { p.classList.toggle('is-on', id === 'ai' || p.getAttribute('data-tube') === id); });
        tip.innerHTML = '<strong></strong><span></span>';
        tip.firstChild.textContent = tr('b.' + id + '.name');
        tip.lastChild.textContent = fill(tr('b.' + id + '.line'));
        tip.style.setProperty('--c', l.color);
        var box = base.getBoundingClientRect(), host = stage.getBoundingClientRect(), r = roof(l), k = box.width / W;
        tip.style.left = (box.left - host.left + r[0] * k) + 'px';
        tip.style.top = (box.top - host.top + r[1] * k - 22) + 'px';
        tip.classList.add('is-on');
    }
    function hideTip() {
        hovered = null;
        stage.classList.remove('is-focus');
        stage.querySelectorAll('.is-hover').forEach(function (n) { n.classList.remove('is-hover'); });
        stage.querySelectorAll('.isl-tube.is-on').forEach(function (n) { n.classList.remove('is-on'); });
        if (tip) tip.classList.remove('is-on');
    }
    function refreshTip() { if (hovered) tip.lastChild.textContent = fill(tr('b.' + hovered + '.line')); }

    var bound = false;
    function bind() {
        stage.querySelectorAll('.isl-b').forEach(function (b) {
            b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') showTip(b.getAttribute('data-id')); });
            b.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') showTip(b.getAttribute('data-id')); });
        });
        if (bound) return;
        bound = true;
        stage.addEventListener('pointerleave', function () { hideTip(); setTilt(0, 0); });
        stage.addEventListener('pointerover', function (e) { if (!e.target.closest('.isl-b')) hideTip(); });
        // Inclinación leve hacia el cursor (solo con mouse)
        stage.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse' || reduce) return;
            var r = stage.getBoundingClientRect();
            setTilt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
        });
    }
    function setTilt(x, y) {
        if (!tilt) return;
        tilt.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
    }

    // --- Actividad simulada (datos de muestra) ---------------------------------------------------------------------------
    var movers = [], raf = 0, visible = false, timer = 0, step = 0;
    function quad(d) {
        var m = d.match(/[-\d.]+/g).map(Number);
        return function (t) {
            var u = 1 - t;
            return [u * u * m[0] + 2 * u * t * m[2] + t * t * m[4], u * u * m[1] + 2 * u * t * m[3] + t * t * m[5]];
        };
    }
    /** Un punto que viaja por un arco y avisa al llegar. */
    function travel(d, color, ms, done) {
        var dot = el('circle', { 'class': 'isl-dot', r: 4.5, style: '--c:' + color }, fx);
        movers.push({ at: quad(d), dot: dot, t0: performance.now(), ms: ms, done: done });
        if (!raf) raf = requestAnimationFrame(frame);
    }
    function frame(now) {
        movers = movers.filter(function (m) {
            var t = Math.min(1, (now - m.t0) / m.ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, p = m.at(e);
            m.dot.setAttribute('cx', p[0].toFixed(1));
            m.dot.setAttribute('cy', p[1].toFixed(1));
            if (t < 1) return true;
            m.dot.remove();
            if (m.done) m.done();
            return false;
        });
        raf = movers.length ? requestAnimationFrame(frame) : 0;
    }
    /** «+1» que sube y se apaga sobre un edificio. */
    function pop(id) {
        var l = byId[id], r = roof(l);
        var t = el('text', { 'class': 'isl-pop', x: r[0], y: r[1] - 10, style: '--c:' + l.color }, fx);
        t.textContent = '+1';
        setTimeout(function () { t.remove(); }, 1700);
    }
    function pulseTube(id, then) {
        var tube = stage.querySelector('[data-tube="' + id + '"]');
        if (tube) tube.classList.add('is-flow');
        travel(arc(byId.ai, byId[id]), byId.ai.color, 900, function () {
            if (tube) tube.classList.remove('is-flow');
            st.used += 1;
            setLevel();
            if (then) then();
            refreshTip();
        });
    }
    // De fuera de la isla (los canales) a un edificio
    var inbound = function (id) {
        var r = roof(byId[id]);
        return 'M' + (r[0] + 210) + ',' + (r[1] - 230) + ' Q' + (r[0] + 120) + ',' + (r[1] - 170) + ' ' + r[0] + ',' + r[1];
    };
    var EVENTS = [
        function () { // llega un mensaje y la IA responde
            travel(inbound('inbox'), byId.inbox.color, 1300, function () {
                st.open++; st.fresh++; pop('inbox'); refreshTip();
                setTimeout(function () { pulseTube('inbox'); }, 350);
            });
        },
        function () { // la conversación pasa al embudo
            travel(arc(byId.inbox, byId.crm, 70), byId.crm.color, 1400, function () { st.deals++; if (st.deals % 3 === 0) st.hot++; pop('crm'); refreshTip(); });
        },
        function () { // comentario en redes, la IA lo responde
            var r = roof(byId.social);
            travel('M' + (r[0] - 220) + ',' + (r[1] - 200) + ' Q' + (r[0] - 120) + ',' + (r[1] - 150) + ' ' + r[0] + ',' + r[1], byId.social.color, 1300, function () {
                st.social++; pop('social'); refreshTip();
                setTimeout(function () { pulseTube('social'); }, 350);
            });
        },
        function () { // la venta se cobra
            travel(arc(byId.crm, byId.billing, 60), byId.billing.color, 1400, function () { st.paid++; pop('billing'); refreshTip(); });
        },
        function () { // la IA ayuda a calificar en ventas
            pulseTube('crm');
        },
        function () { // una tarea terminada
            st.done++; if (st.tasks > 4) st.tasks--; pop('tasks'); refreshTip();
        },
        function () { // un flujo envía un recordatorio de cobro
            travel(arc(byId.automation, byId.billing, 60), byId.automation.color, 1300, function () { pop('billing'); });
        },
    ];
    function tick() {
        if (!visible || document.hidden) return;
        EVENTS[step % EVENTS.length]();
        step++;
        timer = setTimeout(tick, 2400);
    }
    function setVisible(v) {
        visible = v;
        stage.classList.toggle('is-live', v);
        clearTimeout(timer);
        if (v && !reduce) timer = setTimeout(tick, 900);
    }

    // Para el orbe viajero: dónde está la boca del tanque en la ventana y cuánto lo llena
    window.pixyIsla = {
        tank: function () {
            var g = byId.ai.tankGeo;
            if (!g || !base) return null;
            var r = base.getBoundingClientRect(), k = r.width / W;
            return { x: r.left + g.x * k, top: r.top + g.top * k, mid: r.top + (g.top + g.base) / 2 * k, d: g.rx * 2 * k };
        },
        setCharge: function (c, rgb) {
            charge = Math.max(0, Math.min(1, c));
            chargeRgb = rgb || chargeRgb;
            setLevel();
        }
    };

    render();
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { setVisible(e[0].isIntersecting); }, { rootMargin: '0px 0px -10% 0px' }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible) setVisible(true); });
    // Al cambiar de idioma se vuelven a escribir letreros y fichas
    window.addEventListener('pixy:langChange', function () { hideTip(); render(); });
})();
