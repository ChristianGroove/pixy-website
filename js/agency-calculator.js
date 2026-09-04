/**
 * PIXY AGENCY - INTERACTIVE PROJECT BLUEPRINT & SCOPE CONFIGURATOR
 * Real-time digital architecture generator, tech stack mapper & roadmap generator
 * Includes 3D Workflow Slider & Parallax micro-interactions
 */

(function () {
    'use strict';

    // ============================================
    // INTERACTIVE PERFORMANCE & SPEED BENCHMARK
    // ============================================
    // ============================================
    // INTERACTIVE PERFORMANCE & SPEED BENCHMARK (BILINGUAL ES / EN)
    // ============================================
    const benchmarkScenarios = {
        es: {
            ecommerce: {
                id: 'ecommerce',
                name: 'E-Commerce & Checkout',
                legacy: {
                    url: 'tienda-convencional.com/checkout',
                    loadTime: '4.5s',
                    lighthouse: '34 / 100',
                    bounce: '64%',
                    conversion: '-38%',
                    fps: '22 FPS',
                    fpsLabel: 'Tirones & Lag',
                    status: 'Cargando scripts de checkout y plugins pesados...'
                },
                pixy: {
                    url: 'store.pixy.agency/checkout',
                    loadTime: '0.5s',
                    lighthouse: '100 / 100',
                    bounce: '+92%',
                    conversion: '+45%',
                    fps: '60 FPS',
                    fpsLabel: 'Fluidez Extrema',
                    status: 'Shopify Headless • Checkout Instantáneo < 0.5s'
                },
                conclusion: 'La arquitectura Headless de Pixy reduce el abandono de carritos en un 45% y triplica la velocidad de compra.',
                waMessage: 'Hola Pixy, quiero auditar el rendimiento y checkout de mi tienda online para migrar a su arquitectura Next-Gen.'
            },
            web3d: {
                id: 'web3d',
                name: 'Web 3D & Inmersiva',
                legacy: {
                    url: 'sitio-tradicional.com/experiencia',
                    loadTime: '5.2s',
                    lighthouse: '29 / 100',
                    bounce: '71%',
                    conversion: '-42%',
                    fps: '18 FPS',
                    fpsLabel: 'Lag Severo',
                    status: 'Overhead de render WebGL sin optimizar...'
                },
                pixy: {
                    url: 'experience.pixy.agency',
                    loadTime: '0.7s',
                    lighthouse: '98 / 100',
                    bounce: '+88%',
                    conversion: '+38%',
                    fps: '60 FPS',
                    fpsLabel: '60 FPS Sedoso',
                    status: 'Next.js 14 + WebGL + GSAP Core optimizado a 60fps'
                },
                conclusion: 'Pixy logra experiencias 3D inmersivas a 60fps reales sin sacrificar ni un milisegundo de velocidad de carga.',
                waMessage: 'Hola Pixy, busco una plataforma web inmersiva en 3D con animaciones a 60fps y carga rápida.'
            },
            landing: {
                id: 'landing',
                name: 'Landing & Campañas de Tráfico',
                legacy: {
                    url: 'landing-campaña.com',
                    loadTime: '3.9s',
                    lighthouse: '42 / 100',
                    bounce: '55%',
                    conversion: '-28%',
                    fps: '26 FPS',
                    fpsLabel: 'Fricción Móvil',
                    status: 'Bloqueo de renderizado en dispositivos móviles...'
                },
                pixy: {
                    url: 'growth.pixy.agency/lp',
                    loadTime: '0.4s',
                    lighthouse: '100 / 100',
                    bounce: '+95%',
                    conversion: '+52%',
                    fps: '60 FPS',
                    fpsLabel: 'Respuesta Inmediata',
                    status: 'Jamstack Edge CDN • Máxima rentabilidad y ROAS'
                },
                conclusion: 'Cada 100ms ganados en velocidad aumentan el ROAS publicitario hasta en un 52% al eliminar el rebote.',
                waMessage: 'Hola Pixy, quiero mejorar la velocidad y conversión de mis landing pages de adquisición publicitaria.'
            }
        },
        en: {
            ecommerce: {
                id: 'ecommerce',
                name: 'E-Commerce & Checkout',
                legacy: {
                    url: 'traditional-store.com/checkout',
                    loadTime: '4.5s',
                    lighthouse: '34 / 100',
                    bounce: '64%',
                    conversion: '-38%',
                    fps: '22 FPS',
                    fpsLabel: 'Stutter & Lag',
                    status: 'Loading checkout scripts and heavy plugins...'
                },
                pixy: {
                    url: 'store.pixy.agency/checkout',
                    loadTime: '0.5s',
                    lighthouse: '100 / 100',
                    bounce: '+92%',
                    conversion: '+45%',
                    fps: '60 FPS',
                    fpsLabel: 'Ultra Fluidity',
                    status: 'Shopify Headless • Instant Checkout < 0.5s'
                },
                conclusion: 'Pixy Headless architecture reduces cart abandonment by 45% and triples checkout speed.',
                waMessage: 'Hello Pixy, I would like to audit the performance and checkout of my online store to migrate to your Next-Gen architecture.'
            },
            web3d: {
                id: 'web3d',
                name: '3D & Immersive Web',
                legacy: {
                    url: 'legacy-website.com/experience',
                    loadTime: '5.2s',
                    lighthouse: '29 / 100',
                    bounce: '71%',
                    conversion: '-42%',
                    fps: '18 FPS',
                    fpsLabel: 'Severe Lag',
                    status: 'Unoptimized WebGL render overhead...'
                },
                pixy: {
                    url: 'experience.pixy.agency',
                    loadTime: '0.7s',
                    lighthouse: '98 / 100',
                    bounce: '+88%',
                    conversion: '+38%',
                    fps: '60 FPS',
                    fpsLabel: 'Silky 60 FPS',
                    status: 'Next.js 14 + WebGL + GSAP Core optimized at 60fps'
                },
                conclusion: 'Pixy achieves immersive 3D experiences at true 60fps without sacrificing a single millisecond of load speed.',
                waMessage: 'Hello Pixy, I am looking for an immersive 3D web platform with 60fps motion and lightning-fast load times.'
            },
            landing: {
                id: 'landing',
                name: 'Landing & Traffic Campaigns',
                legacy: {
                    url: 'legacy-landing.com',
                    loadTime: '3.9s',
                    lighthouse: '42 / 100',
                    bounce: '55%',
                    conversion: '-28%',
                    fps: '26 FPS',
                    fpsLabel: 'Mobile Friction',
                    status: 'Render-blocking JavaScript on mobile devices...'
                },
                pixy: {
                    url: 'growth.pixy.agency/lp',
                    loadTime: '0.4s',
                    lighthouse: '100 / 100',
                    bounce: '+95%',
                    conversion: '+52%',
                    fps: '60 FPS',
                    fpsLabel: 'Instant Response',
                    status: 'Jamstack Edge CDN • Maximum profitability and ROAS'
                },
                conclusion: 'Every 100ms saved in load time boosts ad ROAS by up to 52% by eliminating bounce rates.',
                waMessage: 'Hello Pixy, I want to improve the speed and conversion rate of my advertising landing pages.'
            }
        }
    };

    const simStrings = {
        es: {
            measuring: 'Midiendo Rendimiento en Vivo...',
            dnsStart: 'Iniciando handshake DNS & scripts...',
            edgeStart: 'Global Edge CDN Cache Hit...',
            pixyDone: '✓ Renderizado en {time} (100% Core Web Vitals)',
            step1: 'Descargando 48 scripts y plugins pesados...',
            step2: 'Bloqueo de hilo principal (JavaScript)...',
            step3: 'Renderizado tardío de fuentes e imágenes...',
            legacyDone: '⚠️ Carga tardía en {time} con penalización',
            repeatBtn: '⚡ Repetir Simulación de Carga'
        },
        en: {
            measuring: 'Measuring Live Performance...',
            dnsStart: 'Initiating DNS handshake & scripts...',
            edgeStart: 'Global Edge CDN Cache Hit...',
            pixyDone: '✓ Rendered in {time} (100% Core Web Vitals)',
            step1: 'Downloading 48 unoptimized scripts and heavy plugins...',
            step2: 'Main thread blocked (JavaScript execution)...',
            step3: 'Delayed render of web fonts and images...',
            legacyDone: '⚠️ Late load at {time} with SEO penalty',
            repeatBtn: '⚡ Repeat Live Simulation'
        }
    };

    let currentScenarioKey = 'ecommerce';
    let isRunningBenchmark = false;

    function getBenchmarkLang() {
        return localStorage.getItem('pixy_lang') || 'es';
    }

    function initPerformanceBenchmark() {
        const section = document.getElementById('benchmark');
        if (!section) return;

        const pills = section.querySelectorAll('.archetype-pill');
        const runBtn = document.getElementById('run-benchmark-btn');

        // Pill switches
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                if (isRunningBenchmark) return;
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentScenarioKey = pill.getAttribute('data-scenario') || 'ecommerce';
                updateBenchmarkView();
            });
        });

        // Run Benchmark Simulation
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                if (isRunningBenchmark) return;
                runBenchmarkSimulation();
            });
        }

        // Listen for global language toggle
        window.addEventListener('pixy:langChange', () => {
            updateBenchmarkView();
        });

        // Initial setup
        updateBenchmarkView();
    }

    function updateBenchmarkView() {
        const lang = getBenchmarkLang();
        const dict = benchmarkScenarios[lang] || benchmarkScenarios.es;
        const data = dict[currentScenarioKey] || dict.ecommerce;

        // Legacy elements
        const legacyUrl = document.getElementById('legacy-url');
        const legacyStatus = document.getElementById('legacy-status-text');
        const legacyFps = document.getElementById('legacy-fps');
        const legacyFpsLabel = document.querySelector('.viewport-fps-badge.legacy .fps-label');
        const legacyLoad = document.getElementById('legacy-load-time');
        const legacyLight = document.getElementById('legacy-lighthouse');
        const legacyBounce = document.getElementById('legacy-bounce');
        const legacyConv = document.getElementById('legacy-conversion');
        const legacyProgress = document.getElementById('legacy-progress');

        if (legacyUrl) legacyUrl.textContent = data.legacy.url;
        if (legacyStatus) legacyStatus.textContent = data.legacy.status;
        if (legacyFps) legacyFps.textContent = data.legacy.fps;
        if (legacyFpsLabel) legacyFpsLabel.textContent = data.legacy.fpsLabel;
        if (legacyLoad) legacyLoad.textContent = data.legacy.loadTime;
        if (legacyLight) legacyLight.textContent = data.legacy.lighthouse;
        if (legacyBounce) legacyBounce.textContent = data.legacy.bounce;
        if (legacyConv) legacyConv.textContent = data.legacy.conversion;
        if (legacyProgress) legacyProgress.style.width = '100%';

        // Pixy elements
        const pixyUrl = document.getElementById('pixy-url');
        const pixyStatus = document.getElementById('pixy-status-text');
        const pixyFps = document.getElementById('pixy-fps');
        const pixyFpsLabel = document.querySelector('.viewport-fps-badge.pixy .fps-label');
        const pixyLoad = document.getElementById('pixy-load-time');
        const pixyLight = document.getElementById('pixy-lighthouse');
        const pixyBounce = document.getElementById('pixy-bounce');
        const pixyConv = document.getElementById('pixy-conversion');
        const pixyProgress = document.getElementById('pixy-progress');

        if (pixyUrl) pixyUrl.textContent = data.pixy.url;
        if (pixyStatus) pixyStatus.textContent = data.pixy.status;
        if (pixyFps) pixyFps.textContent = data.pixy.fps;
        if (pixyFpsLabel) pixyFpsLabel.textContent = data.pixy.fpsLabel;
        if (pixyLoad) pixyLoad.textContent = data.pixy.loadTime;
        if (pixyLight) pixyLight.textContent = data.pixy.lighthouse;
        if (pixyBounce) pixyBounce.textContent = data.pixy.bounce;
        if (pixyConv) pixyConv.textContent = data.pixy.conversion;
        if (pixyProgress) pixyProgress.style.width = '100%';

        // Conclusion & WhatsApp CTA
        const summaryText = document.getElementById('benchmark-summary-text');
        const waCta = document.getElementById('benchmark-whatsapp-cta');
        if (summaryText) {
            summaryText.innerHTML = data.conclusion;
        }
        if (waCta) {
            waCta.href = `https://wa.me/573009292377?text=${encodeURIComponent(data.waMessage)}`;
        }
    }

    function runBenchmarkSimulation() {
        isRunningBenchmark = true;
        const lang = getBenchmarkLang();
        const dict = benchmarkScenarios[lang] || benchmarkScenarios.es;
        const data = dict[currentScenarioKey] || dict.ecommerce;
        const strings = simStrings[lang] || simStrings.es;

        const runBtn = document.getElementById('run-benchmark-btn');
        const resultPill = document.getElementById('benchmark-result-pill');
        const legacyProgress = document.getElementById('legacy-progress');
        const pixyProgress = document.getElementById('pixy-progress');
        const legacyStatus = document.getElementById('legacy-status-text');
        const pixyStatus = document.getElementById('pixy-status-text');
        const legacyLoad = document.getElementById('legacy-load-time');
        const pixyLoad = document.getElementById('pixy-load-time');

        if (runBtn) {
            runBtn.disabled = true;
            runBtn.style.opacity = '0.7';
            const btnText = runBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = strings.measuring;
        }
        if (resultPill) {
            resultPill.classList.remove('highlight');
        }

        // Reset bars
        if (legacyProgress) legacyProgress.style.width = '0%';
        if (pixyProgress) pixyProgress.style.width = '0%';
        if (legacyLoad) legacyLoad.textContent = '...';
        if (pixyLoad) pixyLoad.textContent = '...';
        if (legacyStatus) legacyStatus.textContent = strings.dnsStart;
        if (pixyStatus) pixyStatus.textContent = strings.edgeStart;

        // 1. Pixy Finishes Blazing Fast in 450ms
        setTimeout(() => {
            if (pixyProgress) pixyProgress.style.width = '100%';
            if (pixyStatus) pixyStatus.textContent = strings.pixyDone.replace('{time}', data.pixy.loadTime);
            if (pixyLoad) pixyLoad.textContent = data.pixy.loadTime;
        }, 450);

        // 2. Legacy Steps (Crawling)
        setTimeout(() => {
            if (legacyProgress) legacyProgress.style.width = '25%';
            if (legacyStatus) legacyStatus.textContent = strings.step1;
        }, 650);

        setTimeout(() => {
            if (legacyProgress) legacyProgress.style.width = '55%';
            if (legacyStatus) legacyStatus.textContent = strings.step2;
        }, 1300);

        setTimeout(() => {
            if (legacyProgress) legacyProgress.style.width = '80%';
            if (legacyStatus) legacyStatus.textContent = strings.step3;
        }, 1900);

        setTimeout(() => {
            if (legacyProgress) legacyProgress.style.width = '100%';
            if (legacyStatus) legacyStatus.textContent = strings.legacyDone.replace('{time}', data.legacy.loadTime);
            if (legacyLoad) legacyLoad.textContent = data.legacy.loadTime;

            if (resultPill) {
                resultPill.classList.add('highlight');
            }

            if (runBtn) {
                runBtn.disabled = false;
                runBtn.style.opacity = '1';
                const btnText = runBtn.querySelector('.btn-text');
                if (btnText) btnText.textContent = strings.repeatBtn;
            }
            isRunningBenchmark = false;
        }, 2600);
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
            initPerformanceBenchmark();
            initWorkflowSlider();
            initPortfolioFilters();
            initAgencyParallax();
        });
    } else {
        initAgencyHeroEntrance();
        initPerformanceBenchmark();
        initWorkflowSlider();
        initPortfolioFilters();
        initAgencyParallax();
    }

})();
