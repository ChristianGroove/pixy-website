/**
 * PIXY STUDIO (cara de la agencia creativa; páginas generadas por tools/pages/build-studio.mjs)
 * - Portada: la cabecera STUDIO queda detrás de la protagonista; con el scroll ella avanza y la cabecera retrocede.
 * - Manifiesto: las palabras pasan de contorno a relleno con el scroll.
 * - La colección: lookbook horizontal fijado, una página por paquete; el fondo salta en cada cambio.
 * - Paquetes: el sujeto de cada paquete queda fijo a la derecha y cambia al pasar.
 * - Planes: selector de las tres formas de trabajar.
 * Con prefers-reduced-motion todo queda estático y legible.
 */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var warp = function (p) { if (window.pixySpace) window.pixySpace.warp(p); };
    var hasGsap = window.gsap && window.ScrollTrigger;
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);

    // --- Portada ---------------------------------------------------------------------------------
    var hero = document.querySelector('.st-hero');
    if (hero && hasGsap && !reduce) {
        gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: hero, start: 'top top', end: '+=80%', scrub: 0.6, pin: hero.querySelector('.st-hero-stage') }
        })
            .to(hero.querySelector('.st-hero-subject'), { scale: 1.14, yPercent: -4 }, 0)
            .to(hero.querySelector('.st-mast'), { scale: 0.9, yPercent: -12, opacity: 0.55 }, 0)
            .to(hero.querySelector('.st-hero-copy'), { autoAlpha: 0, y: -40 }, 0.55);
    }

    // --- Manifiesto: contorno → relleno, palabra por palabra --------------------------------------------
    var fill = document.querySelector('[data-fill]');
    var splitWords = function () {
        if (!fill) return [];
        fill.querySelectorAll('[data-i18n]').forEach(function (span) {
            var words = span.textContent.split(/(\s+)/);
            span.innerHTML = words.map(function (w) { return /^\s+$/.test(w) || !w ? w : '<span class="st-w">' + w + '</span>'; }).join('');
        });
        return Array.prototype.slice.call(fill.querySelectorAll('.st-w'));
    };
    if (fill) {
        var words = splitWords();
        var paint = function (p) {
            var n = Math.round(p * words.length);
            words.forEach(function (w, i) { w.classList.toggle('is-filled', i < n); });
        };
        if (hasGsap && !reduce) {
            ScrollTrigger.create({
                trigger: fill, start: 'top 75%', end: 'bottom 35%', scrub: true,
                onUpdate: function (self) { paint(self.progress); }
            });
        } else {
            paint(1);
        }
        // Al cambiar de idioma i18n reemplaza el texto: se vuelve a partir en palabras
        window.addEventListener('pixy:langChange', function () {
            words = splitWords();
            if (!hasGsap || reduce) paint(1); else ScrollTrigger.refresh();
        });
    }

    // --- La colección: lookbook horizontal ----------------------------------------------------------
    var look = document.querySelector('.st-look');
    if (look && hasGsap && !reduce) {
        var track = look.querySelector('.st-look-track');
        var pages = look.querySelectorAll('.st-look-page');
        var count = look.querySelector('.sv-count b');
        var bar = look.querySelector('.sv-track i');
        var current = 0;
        gsap.matchMedia().add('(min-width: 901px)', function () {
            var distance = function () { return track.scrollWidth - window.innerWidth; };
            gsap.to(track, {
                x: function () { return -distance(); },
                ease: 'none',
                scrollTrigger: {
                    trigger: look,
                    start: 'top top',
                    end: function () { return '+=' + distance(); },
                    pin: look.querySelector('.st-look-pin'),
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                    onUpdate: function (self) {
                        var i = Math.min(pages.length - 1, Math.round(self.progress * (pages.length - 1)));
                        if (i === current) return;
                        current = i;
                        pages.forEach(function (pg, k) { pg.classList.toggle('is-on', k === i); });
                        if (count) count.textContent = String(i + 1).padStart(2, '0');
                        if (bar) bar.style.width = ((i + 1) / pages.length) * 100 + '%';
                        warp('hop');
                    }
                }
            });
        });
        if (pages[0]) pages[0].classList.add('is-on');
    }

    // --- Paquetes: el sujeto fijo cambia con el paquete que se está leyendo -----------------------------
    var subjects = document.querySelectorAll('.st-subjects img');
    var packs = document.querySelectorAll('.st-pack');
    if (subjects.length && packs.length && 'IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var img = e.target.dataset.img;
                subjects.forEach(function (s) { s.classList.toggle('is-on', s.dataset.img === img); });
            });
        }, { rootMargin: '-45% 0px -45% 0px' });
        packs.forEach(function (p) { obs.observe(p); });
    }

    // --- Planes: tres formas de trabajar -------------------------------------------------------------
    var modes = document.querySelectorAll('.st-modes .sh-plan');
    var panels = document.querySelectorAll('.st-mode-panel');
    modes.forEach(function (btn) {
        btn.addEventListener('click', function () {
            modes.forEach(function (o) { o.classList.toggle('is-active', o === btn); o.setAttribute('aria-selected', o === btn ? 'true' : 'false'); });
            panels.forEach(function (p) { p.classList.toggle('is-on', p.dataset.panel === btn.dataset.mode); });
            if (hasGsap) ScrollTrigger.refresh();
            warp('nudge');
        });
    });
})();
