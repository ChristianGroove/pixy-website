// ============================================
// PIXY WEBSITE - Enhanced JavaScript
// Theme Toggle, Animations, Newsletter
// ============================================

// main.js va al final del <body>: arranca en cuanto se ejecuta (ver pixyBoot() al final del archivo),
// antes del primer pintado, para que la página llegue armada en la transición entre páginas.
const pixyBoot = () => {
    // Mouse Spotlight Effect (Enhanced logic & performance)
    const spotlight = document.querySelector('.mouse-spotlight');
    // Oculto en el sitio renovado: sin bucle por cuadro si no se ve
    if (spotlight && getComputedStyle(spotlight).display !== 'none') {
        let mouseX = 0, mouseY = 0;
        let spotlightX = 0, spotlightY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateSpotlight() {
            // Smooth positioning
            spotlightX = mouseX;
            spotlightY = mouseY;

            spotlight.style.setProperty('--x', `${spotlightX}px`);
            spotlight.style.setProperty('--y', `${spotlightY}px`);

            requestAnimationFrame(updateSpotlight);
        }
        requestAnimationFrame(updateSpotlight);
    }

    // Theme Toggle Logicze theme from localStorage or system preference
    initTheme();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Add scroll-based nav styling (DISABLED: Replaced by Lego Header)
    // handleNavScroll();
    // window.addEventListener('scroll', handleNavScroll);

    // Intersection Observer for fade-in animations
    initScrollAnimations();

    // Initialize Testimonials
    initTestimonials();

    // Initialize Accordion
    initAccordion();

    // Initialize Spaces Carousel
    initSpacesCarousel();

    // Menú del encabezado en móvil
    initNavMenu();



    // Initialize GSAP Hero Animations (Only if GSAP exists)
    if (typeof gsap !== 'undefined') {
        initGSAPHero();
    }

    // Initialize Voice Assistant Orb (Cobp/hot-dodo-99)
    initVoiceAssistantOrb();

    // ----------------------------------------------------
    // GLOBAL DEPENDENCY INJECTION (GSAP + Scripts)
    // ----------------------------------------------------

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    // Sequence: Load GSAP -> Then ScrollTrigger -> Then Custom Scripts
    Promise.resolve()
        .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'))
        .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'))
        .then(() => {
            initGSAPHero();
            const isSubfolder = window.location.pathname.includes('/agency/');
            const prefix = isSubfolder ? '../js/' : 'js/';
            if (!document.querySelector('script[src*="header-lego.js"]')) {
                loadScript(`${prefix}header-lego.js`);
            }
            if (!document.querySelector('script[src*="header-switcher.js"]')) {
                loadScript(`${prefix}header-switcher.js`);
            }
        })
        .catch(err => console.error('Error loading scripts:', err));

    // Scroll to Top Button Logic
    let scrollTopBtn = document.querySelector('.scroll-to-top');

    // Inject if missing (Global Availability)
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-to-top';
        scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollTopBtn.title = 'Volver arriba';
        scrollTopBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        document.body.appendChild(scrollTopBtn);
    }

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
    }

    // Console easter egg
    console.log('%c🚀 Pixy', 'font-size: 24px; font-weight: bold; color: #f205e2;');
    console.log('%cBuilding the future of business management', 'color: #9ca3af;');

    // Llegada a la página y precarga de la siguiente
    initPageArrival();
    initPrerender();
};

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('pixy-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('pixy-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    document.documentElement.classList.add('theme-transitioning');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pixy-theme', newTheme);

    setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
    }, 350);

    // Animate the toggle button
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            toggle.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }
}

// ============================================
// NAVIGATION
// ============================================

function handleNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
}

// ============================================
// NEWSLETTER
// ============================================

