/**
 * LEGO HEADER EFFECT
 * A futuristic "disassembly/assembly" effect for the floating header.
 * Components "snap" into place mechanically when revealing, rather than just fading.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP
    if (typeof gsap === 'undefined') return;

    const nav = document.querySelector('.nav');
    if (!nav) return;

    const logo = nav.querySelector('.nav-brand');
    const links = nav.querySelector('.nav-links');
    const actions = nav.querySelector('.nav-actions');

    let lastScrollY = window.scrollY;
    let isHidden = false;
    let isAnimating = false;

    // Initial State: Ensure standard CSS doesn't conflict
    // We will control transforms via GSAP

    // Scroll Handler
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Threshold to avoid jitter
        if (Math.abs(currentScrollY - lastScrollY) < 10) return;

        // SCROLL DOWN -> HIDE (Disassemble)
        if (currentScrollY > lastScrollY && currentScrollY > 100 && !isHidden && !isAnimating) {
            hideHeader();
        }
        // SCROLL UP -> SHOW (Assemble/Lego Snap)
        else if (currentScrollY < lastScrollY && isHidden && !isAnimating) {
            showHeader();
        }

        lastScrollY = currentScrollY;
    });

    function hideHeader() {
        isHidden = true;
        isAnimating = true;

        // Timeline for disassembly
        const tl = gsap.timeline({
            onComplete: () => { isAnimating = false; }
        });

        // 1. Background fades/clips out
        tl.to(nav, {
            y: -100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in"
        }, 0);

        // 2. Components fly apart (simulated, though hidden by nav container move, 
        // strictly speaking adjusting their offsets makes the "snap back" more dramatic later)
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

        // 1. Bring Container Back (Fast)
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

        // 3. SNAP: Links from Bottom (Mechanical slide up)
        tl.fromTo(links,
            { y: 30, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
            0.2
        );

        // 4. SNAP: Actions from Right (Hard snap)
        tl.fromTo(actions,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: "power4.out" },
            0.25
        );
    }
});
