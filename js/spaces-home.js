/**
 * PORTADA SPACES
 * - Titular cinético: la última palabra recorre las industrias (lista en el idioma activo).
 * - Listas numeradas: el punto que cruza el centro de la pantalla se enciende.
 * - Spaces: viaje en profundidad. El scroll lleva de un destino al siguiente (el anterior pasa
 *   junto a la cámara y el nuevo llega desde el fondo) y el fondo espacial da un salto en cada cambio.
 * - Planes: el visitante elige el nivel con un clic.
 */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t = function (key) { return window.pixyI18n && window.pixyI18n.t(key); };
    var warp = function (p) { if (window.pixySpace) window.pixySpace.warp(p); };

    // --- Titular cinético ---------------------------------------------------------------
    var kinetic = document.querySelector('.sh-kinetic');
    var words = ['negocio', 'restaurante', 'tienda', 'inmobiliaria', 'colegio', 'agencia', 'startup'];
    var wi = 0;
    if (kinetic && !reduce) {
        setInterval(function () {
            wi = (wi + 1) % words.length;
            kinetic.classList.remove('is-swapping');
            void kinetic.offsetWidth; // reinicia la animación
            kinetic.textContent = words[wi];
            kinetic.classList.add('is-swapping');
        }, 2400);
    }
    window.addEventListener('pixy:langChange', function () {
        var w = t('home2.hero.words');
        if (Array.isArray(w)) { words = w; wi = 0; if (kinetic) kinetic.textContent = words[0]; }
    });

    // --- Listas numeradas: se enciende el punto que cruza el centro --------------------------------
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
        }, { rootMargin: '-40% 0px -40% 0px' });
        document.querySelectorAll('.sh-list li').forEach(function (li) { io.observe(li); });
    }

    // --- Spaces: viaje en tres capas de profundidad (adaptado del sitio oscuro) ------------------
    // Nombre gigante al fondo → objeto 3D en cromo → texto al frente. Cada destino se detiene y pasa
    // junto a la cámara; la palabra del fondo corre de derecha a izquierda durante toda su vida.
    var sv = document.querySelector('.sv');
    if (sv && window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        var stations = gsap.utils.toArray('.sv-station');
        var words = gsap.utils.toArray('.sv-word');
        var count = sv.querySelector('.sv-count b');
        var fill = sv.querySelector('.sv-track i');
        var n = stations.length;
        // Mismo orden que las estaciones del HTML; slug del modelo GLB y color de cada Space
        var MODELS = [
            { slug: 'resto', accent: '#FF6A2B' },
            { slug: 'agencias', accent: '#8B5CF6' },
            { slug: 'tiendas', accent: '#2E7BFF' },
            { slug: 'inmobiliaria', accent: '#10D9A0' },
            { slug: 'edu', accent: '#FFC233' },
            { slug: 'saas', accent: '#00E0FF' }
        ];
        var GAP = 1.6, ARRIVE = 1, HOLD = 0.45, PASS = 0.8;
        var model = null;
        var current = 0;

        var select = function (i, animate) {
            if (count) count.textContent = String(i + 1).padStart(2, '0');
            if (fill) { fill.style.width = ((i + 1) / n) * 100 + '%'; }
            sv.style.setProperty('--sv-accent', MODELS[i].accent);
            if (model) model.set(MODELS[i].slug, MODELS[i].accent);
            if (animate !== false) warp('hop');
        };

        // El objeto 3D (three.js) se descarga solo en escritorio y cuando el viaje se acerca
        var loadModels = function () {
            var host = sv.querySelector('.sv-model');
            if (!host || window.matchMedia('(max-width: 900px)').matches) return;
            var start = function () { model = window.pixyModels.mount(host, MODELS[current]); };
            if (window.pixyModels) return start();
            window.addEventListener('pixy:models-ready', start, { once: true });
            var s = document.createElement('script');
            s.src = 'js/space-models.js?v=ceb04de921';
            s.async = true;
            document.body.appendChild(s);
        };
        if ('IntersectionObserver' in window) {
            var near = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { near.disconnect(); loadModels(); }
            }, { rootMargin: '150% 0px' });
            near.observe(sv);
        } else {
            loadModels();
        }

        var mm = gsap.matchMedia();
        mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', function () {
            var vw = function () { return window.innerWidth / 100; };
            gsap.set(stations.slice(1), { z: -2600, autoAlpha: 0 });
            gsap.set(words.slice(1), { z: -3200, autoAlpha: 0 });
            gsap.set(words[0], { z: -300 });

            // El primer destino se acerca mientras la sección entra: nunca hay pantalla vacía
            gsap.timeline({ scrollTrigger: { trigger: sv, start: 'top bottom', end: 'top top', scrub: 0.6 } })
                .fromTo(stations[0].querySelector('.sv-station-entry'), { z: -1600, autoAlpha: 0 }, { z: 0, autoAlpha: 1, ease: 'power2.out' })
                .fromTo(words[0].querySelector('.sv-word-entry'), { z: -2100, autoAlpha: 0 }, { z: 0, autoAlpha: 1, ease: 'power2.out' }, 0)
                .fromTo(sv.querySelector('.sv-model'), { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: 'power2.out' }, 0);

            var tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: sv,
                    start: 'top top',
                    end: function () { return '+=' + ((n - 1) * window.innerHeight * 1.2 + window.innerHeight * 0.5); },
                    pin: sv.querySelector('.sv-stage'),
                    anticipatePin: 1,
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                    onUpdate: function (self) {
                        // Del progreso del scroll (no de tl.time()): con scrub el tiempo va retrasado
                        var t = self.progress * tl.duration();
                        var i = gsap.utils.clamp(0, n - 1, Math.floor((t + GAP - ARRIVE - HOLD + 0.15) / GAP));
                        if (i !== current) { current = i; select(i); }
                    }
                }
            });

            stations.forEach(function (st, i) {
                var at = i === 0 ? -ARRIVE : (i - 1) * GAP + HOLD + PASS * 0.4;
                var side = i % 2 ? -1 : 1;
                if (i > 0) {
                    tl.fromTo(st, { z: -2600, autoAlpha: 0 }, { z: 0, autoAlpha: 1, duration: ARRIVE, ease: 'power2.out', immediateRender: false }, at);
                    tl.fromTo(words[i], { z: -3200, autoAlpha: 0 }, { z: -300, autoAlpha: 1, duration: ARRIVE * 1.2, ease: 'power2.out', immediateRender: false }, at - 0.1);
                }
                if (i < n - 1) {
                    var out = Math.max(0, at + ARRIVE + HOLD);
                    tl.fromTo(st, { z: 0, xPercent: 0, rotationY: 0, autoAlpha: 1 },
                        { z: 1300, xPercent: 18 * side, rotationY: -10 * side, autoAlpha: 0, duration: PASS, ease: 'power2.in', immediateRender: false }, out);
                    tl.fromTo(words[i], { z: -300, autoAlpha: 1 }, { z: 600, autoAlpha: 0, duration: PASS, ease: 'power2.in', immediateRender: false }, out);
                }
                // La palabra corre de derecha a izquierda durante toda la vida del destino
                var track = words[i].querySelector('.sv-word-track');
                var from = i === 0 ? 0 : at - 0.1;
                var to = i < n - 1 ? Math.max(0, at + ARRIVE + HOLD) + PASS : at + ARRIVE + HOLD * 2;
                tl.fromTo(track,
                    { x: function () { return 50 * vw(); } },
                    { x: function () { return Math.min(25 * vw(), 112 * vw() - track.offsetWidth); }, duration: to - from, ease: 'none', immediateRender: i === 0 },
                    from);
            });
            tl.to({}, { duration: HOLD });
        });
        select(0, false);
    }
    // --- Planes: elegir nivel con un clic --------------------------------------------------------
    var plans = document.querySelectorAll('.sh-plan');
    plans.forEach(function (p) {
        p.addEventListener('click', function () {
            plans.forEach(function (o) { o.classList.toggle('is-active', o === p); o.setAttribute('aria-selected', o === p ? 'true' : 'false'); });
            warp('nudge');
        });
    });
})();
