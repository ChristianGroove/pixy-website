/**
 * Pixy Agency - Core Visual Interactions & Dynamic Components
 * Includes:
 * 1. 3D Interactive Workflow Slider ("Cómo Trabajamos Contigo")
 * 2. Portfolio Category Filtering
 * 3. Hero Entrance Animations (GSAP)
 * 4. Hero Astronaut & Floating Orb Zoom Parallax (ScrollTrigger)
 */

(function () {
    'use strict';

    // =======================================================
    // 1. 3D INTERACTIVE WORKFLOW SLIDER ("Cómo Trabajamos")
    // =======================================================
    function initWorkflowSlider() {
        const track = document.getElementById('workflow-track');
        const prevBtn = document.getElementById('workflow-prev');
        const nextBtn = document.getElementById('workflow-next');
        const dotsContainer = document.getElementById('workflow-dots');
        if (!track) return;

        const slides = track.querySelectorAll('.workflow-slide');
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        let currentIndex = 0;

        function getVisibleSlides() {
            return window.innerWidth <= 900 ? 1 : 2;
        }

        function getMaxIndex() {
            return Math.max(0, totalSlides - getVisibleSlides());
        }

        function renderDots() {
            if (!dotsContainer) return;
            const maxIndex = getMaxIndex();
            const count = maxIndex + 1;

            dotsContainer.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('div');
                dot.className = 'workflow-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Ir al paso ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateSlider() {
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            const slide = slides[0];
            if (!slide) return;

            const slideWidth = slide.getBoundingClientRect().width;
            const gap = 24; // Matches CSS gap: 24px
            const offset = currentIndex * (slideWidth + gap);

            track.style.transform = `translateX(-${offset}px)`;

            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.workflow-dot');
                if (dots.length !== maxIndex + 1) {
                    renderDots();
                } else {
                    dots.forEach((dot, idx) => {
                        dot.classList.toggle('active', idx === currentIndex);
                    });
                }
            }

            // Update button styles
            if (prevBtn) {
                prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
                prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            }
            if (nextBtn) {
                nextBtn.style.opacity = currentIndex >= maxIndex ? '0.35' : '1';
                nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const maxIndex = getMaxIndex();
                currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
                updateSlider();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const maxIndex = getMaxIndex();
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                updateSlider();
            });
        }

        // Initialize dots
        renderDots();

        // Auto-slide every 5 seconds
        let autoSlide = setInterval(() => {
            const maxIndex = getMaxIndex();
            currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
            updateSlider();
        }, 5000);

        // Pause auto-slide on hover
        const container = track.closest('.workflow-slider-container') || track;
        if (container) {
            container.addEventListener('mouseenter', () => clearInterval(autoSlide));
            container.addEventListener('mouseleave', () => {
                clearInterval(autoSlide);
                autoSlide = setInterval(() => {
                    const maxIndex = getMaxIndex();
                    currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                    updateSlider();
                }, 5000);
            });
        }

        // Touch & Swipe Support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            clearInterval(autoSlide);
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const diff = startX - e.changedTouches[0].clientX;
            const maxIndex = getMaxIndex();
            if (diff > 45) {
                // Swipe Left -> Next
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                updateSlider();
            } else if (diff < -45) {
                // Swipe Right -> Prev
                currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
                updateSlider();
            }
            isDragging = false;
        }, { passive: true });

        window.addEventListener('resize', () => {
            renderDots();
            updateSlider();
        });

        // Initial setup
        updateSlider();
    }

    // =======================================================
    // 2. PORTFOLIO CATEGORY FILTERING
    // =======================================================
    function initPortfolioFilters() {
        const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
        const cards = document.querySelectorAll('.portfolio-card');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                cards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'flex';
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Initialize on DOM ready
    function init() {
        initWorkflowSlider();
        initPortfolioFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
