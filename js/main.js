// ============================================
// PIXY WEBSITE - Enhanced JavaScript
// Theme Toggle, Animations, Newsletter
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Mouse Spotlight Effect
    const spotlight = document.querySelector('.mouse-spotlight');
    if (spotlight) {
        document.addEventListener('mousemove', (e) => {
            spotlight.style.left = e.clientX + 'px';
            spotlight.style.top = e.clientY + 'px';
        });
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

    // Load Lego Header Effect
    const headerScript = document.createElement('script');
    headerScript.src = 'js/header-lego.js';
    document.body.appendChild(headerScript);

    // Intersection Observer for fade-in animations
    initScrollAnimations();

    // Initialize Testimonials
    initTestimonials();

    // Initialize Accordion
    initAccordion();

    // Initialize Spaces Carousel
    initSpacesCarousel();



    // Initialize GSAP Hero Animations (Only if GSAP exists)
    if (typeof gsap !== 'undefined') {
        initGSAPHero();
    }

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
            // Load Lego Header (Dependent on GSAP)
            loadScript('js/header-lego.js');
            // Load Magnetic Cursor (No deps, but good to group)
            loadScript('js/cursor-light.js');
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
});

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
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pixy-theme', newTheme);

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

    // Simple validation
    if (!email || !email.includes('@')) {
        showToast('Por favor ingresa un email válido', 'error');
        return;
    }

    // Show loading state
    button.innerHTML = '<span class="loading-spinner"></span> Enviando...';
    button.disabled = true;

    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Success
        showToast('¡Gracias! Te notificaremos cuando lancemos.', 'success');
        form.reset();
    } catch (error) {
        showToast('Hubo un error. Intenta de nuevo.', 'error');
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
        section:not(.hero-space):not(#hero),
        header:not(.hero-space):not(#hero), 
        article,
        .glass-card, 
        .step-card,
        .space-card,
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
            !el.closest('.nav')) {

            el.classList.add('fade-in-hidden');
            observer.observe(el);
        }
    });

    // Keep support for manual .animate-on-scroll class just in case
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
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
        });
    });
}

/* ============================================
   GSAP HERO ANIMATION
   ============================================ */
function initGSAPHero() {
    gsap.registerPlugin(ScrollTrigger);

    const hero = document.querySelector('.hero-space');
    const astronaut = document.querySelector('.astronaut-hero');
    const containerRight = document.querySelector('.hero-visual-right');
    const content = document.querySelector('.hero-content-left');

    if (!hero || !astronaut) return;

    // 1. Initial CLEAR & SET
    // Clear any conflicting transforms first
    gsap.set(astronaut, { clearProps: "all" });
    gsap.set(containerRight, { clearProps: "all" });

    // Set Initial State
    gsap.set(astronaut, {
        y: 0,
        rotation: 0,
        scale: 0.8,
        opacity: 0
    });

    gsap.set(containerRight, {
        right: "-10%" // Start slightly off-screen
    });

    // 2. TIMELINE: Entrance
    const tl = gsap.timeline();

    // a. Text Entrance
    tl.from(content.children, {
        duration: 1,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: "power3.out"
    })
        // b. Astronaut Fade In & Scale Up (Concurrent)
        .to(astronaut, {
            duration: 1.5,
            scale: 1,
            opacity: 1,
            ease: "power2.out"
        }, "-=0.8");

    // 3. SEPARATE LOOP: Continuous Float (Physics)
    // Applied ONLY to the Astronaut (Y and Rotation)
    // We use a clean fromTo to ensure no conflicts
    gsap.to(astronaut, {
        y: -30, // Float up
        rotation: 3, // Slight rotation
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });

    // 4. SCROLL TRIGGER: Parallax & Layout Movement
    // Applied to the CONTAINER (Left/Right movement)
    // This avoids conflict with the Astronaut's Y/Rotation loop

    gsap.to(containerRight, {
        scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom center",
            scrub: 1
        },
        right: "10%", // Move container inwards
        y: 100, // Move container down (Parallax)
        ease: "none"
    });

    // Fade out text
    gsap.to(content, {
        scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "40% top",
            scrub: 1
        },
        opacity: 0,
        y: -50,
        filter: "blur(5px)"
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
            // Reset classes
            card.className = 'space-card hidden';

            // Determine position
            if (index === currentIndex) {
                card.className = 'space-card active';
            } else if (index === (currentIndex + 1) % cards.length) {
                card.className = 'space-card next';
                card.onclick = () => { currentIndex = index; updateCarousel(); };
            } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                card.className = 'space-card prev';
                card.onclick = () => { currentIndex = index; updateCarousel(); };
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

