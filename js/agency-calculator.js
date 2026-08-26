/**
 * PIXY AGENCY - INTERACTIVE PROJECT BLUEPRINT & SCOPE CONFIGURATOR
 * Real-time digital architecture generator, tech stack mapper & roadmap generator
 * Includes 3D Workflow Slider & Parallax micro-interactions
 */

(function () {
    'use strict';

    const blueprintData = {
        objectives: {
            web3d: {
                id: 'web3d',
                name: 'Web 3D & High-Speed Development',
                desc: 'Plataforma inmersiva en Next.js, motion a 60fps y velocidad de carga extrema de 0.6s.',
                archTitle: 'Ecosistema Web Headless & Experiencia 3D',
                stack: ['Next.js 14', 'GSAP Core', 'Spline 3D', 'TailwindCSS', 'Vercel Edge'],
                timeline: 'Sprint Ágil: 2 a 3 semanas',
                match: '98% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Arquitectura de información, wireframes interactivos y diseño UI/UX en Figma' },
                    { phase: 'FASE 02', text: 'Desarrollo frontend headless optimizado a 60fps con Core Web Vitals 100%' },
                    { phase: 'FASE 03', text: 'Integración de analítica avanzada, SEO técnico y despliegue en CDN global' }
                ]
            },
            ecommerce: {
                id: 'ecommerce',
                name: 'E-Commerce & High-Conversion Funnels',
                desc: 'Infraestructura de venta digital, arquitectura Shopify Headless y checkout optimizado.',
                archTitle: 'Arquitectura E-Commerce & Conversión Acelerada',
                stack: ['Shopify Plus', 'Next.js Commerce', 'Klaviyo API', 'CRO Engine', 'PostgreSQL'],
                timeline: 'Sprint Ágil: 3 a 4 semanas',
                match: '96% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Auditoría integral de experiencia de compra y diseño de arquitectura de catálogo' },
                    { phase: 'FASE 02', text: 'Desarrollo de tienda ultrarrápida con filtrado instantáneo y pasarelas de pago' },
                    { phase: 'FASE 03', text: 'Automatización de flujos de retención y optimización de tasa de conversión' }
                ]
            },
            branding: {
                id: 'branding',
                name: 'Brand Identity & 3D Systems',
                desc: 'Sistema de marca integral, tipografía, dirección de arte y biblioteca de activos 3D.',
                archTitle: 'Sistema de Identidad Visual & Modelado 3D',
                stack: ['Blender 3D', 'Figma Tokens', 'Adobe CC', 'Design Systems'],
                timeline: 'Sprint Ágil: 2 a 3 semanas',
                match: '99% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Investigación estratégica de mercado, ADN de marca y territorio conceptual' },
                    { phase: 'FASE 02', text: 'Diseño de logotipo, tipografía, paleta cromática y biblioteca de elementos 3D' },
                    { phase: 'FASE 03', text: 'Manual de marca interactivo, guías de diseño y aplicaciones multicanal' }
                ]
            },
            growth: {
                id: 'growth',
                name: 'Growth Ads & Performance Media',
                desc: 'Estrategia de adquisición de alto rendimiento en Meta Ads, Google Ads y TikTok Ads.',
                archTitle: 'Motor de Adquisición Multicanal & Creative Engine',
                stack: ['Meta Ads API', 'Google Ads', 'TikTok Ads', 'Creative Engine', 'GA4 Server-Side'],
                timeline: 'Setup en 7 días + Optimización Continua',
                match: '95% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Auditoría de audiencias, setup de tracking y pixel server-side' },
                    { phase: 'FASE 02', text: 'Producción de creativos estáticos y motion graphics de alto impacto' },
                    { phase: 'FASE 03', text: 'Lanzamiento de campañas y optimización algorítmica continua basada en ROAS' }
                ]
            },
            crm: {
                id: 'crm',
                name: 'Automation & Intelligent CRM',
                desc: 'Funnels automatizados por WhatsApp Cloud API y sincronización con Pixy Spaces.',
                archTitle: 'Infraestructura de Conversión WhatsApp & AI',
                stack: ['WhatsApp Cloud API', 'Pixy Spaces CRM', 'OpenAI API', 'Webhooks', 'Make / n8n'],
                timeline: 'Sprint Ágil: 1 a 2 semanas',
                match: '97% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Modelado del árbol de decisiones conversacional y arquitectura de embudo' },
                    { phase: 'FASE 02', text: 'Conexión oficial de API, configuración de agentes inteligentes y webhooks' },
                    { phase: 'FASE 03', text: 'Sincronización bidireccional con el panel de control Pixy Spaces' }
                ]
            },
            dept: {
                id: 'dept',
                name: 'Dedicated Creative Department',
                desc: 'Equipo creativo multidisciplinario senior bajo suscripción mensual on-demand.',
                archTitle: 'Departamento Creativo Senior Dedicado',
                stack: ['Figma UI/UX', 'After Effects', 'Blender 3D', 'Frontend Dev', 'Sprints 24-48h'],
                timeline: 'Suscripción Mensual Activa',
                match: '100% Precision',
                deliverables: [
                    { phase: 'FASE 01', text: 'Kickoff estratégico, configuración del entorno de trabajo y asignación del equipo' },
                    { phase: 'FASE 02', text: 'Dirección de arte senior dedicada y ejecución de requerimientos concurrentes' },
                    { phase: 'FASE 03', text: 'Ciclo continuo de entregas en 24 a 48 horas con revisiones ilimitadas' }
                ]
            }
        },
        stages: {
            startup: { id: 'startup', name: 'Startup / Early Stage', tag: 'Fast-Track' },
            scaleup: { id: 'scaleup', name: 'Scale-Up / Growth', tag: 'High-Scale' },
            enterprise: { id: 'enterprise', name: 'Corporate / Enterprise', tag: 'Enterprise Grade' }
        },
        modules: {
            renders3d: { id: 'renders3d', name: 'Modelado & Animación 3D', tag: '3D High-End' },
            gsap: { id: 'gsap', name: 'Animaciones GSAP 60fps', tag: 'Motion 60fps' },
            whatsapp: { id: 'whatsapp', name: 'Integración WhatsApp API', tag: 'WhatsApp Cloud' },
            cro: { id: 'cro', name: 'Auditoría & Optimización CRO', tag: 'CRO Funnels' },
            copy: { id: 'copy', name: 'Copywriting Persuasivo', tag: 'High-Impact Copy' },
            designsystem: { id: 'designsystem', name: 'Sistema UI Tokens en Figma', tag: 'Figma Tokens' }
        }
    };

    let selectedObjective = 'web3d';
    let selectedStage = 'scaleup';
    let selectedModules = new Set(['renders3d', 'gsap', 'whatsapp']);

    function initBlueprintConfigurator() {
        const container = document.getElementById('agency-blueprint');
        if (!container) return;

        const objBtns = container.querySelectorAll('.blueprint-obj-btn');
        const stageBtns = container.querySelectorAll('.blueprint-stage-btn');
        const moduleChips = container.querySelectorAll('.blueprint-module-chip');

        // Objective selection
        objBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                objBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedObjective = btn.getAttribute('data-obj') || 'web3d';
                updateBlueprintDisplay();
            });
        });

        // Stage selection
        stageBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                stageBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedStage = btn.getAttribute('data-stage') || 'scaleup';
                updateBlueprintDisplay();
            });
        });

        // Modules toggle
        moduleChips.forEach(chip => {
            const modKey = chip.getAttribute('data-module');
            chip.addEventListener('click', () => {
                if (selectedModules.has(modKey)) {
                    selectedModules.delete(modKey);
                    chip.classList.remove('selected');
                } else {
                    selectedModules.add(modKey);
                    chip.classList.add('selected');
                }
                updateBlueprintDisplay();
            });
        });

        // Initial render
        updateBlueprintDisplay();
    }

    function updateBlueprintDisplay() {
        const archTitleEl = document.getElementById('bp-arch-title');
        const matchBadgeEl = document.getElementById('bp-match-badge');
        const timelineBadgeEl = document.getElementById('bp-timeline-badge');
        const stackTagsEl = document.getElementById('bp-stack-tags');
        const deliverablesListEl = document.getElementById('bp-deliverables-list');
        const whatsappBtn = document.getElementById('bp-whatsapp-btn');

        const currentObj = blueprintData.objectives[selectedObjective] || blueprintData.objectives.web3d;
        const currentStage = blueprintData.stages[selectedStage] || blueprintData.stages.scaleup;

        if (archTitleEl) {
            archTitleEl.textContent = currentObj.archTitle;
        }

        if (matchBadgeEl) {
            matchBadgeEl.textContent = currentObj.match;
        }

        if (timelineBadgeEl) {
            timelineBadgeEl.textContent = currentObj.timeline;
        }

        if (stackTagsEl) {
            stackTagsEl.innerHTML = '';
            
            // Base tech stack tags
            currentObj.stack.forEach(tech => {
                const tag = document.createElement('span');
                tag.className = 'bento-tag';
                tag.style.borderColor = 'rgba(242, 5, 226, 0.4)';
                tag.style.background = 'rgba(242, 5, 226, 0.08)';
                tag.textContent = tech;
                stackTagsEl.appendChild(tag);
            });

            // Extra modules tags
            selectedModules.forEach(modKey => {
                const mod = blueprintData.modules[modKey];
                if (mod && !currentObj.stack.includes(mod.tag)) {
                    const tag = document.createElement('span');
                    tag.className = 'bento-tag';
                    tag.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                    tag.style.background = 'rgba(147, 51, 234, 0.12)';
                    tag.textContent = `+ ${mod.tag}`;
                    stackTagsEl.appendChild(tag);
                }
            });
        }

        if (deliverablesListEl) {
            deliverablesListEl.innerHTML = '';
            currentObj.deliverables.forEach(item => {
                const li = document.createElement('li');
                li.className = 'blueprint-deliverable-item';
                li.innerHTML = `
                    <span class="blueprint-phase-badge">${item.phase}</span>
                    <div>${item.text}</div>
                `;
                deliverablesListEl.appendChild(li);
            });
        }

        if (whatsappBtn) {
            const moduleNames = Array.from(selectedModules).map(k => blueprintData.modules[k]?.name).filter(Boolean);
            const msg = `¡Hola Pixy! He configurado mi Blueprint Digital en Pixy Agency:%0A%0A` +
                `• *Objetivo:* ${currentObj.name}%0A` +
                `• *Etapa de Marca:* ${currentStage.name}%0A` +
                `• *Módulos:* ${moduleNames.length ? moduleNames.join(', ') : 'Estándar'}%0A` +
                `• *Tiempo Estimado:* ${currentObj.timeline}%0A%0A` +
                `Quiero coordinar una sesión estratégica de kickoff de 20 minutos.`;
            
            whatsappBtn.href = `https://wa.me/573001234567?text=${msg}`;
        }
    }

    // Initialize 3D Interactive Workflow Slider
    function initWorkflowSlider() {
        const track = document.getElementById('workflow-track');
        if (!track) return;

        const slides = track.querySelectorAll('.workflow-slide');
        const prevBtn = document.getElementById('workflow-prev');
        const nextBtn = document.getElementById('workflow-next');
        const dotsContainer = document.getElementById('workflow-dots');
        if (!slides.length) return;

        let currentIndex = 0;
        const isMobile = window.innerWidth <= 992;
        const maxIndex = isMobile ? slides.length - 1 : slides.length - 2;

        function updateSlider() {
            const slideWidth = slides[0].offsetWidth + 24; // width + gap
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.workflow-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentIndex);
                });
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
                updateSlider();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                updateSlider();
            });
        }

        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.workflow-dot');
            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    currentIndex = Math.min(idx, maxIndex);
                    updateSlider();
                });
            });
        }

        // Auto-slide every 4.5 seconds
        let autoSlide = setInterval(() => {
            currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
            updateSlider();
        }, 4500);

        // Pause auto-slide on hover
        track.addEventListener('mouseenter', () => clearInterval(autoSlide));
        track.addEventListener('mouseleave', () => {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => {
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                updateSlider();
            }, 4500);
        });

        // Touch swipe support
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
            if (diff > 50) {
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
                updateSlider();
            } else if (diff < -50) {
                currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
                updateSlider();
            }
            isDragging = false;
        }, { passive: true });

        window.addEventListener('resize', () => {
            updateSlider();
        });

        updateSlider();
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

    // Parallax GSAP for Astronaut & Droid Orb Hero (Gradual Zoom + Downward Motion + Soft Fade)
    function initAgencyParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const astroWrapper = document.querySelector('.agency-hero-astronaut-wrapper') || document.querySelector('.agency-hero-astronaut');
        const orbWrapper = document.querySelector('.hero-hand-orb-wrapper') || document.querySelector('.hero-hand-orb');
        const glow = document.querySelector('.agency-visual-glow');

        // Astronaut: Extended scroll distance, maintains visibility longer and fades out gently
        if (astroWrapper) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: '.agency-hero-section',
                    start: 'top top',
                    end: '+=750',
                    scrub: 1.2
                }
            })
            .to(astroWrapper, {
                y: 100,
                scale: 1.18,
                opacity: 0.95,
                duration: 0.55,
                ease: 'none'
            })
            .to(astroWrapper, {
                y: 190,
                scale: 1.30,
                opacity: 0,
                duration: 0.45,
                ease: 'power1.inOut'
            });
        }

        // Droid Orb: Pronounced zoom, stays visible longer, then smooth progressive fadeout
        if (orbWrapper) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: '.agency-hero-section',
                    start: 'top top',
                    end: '+=800',
                    scrub: 1.0
                }
            })
            .to(orbWrapper, {
                y: 150,
                x: -50,
                scale: 1.8,
                opacity: 0.95,
                duration: 0.55,
                ease: 'none'
            })
            .to(orbWrapper, {
                y: 280,
                x: -95,
                scale: 2.5,
                opacity: 0,
                duration: 0.45,
                ease: 'power1.inOut'
            });
        }

        if (glow) {
            gsap.to(glow, {
                scrollTrigger: {
                    trigger: '.agency-hero-section',
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

    // GSAP Entrance Animation for Agency Hero
    function initAgencyHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const hero = document.querySelector('.agency-hero-section');
        if (!hero) return;

        const content = document.querySelector('.agency-hero-content');
        const astroWrapper = document.querySelector('.agency-hero-astronaut-wrapper');
        const orbWrapper = document.querySelector('.hero-hand-orb-wrapper');
        const glow = document.querySelector('.agency-visual-glow');

        // Timeline for seamless entrance animation
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (content) {
            tl.from(content.children, {
                y: 40,
                opacity: 0,
                duration: 1.1,
                stagger: 0.12
            });
        }

        if (glow) {
            tl.from(glow, {
                scale: 0.3,
                opacity: 0,
                duration: 1.6,
                ease: 'power2.out'
            }, '<');
        }

        if (astroWrapper) {
            tl.from(astroWrapper, {
                y: 60,
                scale: 0.8,
                opacity: 0,
                duration: 1.4,
                ease: 'power2.out'
            }, '-=0.9');
        }

        if (orbWrapper) {
            tl.from(orbWrapper, {
                x: -50,
                y: 35,
                scale: 0.4,
                opacity: 0,
                duration: 1.2,
                ease: 'back.out(1.6)'
            }, '-=0.9');
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAgencyHeroEntrance();
            initBlueprintConfigurator();
            initWorkflowSlider();
            initPortfolioFilters();
            initAgencyParallax();
        });
    } else {
        initAgencyHeroEntrance();
        initBlueprintConfigurator();
        initWorkflowSlider();
        initPortfolioFilters();
        initAgencyParallax();
    }

})();
