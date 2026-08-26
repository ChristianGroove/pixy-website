/**
 * PIXY AGENCY - INTERACTIVE SCOPE & BUDGET ESTIMATOR
 * Real-time project calculator with instant WhatsApp / Kickoff bridge
 */

(function () {
    'use strict';

    const services = {
        web: { id: 'web', name: 'Desarrollo Web & Landing', price: 1200, time: '7-14 días' },
        branding: { id: 'branding', name: 'Branding & Identidad Visual', price: 900, time: '5-10 días' },
        ads: { id: 'ads', name: 'Growth Ads & Paid Media', price: 800, time: 'Continuo / Mes' },
        content: { id: 'content', name: 'Content Engine & Redes', price: 650, time: 'Continuo / Mes' },
        design_dept: { id: 'design_dept', name: 'Depto. Diseño Dedicado Pro', price: 1490, time: 'Suscripción Mensual' }
    };

    let selectedServices = new Set(['web', 'branding']);
    let currentSpeed = 1.0; // Standard

    function initCalculator() {
        const calcContainer = document.getElementById('agency-calculator');
        if (!calcContainer) return;

        const optionBtns = calcContainer.querySelectorAll('.calc-option-btn');
        const speedBtns = calcContainer.querySelectorAll('.calc-speed-btn');

        // Service selection toggle
        optionBtns.forEach(btn => {
            const serviceKey = btn.getAttribute('data-service');
            if (selectedServices.has(serviceKey)) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                if (selectedServices.has(serviceKey)) {
                    if (selectedServices.size > 1) { // keep at least one
                        selectedServices.delete(serviceKey);
                        btn.classList.remove('selected');
                    }
                } else {
                    selectedServices.add(serviceKey);
                    btn.classList.add('selected');
                }
                updateSummary();
            });
        });

        // Speed selection
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentSpeed = parseFloat(btn.getAttribute('data-multiplier') || '1.0');
                updateSummary();
            });
        });

        // Initial render
        updateSummary();
    }

    function updateSummary() {
        const itemsList = document.getElementById('calc-items-list');
        const totalEstimate = document.getElementById('calc-total-estimate');
        const whatsappBtn = document.getElementById('calc-whatsapp-btn');
        if (!itemsList || !totalEstimate) return;

        itemsList.innerHTML = '';
        let total = 0;
        const selectedNames = [];

        selectedServices.forEach(key => {
            const item = services[key];
            if (item) {
                const itemPrice = Math.round(item.price * currentSpeed);
                total += itemPrice;
                selectedNames.push(item.name);

                const row = document.createElement('div');
                row.className = 'summary-item-row';
                row.innerHTML = `
                    <span>${item.name}</span>
                    <strong>$${itemPrice.toLocaleString()} USD</strong>
                `;
                itemsList.appendChild(row);
            }
        });

        totalEstimate.textContent = `$${total.toLocaleString()} USD`;

        if (whatsappBtn) {
            const msg = `¡Hola Pixy! He cotizado un proyecto en el sitio web:%0A- Servicios: ${selectedNames.join(', ')}%0A- Estimado: $${total.toLocaleString()} USD%0A¿Podemos agendar una llamada de kickoff?`;
            whatsappBtn.href = `https://wa.me/573001234567?text=${msg}`;
        }
    }

    // Initialize Portfolio Filter
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
                            gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35 });
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Parallax GSAP for Agency Hero
    function initAgencyParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const heroAstronaut = document.querySelector('.agency-hero-img');
        const heroVisual = document.querySelector('.agency-hero-visual');
        const badges = document.querySelectorAll('.floating-glass-badge');

        if (heroAstronaut) {
            gsap.to(heroAstronaut, {
                scrollTrigger: {
                    trigger: '.agency-hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.2
                },
                y: 80,
                rotation: -4,
                ease: 'none'
            });
        }

        badges.forEach((badge, index) => {
            gsap.to(badge, {
                scrollTrigger: {
                    trigger: '.agency-hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1 + index * 0.3
                },
                y: -60 * (index + 1),
                ease: 'none'
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initCalculator();
        initPortfolioFilters();

        if (typeof gsap !== 'undefined') {
            initAgencyParallax();
        } else {
            setTimeout(initAgencyParallax, 500);
        }
    });
})();
