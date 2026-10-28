/**
 * PIXY DUAL UNIVERSE SWITCHER
 * Seamless switcher between Pixy Agency (Creative Studio) and Pixy Spaces (SaaS Platform)
 */

(function () {
    'use strict';

    function initUniverseSwitcher() {
        const switchers = document.querySelectorAll('.universe-switcher');
        if (!switchers.length) return;

        const currentPath = window.location.pathname.toLowerCase();
        // Las páginas de la cara Spaces (body.spaces-face) son Spaces aunque su URL diga «agency» (space-agency.html)
        const isAgency = !document.body.classList.contains('spaces-face') && (
            currentPath.includes('agency') ||
            currentPath.includes('services') ||
            currentPath.includes('plans') ||
            currentPath.includes('portfolio') ||
            document.body.classList.contains('agency-mode'));

        switchers.forEach(switcher => {
            const tabs = switcher.querySelectorAll('.universe-tab');
            tabs.forEach(tab => {
                const mode = tab.getAttribute('data-mode');
                if ((isAgency && mode === 'agency') || (!isAgency && mode === 'spaces')) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }

                // Add subtle hover feel
                tab.addEventListener('mouseenter', () => {
                    if (!tab.classList.contains('active')) {
                        tab.style.transform = 'translateY(-1px)';
                    }
                });
                tab.addEventListener('mouseleave', () => {
                    tab.style.transform = '';
                });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUniverseSwitcher);
    } else {
        initUniverseSwitcher();
    }
})();
