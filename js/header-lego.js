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
                onComplete: () => {
                    // Move container out of way after elements are gone
                    gsap.set(nav, { y: -100 });
                    isAnimating = false;
                }
            });

            // "Polite" Disassembly: Elements leave upwards sequentially
            // 1. Logo leaves
            tl.to(logo, { y: -30, opacity: 0, duration: 0.2, ease: "power2.in" }, 0);

            // 2. Links leave (slightly later)
            tl.to(links, { y: -30, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.1);

            // 3. Actions leave
            tl.to(actions, { y: -30, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.2);

            // 4. Fade out background at the end
            tl.to(nav, { opacity: 0, duration: 0.2 }, 0.3);
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

            // 2. SNAP: Logo from Top
            tl.fromTo(logo,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
                0.1
            );

            // 3. SNAP: Links from Bottom
            tl.fromTo(links,
                { y: 20, opacity: 0, scale: 0.95 }, // Reduced Y distance
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, // Softer ease
                0.2
            );

            // 4. SNAP: Actions (Match Links/Logo - Vertical Only)
            // User requested: "Same animation as logo/menu... go up or return"
            tl.fromTo(actions,
                { y: -30, opacity: 0 }, // Drop in from top (matching natural gravity or "hide" direction)
                { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
                0.25
            );
        }
    }
})();
