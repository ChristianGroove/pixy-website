/**
 * MAGNETIC LIGHT CURSOR EFFECT
 * Creates dynamic volumetric shadows that cast away from the cursor position.
 * Gives the illusion that the cursor is a light source in 3D space.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const CONFIG = {
        maxShadowDistance: 15,    // Max shadow offset in px
        maxTextShadowDistance: 8, // Max text shadow offset in px
        detectionRadius: 800,     // Pixel radius to affect elements
        elements: {
            cards: '.glass-card, .feature-card, .blog-card, .newsletter',
            buttons: '.btn-neon, .btn-neon-outline, .theme-toggle, .scroll-to-top',
            text: 'h1, h2, .gradient-text'
        }
    };

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Track Mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Core Animation Loop
    const updateShadows = () => {
        // 1. Cards & Containers (Box Shadow)
        const boxElements = document.querySelectorAll(CONFIG.elements.cards);
        boxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dist = distance(mouseX, mouseY, centerX, centerY);

            if (dist < CONFIG.detectionRadius) {
                // Calculate vector from cursor to center
                const deltaX = centerX - mouseX;
                const deltaY = centerY - mouseY;

                // Normalize and scale (shadow moves AWAY from light)
                // The closer the cursor, the "deeper" the shadow cast?
                // Actually, light source logic:
                // Cursor Left -> Shadow Right (Positive X)

                const factor = 1 - (dist / CONFIG.detectionRadius); // 0 to 1 strength
                const shadowX = (deltaX / dist) * CONFIG.maxShadowDistance * factor * 2;
                const shadowY = (deltaY / dist) * CONFIG.maxShadowDistance * factor * 2;

                // Apply (Preserve existing generic glow/border, allow overriding specific shadow)
                el.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)`;
            } else {
                el.style.boxShadow = ''; // Reset
            }
        });

        // 2. Buttons (Magnetic Pull + Shadow)
        const btnElements = document.querySelectorAll(CONFIG.elements.buttons);
        btnElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = distance(mouseX, mouseY, centerX, centerY);

            if (dist < 300) {
                const deltaX = centerX - mouseX;
                const deltaY = centerY - mouseY;
                const factor = Math.max(0, 1 - (dist / 300));

                const shadowX = (deltaX / dist) * 10 * factor;
                const shadowY = (deltaY / dist) * 10 * factor;

                el.style.boxShadow = `${shadowX}px ${shadowY}px 15px rgba(242, 5, 226, ${0.4 * factor})`;
                // Subtle magnetic pull
                el.style.transform = `translate(${shadowX * -0.5}px, ${shadowY * -0.5}px)`;
            } else {
                el.style.boxShadow = '';
                el.style.transform = '';
            }
        });

        // 3. Text (Volumetric Text Shadow)
        const textElements = document.querySelectorAll(CONFIG.elements.text);
        textElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = distance(mouseX, mouseY, centerX, centerY);

            if (dist < 400) {
                const deltaX = centerX - mouseX;
                const deltaY = centerY - mouseY;
                const factor = Math.max(0, 1 - (dist / 400));

                const shadowX = (deltaX / dist) * CONFIG.maxTextShadowDistance * factor;
                const shadowY = (deltaY / dist) * CONFIG.maxTextShadowDistance * factor;

                // Only apply if it doesn't break gradient text (gradient text relies on transparent color)
                // So check if it has gradient class
                if (!el.classList.contains('gradient-text') && !el.querySelector('.gradient-text')) {
                    el.style.textShadow = `${shadowX}px ${shadowY}px 10px rgba(0,0,0,${0.5 * factor})`;
                }
            } else {
                el.style.textShadow = '';
            }
        });

        requestAnimationFrame(updateShadows);
    };

    // Helper
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Start Loop
    requestAnimationFrame(updateShadows);
});
