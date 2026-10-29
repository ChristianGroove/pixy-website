/**
 * BLOG: compartir (copiar enlace, menú nativo del teléfono), barra de lectura, dock móvil de compartir
 * y filtro por tema en el índice. Los enlaces a cada red funcionan sin este script.
 */
(function () {
    'use strict';
    var t = function (key, fallback) { return (window.pixyI18n && window.pixyI18n.t(key)) || fallback; };

    // --- Compartir ----------------------------------------------------------------------------------
    if (navigator.share) document.documentElement.classList.add('has-native-share');

    var legacyCopy = function (text) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        ta.remove();
    };
    // Portapapeles moderno y, si el navegador lo niega, el método clásico
    var copyText = function (text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () { legacyCopy(text); });
        }
        legacyCopy(text);
        return Promise.resolve();
    };

    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-copy], [data-native]');
        if (!btn) return;
        var box = btn.closest('[data-share]');
        if (!box) return;
        var url = box.getAttribute('data-url'), title = box.getAttribute('data-title');
        if (btn.hasAttribute('data-native')) {
            navigator.share({ title: title, url: url }).catch(function () { });
            return;
        }
        var label = btn.querySelector('[data-copied-label]');
        copyText(url).then(function () {
            btn.classList.add('is-done');
            if (label) label.textContent = t('blog2.copied', 'Enlace copiado');
            clearTimeout(btn._t);
            btn._t = setTimeout(function () {
                btn.classList.remove('is-done');
                if (label) label.textContent = t('blog2.copy', 'Copiar enlace');
            }, 1800);
        });
    });

    // --- Artículo: barra de lectura y dock móvil ------------------------------------------------------
    var body = document.querySelector('.bp-body');
    var bar = document.querySelector('.bp-progress i');
    if (body && bar) {
        var ticking = false;
        var update = function () {
            ticking = false;
            var r = body.getBoundingClientRect();
            var total = r.height - window.innerHeight * 0.6;
            var p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
            bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        };
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    var dock = document.querySelector('.bp-dock');
    var cover = document.querySelector('.bp-cover');
    var endshare = document.querySelector('.bp-endshare');
    if (dock && cover && 'IntersectionObserver' in window) {
        var pastCover = false, atEnd = false;
        var sync = function () { dock.classList.toggle('is-on', pastCover && !atEnd); dock.setAttribute('aria-hidden', String(!(pastCover && !atEnd))); };
        new IntersectionObserver(function (en) { pastCover = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; sync(); }).observe(cover);
        if (endshare) new IntersectionObserver(function (en) { atEnd = en[0].isIntersecting || en[0].boundingClientRect.top < 0; sync(); }).observe(endshare);
    }

    // --- Legales: el índice de secciones marca la que se está leyendo -----------------------------------
    var tocLinks = document.querySelectorAll('.lg-toc a');
    if (tocLinks.length && 'IntersectionObserver' in window) {
        var byId = {};
        tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                tocLinks.forEach(function (a) { a.classList.remove('is-current'); });
                var a = byId[en.target.id];
                if (a) a.classList.add('is-current');
            });
        }, { rootMargin: '-20% 0px -70% 0px' });
        Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
    }

    // --- Índice: filtro por tema ------------------------------------------------------------------------
    var filters = document.querySelectorAll('.bp-filter');
    if (filters.length) {
        var cards = document.querySelectorAll('.bp-index .bp-card');
        filters.forEach(function (f) {
            f.addEventListener('click', function () {
                var cat = f.getAttribute('data-filter');
                filters.forEach(function (o) {
                    o.classList.toggle('is-active', o === f);
                    o.setAttribute('aria-selected', o === f ? 'true' : 'false');
                });
                cards.forEach(function (c, i) {
                    var show = cat === 'all' || c.getAttribute('data-cat') === cat;
                    c.hidden = !show;
                    c.classList.remove('is-entering');
                    if (show) {
                        void c.offsetWidth;
                        c.style.animationDelay = (i * 40) + 'ms';
                        c.classList.add('is-entering');
                    }
                });
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            });
        });
    }
})();
