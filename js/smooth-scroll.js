/**
 * SCROLL SUAVE (Lenis), igual que en el sitio oscuro.
 * Con pines y animaciones ligadas al scroll, el scroll nativo de la rueda se siente a saltos; Lenis lo
 * suaviza y lo sincroniza con GSAP/ScrollTrigger cuando la página los usa. Respeta prefers-reduced-motion.
 */
(function () {
    'use strict';
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var start = function () {
        if (!window.Lenis || window.pixyLenis) return;
        // El scroll-behavior: smooth del sitio pelea con Lenis
        document.documentElement.style.scrollBehavior = 'auto';
        var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
        window.pixyLenis = lenis;

        if (window.gsap && window.ScrollTrigger) {
            lenis.on('scroll', window.ScrollTrigger.update);
            window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
            window.gsap.ticker.lagSmoothing(0);
        } else {
            var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }

        // Anclas internas con el mismo suavizado (y compensando el encabezado fijo)
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href*="#"]');
            if (!a) return;
            var url = new URL(a.href, location.href);
            if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
            var target = document.querySelector(url.hash);
            if (!target) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            lenis.scrollTo(target, { offset: -72 });
            history.replaceState(null, '', url.hash);
        }, true);
    };

    if (window.Lenis) return start();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.async = true;
    s.onload = start;
    document.head.appendChild(s);
})();
