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

    // --- Spaces: viaje en profundidad ----------------------------------------------------------
    var journey = document.querySelector('.sh-journey');
    if (journey && window.gsap && window.ScrollTrigger && !reduce) {
        gsap.registerPlugin(ScrollTrigger);
        var dests = journey.querySelectorAll('.sh-dest');
        var count = journey.querySelector('.sh-journey-count b');
        var fill = journey.querySelector('.sh-journey-track i');
        var n = dests.length;

        ScrollTrigger.matchMedia({
            '(min-width: 901px)': function () {
                gsap.set(dests, { autoAlpha: 0, z: -520, scale: 0.85, transformOrigin: '0% 50%' });
                gsap.set(dests[0], { autoAlpha: 1, z: 0, scale: 1 });

                var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
                for (var i = 1; i < n; i++) {
                    // El destino actual pasa junto a la cámara; el siguiente llega desde el fondo
                    tl.to(dests[i - 1], { autoAlpha: 0, z: 140, scale: 1.04, duration: 0.35 }, i)
                        .to(dests[i], { autoAlpha: 1, z: 0, scale: 1, duration: 0.6 }, i + 0.15);
                }
                tl.to({}, { duration: 0.6 });

                var current = 0;
                ScrollTrigger.create({
                    trigger: journey,
                    start: 'top top',
                    end: function () { return '+=' + window.innerHeight * (n - 1) * 0.85; },
                    pin: journey.querySelector('.sh-journey-pin'),
                    scrub: 0.6,
                    animation: tl,
                    invalidateOnRefresh: true,
                    onUpdate: function (self) {
                        var idx = Math.min(n - 1, Math.round(self.progress * tl.duration() - 0.5));
                        idx = Math.max(0, idx);
                        if (idx !== current) {
                            current = idx;
                            warp('hop');
                            if (count) count.textContent = String(idx + 1).padStart(2, '0');
                            if (fill) fill.style.width = ((idx + 1) / n) * 100 + '%';
                        }
                    }
                });
            }
        });
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