async function handleNewsletterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button');
    const originalText = button.innerHTML;

    const lang = localStorage.getItem('pixy_lang') || 'es';
    const msgInvalid = lang === 'en' ? 'Please enter a valid email' : 'Por favor ingresa un email válido';
    const msgSending = lang === 'en' ? 'Sending...' : 'Enviando...';
    const msgSuccess = lang === 'en' ? 'Thank you! We will notify you when we launch.' : '¡Gracias! Te notificaremos cuando lancemos.';
    const msgError = lang === 'en' ? 'An error occurred. Please try again.' : 'Hubo un error. Intenta de nuevo.';

    // Simple validation
    if (!email || !email.includes('@')) {
        showToast(msgInvalid, 'error');
        return;
    }

    // Show loading state
    button.innerHTML = `<span class="loading-spinner"></span> ${msgSending}`;
    button.disabled = true;

    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Success
        showToast(msgSuccess, 'success');
        form.reset();
    } catch (error) {
        showToast(msgError, 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;padding:4px;margin-left:8px;">✕</button>
    `;

    // Style
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 24px;
        padding: 16px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        animation: slideInUp 0.3s ease;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ${type === 'success'
            ? 'background: linear-gradient(135deg, #10b981, #059669); color: white;'
            : type === 'error'
                ? 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;'
                : 'background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color);'
        }
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

// ============================================
// SCROLL ANIMATIONS (Standardized Site-Wide)
// ============================================

function initScrollAnimations() {
    // 1. Define elements to animate automatically
    // Exclude hero sections to avoid conflicting with detailed GSAP timelines
    const selector = `
        section:not(.hero-space):not(#hero):not(.agency-hero-section),
        header:not(.hero-space):not(#hero):not(.agency-hero-section), 
        article,
        .glass-card, 
        .step-card,
        .blog-card,
        .feature-row, 
        .grid-2, 
        .grid-3,
        .steps-flow-container,
        .pricing-toggle,
        .footer
    `;

    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay if multiple elements appear at once
                // logic can be complex, for now simple fade up is cleaner
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        // Only observe if it's not already visible or transformed
        // Also skip the main nav to avoid hiding it
        if (!el.classList.contains('fade-in-visible') &&
            !el.classList.contains('hero-content-left') &&
            !el.closest('.nav') &&
            // Secciones con su propia animación de scroll (pines de GSAP): un transform aquí rompe el pin
            !el.closest('[data-no-reveal]') &&
            // Lo que ya está en pantalla al llegar entra con la transición de página, no se esconde y vuelve
            el.getBoundingClientRect().top > window.innerHeight) {

            el.classList.add('fade-in-hidden');
            observer.observe(el);
        }
    });

    // Keep support for manual .animate-on-scroll class just in case
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        if (el.getBoundingClientRect().top <= window.innerHeight) return;
        el.classList.add('fade-in-hidden');
        observer.observe(el);
    });
}

// ============================================
// UTILITIES
// ============================================

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
    
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-scrolled {
        background: var(--bg-primary) !important;
        box-shadow: 0 4px 20px var(--shadow-color);
    }
`;
document.head.appendChild(style);

// ============================================
// TESTIMONIALS SLIDER
// ============================================

function initTestimonials() {
    const container = document.querySelector('.testimonial-slider-container');
    if (!container) return; // Exit if not on home page

    const track = document.querySelector('.testimonial-images-track');
    const contentWrapper = document.querySelector('.testimonial-content-wrapper');
    const controlsContainer = document.querySelector('.testimonial-controls');

    // Data
    const testimonials = [
        {
            name: "Carlos Mendoza",
            role: "CEO, Marketing Flow",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
            quote: "Pixy transformó nuestra agencia. Pasamos de usar 5 herramientas diferentes a tener todo en un solo lugar. La facturación automatizada nos ahorra 20 horas al mes."
        },
        {
            name: "Ana Lucía Torres",
            role: "Fundadora, Green Eat",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
            quote: "La plantilla de Restaurante es increíble. Ya venía configurada con el menú digital y los pedidos por WhatsApp. En una tarde estábamos operando."
        },
        {
            name: "Javier Costa",
            role: "Director, Tech Solutions",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            quote: "El soporte multi-tenant es lo que buscábamos. Podemos gestionar a todos nuestros clientes desde un solo dashboard sin mezclar datos."
        },
        {
            name: "Sofía Vergara",
            role: "Gerente, Style Store",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
            quote: "Recuperamos el 30% de los carritos abandonados gracias a las automatizaciones de Pixy. Se pagó solo en la primera semana."
        }
    ];

    let currentIndex = 0;
    let autoPlayInterval;

    // Render Initial State
    function render() {
        // Clear Tracks
        track.innerHTML = '';
        controlsContainer.innerHTML = '';

        // 1. Render Images (Orbiting System)
        testimonials.forEach((item, index) => {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.className = 'testimonial-img';

            // Calculate Position relative to current
            // 0 = Active/Center
            // -1 = Previous
            // 1 = Next
            // Others = hidden/waiting
            let position = 'hidden';
            if (index === currentIndex) position = 'active';
            else if (index === (currentIndex - 1 + testimonials.length) % testimonials.length) position = 'prev';
            else if (index === (currentIndex + 1) % testimonials.length) position = 'next';

            img.classList.add(position);

            // Allow click to jump
            img.onclick = () => {
                if (position !== 'active') {
                    setIndex(index);
                }
            };

            track.appendChild(img);
        });

        // 2. Render Text with Fade Animation
        const quoteBox = contentWrapper.querySelector('.testimonial-quote-container');
        // Reset Logic to force re-flow animation
        const newHtml = `
            <p class="testimonial-quote">"${testimonials[currentIndex].quote}"</p>
            <div>
                <div class="testimonial-author">${testimonials[currentIndex].name}</div>
                <div class="testimonial-role">${testimonials[currentIndex].role}</div>
            </div>
        `;
        quoteBox.innerHTML = newHtml;

        // 3. Render Controls (Dots/Arrows)
        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'testimonial-btn';
        prevBtn.innerHTML = '←'; // Or SVG
        prevBtn.onclick = () => prev();
        controlsContainer.appendChild(prevBtn);

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'testimonial-btn';
        nextBtn.innerHTML = '→'; // Or SVG
        nextBtn.onclick = () => next();
        controlsContainer.appendChild(nextBtn);
    }

    function setIndex(index) {
        currentIndex = index;
        render();
        resetAutoPlay();
    }

    function next() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        render();
        resetAutoPlay();
    }

    function prev() {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        render();
        resetAutoPlay();
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(next, 5000); // 5 seconds rotation
    }

    // Initialize
    render();
    resetAutoPlay();
}

// ============================================
// ACCORDION (FAQ)
// ============================================

function initAccordion() {
    const accordions = document.querySelectorAll('.accordion-item');

    accordions.forEach(item => {
        const header = item.querySelector('.accordion-header');

        header.addEventListener('click', () => {
            // Close others (Optional - strict accordion)
            accordions.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current
            item.classList.toggle('active');
        });
    });
}

/* ============================================
   GSAP HERO ANIMATION
   ============================================ */
function initGSAPHero() {
    const hero = document.querySelector('.hero-space') || document.querySelector('.agency-hero-section');
    if (!hero || hero.dataset.gsapInitialized === 'true') return;
    hero.dataset.gsapInitialized = 'true';

    gsap.registerPlugin(ScrollTrigger);

    const content = document.querySelector('.hero-space .hero-content-left') || 
                    document.querySelector('.agency-hero-content') || 
                    document.querySelector('.hero-content-left');
    const astroWrapper = document.querySelector('.agency-hero-astronaut-wrapper') || 
                         document.querySelector('.hero-space .agency-hero-astronaut-wrapper') || 
                         document.querySelector('.spaces-astro-pos') || 
                         document.querySelector('.astronaut-hero');
    const orbWrapper = document.querySelector('.hero-hand-orb-wrapper') || 
                       document.querySelector('.hero-space .hero-hand-orb-wrapper') || 
                       document.querySelector('.spaces-orb-pos') || 
                       document.querySelector('.hero-hand-orb');
    const glow = document.querySelector('.agency-visual-glow') || 
                 document.querySelector('.hero-space .agency-visual-glow');

    if (!astroWrapper) return;

    // 1. Entrada: un solo movimiento corto (texto y visual a la vez). Solo en la primera carga:
    // al llegar desde otra página del sitio la transición entre páginas ya hace la entrada.
    whenPageRevealed((viaTransition) => {
        if (viaTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
        if (content) tl.from(content.children, { y: 24, opacity: 0, stagger: 0.06 }, 0);
        if (glow) tl.from(glow, { opacity: 0 }, 0);
        if (astroWrapper) tl.from(astroWrapper, { y: 32, opacity: 0, duration: 0.9 }, 0.05);
        if (orbWrapper) tl.from(orbWrapper, { scale: 0.7, opacity: 0, duration: 0.9 }, 0.1);
    });

    // 2. SCROLL TRIGGER: Parallax (Smooth High-Depth Zoom + Controlled Translation)
    if (astroWrapper) {
        gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=750',
                scrub: 1.2
            }
        })
        .to(astroWrapper, {
            y: 80,
            scale: 1.15,
            opacity: 0.98,
            duration: 0.55,
            ease: 'none'
        })
        .to(astroWrapper, {
            y: 150,
            scale: 1.26,
            opacity: 0.9,
            duration: 0.45,
            ease: 'power1.out'
        });
    }

    if (orbWrapper) {
        gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=750',
                scrub: 1.0
            }
        })
        .to(orbWrapper, {
            y: 90,
            x: 25,
            scale: 1.7,
            opacity: 0.98,
            duration: 0.55,
            ease: 'none'
        })
        .to(orbWrapper, {
            y: 170,
            x: 50,
            scale: 2.2,
            opacity: 0.88,
            duration: 0.45,
            ease: 'power1.out'
        });
    }

    if (glow) {
        gsap.to(glow, {
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=750',
                scrub: 1.2
            },
            scale: 1.6,
            opacity: 0,
            ease: 'power1.inOut'
        });
    }
}

