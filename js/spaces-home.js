/**
 * PORTADA SPACES
 * - Titular cinético: la última palabra recorre las industrias (lista en el idioma activo).
 * - Bandeja en vivo: llega un mensaje, la IA responde, califica a la clienta y la mueve en el pipeline.
 * - Cinta del conocimiento de la IA (lista en el idioma activo).
 * - Ciudad isométrica provisional del Modo 3D.
 * - Planes: el visitante elige el nivel con un clic.
 */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t = function (key) { return window.pixyI18n && window.pixyI18n.t(key); };

    // --- Titular cinético ---------------------------------------------------------------
    var kinetic = document.querySelector('.sh-kinetic');
    var words = ['negocio', 'restaurante', 'tienda', 'inmobiliaria', 'colegio', 'agencia', 'startup'];
    var wi = 0;
    function swapWord() {
        if (!kinetic) return;
        wi = (wi + 1) % words.length;
        kinetic.classList.remove('is-swapping');
        void kinetic.offsetWidth; // reinicia la animación
        kinetic.textContent = words[wi];
        kinetic.classList.add('is-swapping');
    }
    if (kinetic && !reduce) setInterval(swapWord, 2400);

    // --- Cinta del conocimiento -------------------------------------------------------------
    var marquee = document.querySelector('[data-marquee]');
    function fillMarquee(list) {
        if (!marquee || !list) return;
        var html = '';
        // Dos copias: la animación recorre la mitad de la pista y vuelve a empezar sin salto
        for (var k = 0; k < 2; k++) list.forEach(function (w) { html += '<span>' + w + '</span>'; });
        marquee.innerHTML = html;
    }

    window.addEventListener('pixy:langChange', function () {
        var w = t('home2.hero.words');
        if (Array.isArray(w)) { words = w; wi = 0; if (kinetic) kinetic.textContent = words[0]; }
        fillMarquee(t('home2.ai.words'));
    });
    fillMarquee(['Servicios', 'Precios', 'Horarios', 'Políticas', 'Preguntas frecuentes', 'Documentos', 'Perfil del negocio', 'Respuestas del equipo', 'Productos', 'Promociones', 'Garantías', 'Métodos de pago', 'Sedes', 'Tono de marca']);

    // --- Bandeja en vivo -----------------------------------------------------------------------
    var inbox = document.querySelector('[data-inbox]');
    if (inbox) {
        var steps = inbox.querySelectorAll('.ib-step');
        var typing = inbox.querySelector('.sh-typing');
        var temp = inbox.querySelector('.ib-temp');
        var stage = inbox.querySelector('.ib-stage');
        var show = function (n) { steps.forEach(function (s) { if (Number(s.dataset.step) === n) s.classList.add('is-in'); }); };
        var label = function (el, key, fallback) { if (el) el.textContent = t(key) || fallback; };
        var timers = [];
        var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

        var play = function () {
            timers.forEach(clearTimeout);
            timers = [];
            steps.forEach(function (s) { s.classList.remove('is-in'); });
            inbox.classList.remove('is-hot', 'is-ready');
            label(temp, 'home2.inbox.warm', 'Tibia');
            label(stage, 'home2.inbox.stage1', 'Interesado');
            at(600, function () { show(1); });
            at(1300, function () { typing.classList.add('is-on'); });
            at(2500, function () { typing.classList.remove('is-on'); show(2); });
            at(4200, function () { show(3); });
            at(4700, function () { inbox.classList.add('is-hot'); label(temp, 'home2.inbox.hot', 'Caliente'); typing.classList.add('is-on'); });
            at(5800, function () { typing.classList.remove('is-on'); show(4); });
            at(6300, function () { inbox.classList.add('is-ready'); label(stage, 'home2.inbox.stage2', 'Listo para pagar'); });
            at(10500, play);
        };

        if (reduce) {
            steps.forEach(function (s) { s.classList.add('is-in'); });
        } else if ('IntersectionObserver' in window) {
            var started = false;
            new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting && !started) { started = true; play(); }
            }, { threshold: 0.3 }).observe(inbox);
        } else {
            play();
        }
    }

    // --- Ciudad isométrica del Modo 3D (provisional hasta la grabación real) ------------------
    var city = document.querySelector('[data-iso-city]');
    if (city) {
        var C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
        var iso = function (x, y, z) { return [(x - y) * C, (x + y) * S - z]; };
        var pts = function (list) { return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
        var prism = function (b) {
            var x = b.x, y = b.y, w = b.w, d = b.d, h = b.h, c = b.c;
            var top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)];
            var left = [iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)];
            var right = [iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)];
            return '<polygon points="' + pts(left) + '" fill="' + c + '" fill-opacity=".5" stroke="' + c + '" stroke-opacity=".5" stroke-width=".6"/>' +
                '<polygon points="' + pts(right) + '" fill="' + c + '" fill-opacity=".28" stroke="' + c + '" stroke-opacity=".5" stroke-width=".6"/>' +
                '<polygon points="' + pts(top) + '" fill="' + c + '" fill-opacity=".8"/>';
        };
        var B = [
            { x: 0, y: 0, w: 60, d: 50, h: 70, c: '#00E0FF' },
            { x: 90, y: -20, w: 70, d: 60, h: 120, c: '#F205E2' },
            { x: 190, y: 0, w: 60, d: 60, h: 55, c: '#FF6A2B' },
            { x: 10, y: 90, w: 70, d: 60, h: 45, c: '#2E7BFF' },
            { x: 110, y: 100, w: 60, d: 50, h: 85, c: '#8B5CF6' },
            { x: 200, y: 95, w: 55, d: 55, h: 65, c: '#10D9A0' }
        ].sort(function (a, b) { return a.x + a.y - (b.x + b.y); });
        var ground = [iso(-40, -60, 0), iso(300, -60, 0), iso(300, 190, 0), iso(-40, 190, 0)];
        city.insertAdjacentHTML('afterbegin',
            '<svg viewBox="-230 -170 520 330" aria-hidden="true"><polygon points="' + pts(ground) + '" fill="#101016" stroke="#fff" stroke-opacity=".06"/>' +
            B.map(prism).join('') + '</svg>');
    }

    // --- Planes: elegir nivel con un clic --------------------------------------------------------
    var plans = document.querySelectorAll('.sh-plan');
    plans.forEach(function (p) {
        p.addEventListener('click', function () {
            plans.forEach(function (o) { o.classList.toggle('is-active', o === p); o.setAttribute('aria-selected', o === p ? 'true' : 'false'); });
            if (window.pixySpace) window.pixySpace.warp('nudge');
        });
    });
})();
