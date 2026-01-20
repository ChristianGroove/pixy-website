/**
 * LEGO HEADER EFFECT
 * A futuristic "disassembly/assembly" effect for the floating header.
 * Components "snap" into place mechanically when revealing, rather than just fading.
 */

// Self-executing to keep scope clean
(function () {
    console.log('🧱 Lego Header: Script Initialized');

    // Polling for GSAP availability
    const waitForGSAP = setInterval(() => {
        if (typeof gsap !== 'undefined') {
            clearInterval(waitForGSAP);
            initLegoHeader();
        }
    }, 100);

    function initLegoHeader() {
        console.log('🧱 Lego Header: GSAP Found, staring logic');
        const nav = document.querySelector('.nav');
        if (!nav) {
            console.error('🧱 Lego Header: .nav not found');
            return;
        }

        const logo = nav.querySelector('.nav-brand');
        const links = nav.querySelector('.nav-links');
        const actions = nav.querySelector('.nav-actions');

        let lastScrollY = window.scrollY;
        let isHidden = false;
        let isAnimating = false;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Jitter threshold
            if (Math.abs(currentScrollY - lastScrollY) < 10) return;

            // SCROLL DOWN -> HIDE
            if (currentScrollY > lastScrollY && currentScrollY > 100 && !isHidden && !isAnimating) {
                console.log('🧱 Lego Header: Disassembling (Hide)');
                hideHeader();
            }
            // SCROLL UP -> SHOW
            else if (currentScrollY < lastScrollY && isHidden && !isAnimating) {
                console.log('🧱 Lego Header: Assembling (Show)');
                showHeader();
            }

            lastScrollY = currentScrollY;
        });

        function hideHeader() {
            isHidden = true;
            isAnimating = true;

            const tl = gsap.timeline({
                onComplete: () => { isAnimating = false; }
            });

            // 1. Move Nav Up & Fade Out
            tl.to(nav, {
                y: -100,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            }, 0);

            // 2. Preset "Exploded" state for re-entry
            gsap.set(logo, { y: -50 });
            gsap.set(links, { y: 50, scale: 0.9 });
            gsap.set(actions, { x: 50 });
        }

        function showHeader() {
            isHidden = false;
            isAnimating = true;

            const tl = gsap.timeline({
                onComplete: () => { isAnimating = false; }
            });

            // 1. Drop Nav Container In
            tl.to(nav, {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            }, 0);

            // 2. Snap Components
            tl.fromTo(logo,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
                0.1
            );

            tl.fromTo(links,
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
                0.2
            );

            tl.fromTo(actions,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: "power4.out" },
                0.25
            );
        }
    }
})();