// Refresh ScrollTrigger when images load
window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});

/* ============================================
   VOICE ASSISTANT ORB (Cobp/hot-dodo-99)
   ============================================ */
// Menú del encabezado en móvil: el botón Menú abre el panel de enlaces; se cierra al elegir uno,
// con Escape, al tocar fuera o al volver a escritorio
function initNavMenu() {
    const nav = document.querySelector('.nav');
    const btn = nav && nav.querySelector('.nav-menu-btn');
    if (!btn) return;
    const setOpen = (open) => {
        nav.classList.toggle('is-menu-open', open);
        btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-menu-open')));
    nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

// Llama a fn(viaTransition) en el primer pintado de la página. viaTransition: se llegó con la
// transición entre páginas del sitio. Sin soporte de pagereveal, se llama de inmediato como primera carga.
function whenPageRevealed(fn) {
    if (!('onpagereveal' in window)) return fn(false);
    window.addEventListener('pagereveal', (e) => fn(!!e.viewTransition), { once: true });
}

// Al llegar desde otra página las estrellas aceleran un instante, como al moverse entre páginas
// de la plataforma (perfil "nudge" de warp-controller)
function initPageArrival() {
    whenPageRevealed((viaTransition) => {
        if (viaTransition && window.pixySpace) window.pixySpace.warp('nudge');
    });
}

// Precarga la página de un enlace interno al pasar el cursor (o al tocarlo en móvil): al hacer clic
// ya está lista y la transición es inmediata. Solo en navegadores con Speculation Rules.
function initPrerender() {
    if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) return;
    const rules = document.createElement('script');
    rules.type = 'speculationrules';
    rules.textContent = JSON.stringify({
        prerender: [{
            where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target], [download], [href^="mailto:"]' } }] },
            eagerness: 'moderate'
        }]
    });
    document.head.appendChild(rules);
}

function initVoiceAssistantOrb() {
    const orb = document.querySelector('.orb');
    const input = document.getElementById('v.a.o.') || document.querySelector('.input-orb');
    if (!orb || !input) return;

    orb.setAttribute('tabindex', '0');
    orb.setAttribute('role', 'button');
    orb.setAttribute('aria-label', 'AI Assistant Orb');

    // Accessibility keyboard toggle
    orb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            input.checked = !input.checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// ============================================
// SPACES CAROUSEL (3D)
// ============================================

function initSpacesCarousel() {
    const carousel = document.querySelector('.spaces-carousel-wrapper');
    if (!carousel) return;

    const cards = Array.from(document.querySelectorAll('.space-card'));
    let currentIndex = 0;

    // Initial State
    updateCarousel();

    // Expose global function for HTML onclick
    window.rotateCarousel = (direction) => {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % cards.length;
        } else {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        }
        updateCarousel();
    };

    function updateCarousel() {
        cards.forEach((card, index) => {
            // Determine position
            if (index === currentIndex) {
                card.className = 'space-card active';
                card.onclick = null;
            } else if (index === (currentIndex + 1) % cards.length) {
                card.className = 'space-card next';
                card.onclick = () => { currentIndex = index; updateCarousel(); };
            } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                card.className = 'space-card prev';
                card.onclick = () => { currentIndex = index; updateCarousel(); };
            } else {
                card.className = 'space-card hidden';
                card.onclick = null;
            }
        });
    }

    // Touch / Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselTrack = document.querySelector('.spaces-carousel');

    carouselTrack.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        const swipeDistance = touchStartX - touchEndX;

        if (Math.abs(swipeDistance) > threshold) {
            if (swipeDistance > 0) {
                // Swiped Left -> Next
                window.rotateCarousel('next');
            } else {
                // Swiped Right -> Prev
                window.rotateCarousel('prev');
            }
        }
    }
}

pixyBoot();
