/**
 * Pixy AI Solutions Architect - Intelligent Conversational Engine
 * Multi-Turn Memory + Deep Semantic Intent Analysis + Dynamic Follow-Up Chips + Plug-and-Play Gemini API
 */

(function () {
    'use strict';

    // Conversational state
    const state = {
        turnCount: 0,
        history: [],
        currentTopic: null,
        userNiche: null
    };

    function getLang() {
        if (window.i18n && typeof window.i18n.getCurrentLang === 'function') {
            return window.i18n.getCurrentLang();
        }
        return document.documentElement.lang === 'en' ? 'en' : 'es';
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Knowledge Base & Dynamic Blueprint Templates
    const BLUEPRINTS = {
        ecommerce: {
            es: {
                space: "E-Commerce & WhatsApp Conversational Checkout",
                stack: ["Shopify Headless / Next.js", "WhatsApp Cloud API", "Catalog Sync Engine", "Pasarelas Locales (Wompi/Bold/Stripe)"],
                impact: "+35% en carritos recuperados y tiempo de respuesta inferior a 3 segundos.",
                delivery: "7 a 12 días hábiles",
                wa_msg: "Hola Pixy, vi la arquitectura de E-Commerce & Checkout en su sitio web y quiero implementarla en mi negocio."
            },
            en: {
                space: "E-Commerce & WhatsApp Conversational Checkout",
                stack: ["Shopify Headless / Next.js", "WhatsApp Cloud API", "Catalog Sync Engine", "Local Gateways (Wompi/Bold/Stripe)"],
                impact: "+35% cart recovery rate and sub-3-second customer response time.",
                delivery: "7 to 12 business days",
                wa_msg: "Hi Pixy, I saw the E-Commerce & Checkout architecture on your website and want to implement it in my business."
            }
        },
        agency: {
            es: {
                space: "Agency Space & Dedicated Design Department",
                stack: ["Portal Multi-Tenant de Clientes", "Suscripción Diseño Dedicado", "Figma Design System", "Retainers Automatizados"],
                impact: "Ahorro de hasta 18h semanales por cuenta y entregas en sprints de 24-48 horas.",
                delivery: "Inicio inmediato en 24h",
                wa_msg: "Hola Pixy, me interesa conocer los planes del Departamento de Diseño Dedicado y Agency Space."
            },
            en: {
                space: "Agency Space & Dedicated Design Department",
                stack: ["Multi-Tenant Client Portal", "Dedicated Design Subscription", "Figma Design System", "Automated Retainers"],
                impact: "Saves up to 18h weekly per account with sprint turnaround times of 24-48 hours.",
                delivery: "Immediate kickoff within 24h",
                wa_msg: "Hi Pixy, I am interested in the Dedicated Design Department plans and Agency Space."
            }
        },
        resto: {
            es: {
                space: "Hospitality & Pedidos Directos 0% Comisión",
                stack: ["Menú Digital QR Interactivo", "Toma de Pedidos WhatsApp API", "Kitchen Display System (KDS)", "Fidelización CRM"],
                impact: "Recuperación de 15% a 30% en comisiones de terceros y base de clientes 100% propia.",
                delivery: "5 a 9 días hábiles",
                wa_msg: "Hola Pixy, quiero digitalizar mi restaurante con menú QR interactivo y pedidos por WhatsApp sin comisiones."
            },
            en: {
                space: "Hospitality & Direct 0% Commission Orders",
                stack: ["Interactive QR Digital Menu", "WhatsApp API Direct Orders", "Kitchen Display System (KDS)", "CRM Loyalty"],
                impact: "Reclaim 15% to 30% in aggregator commissions and build your own 100% first-party database.",
                delivery: "5 to 9 business days",
                wa_msg: "Hi Pixy, I want to deploy direct QR ordering and commission-free WhatsApp delivery for my restaurant."
            }
        },
        realestate: {
            es: {
                space: "Real Estate & Bot Calificador 24/7",
                stack: ["Catálogo Inmobiliario Interactivo", "Bot Calificador WhatsApp", "Agendamiento Automático de Visitas", "CRM Pixy Spaces"],
                impact: "Atención de prospectos en < 10 segundos y triplicación en visitas coordinadas.",
                delivery: "8 a 14 días hábiles",
                wa_msg: "Hola Pixy, quiero implementar el catálogo interactivo y calificador de leads en WhatsApp para mi inmobiliaria."
            },
            en: {
                space: "Real Estate & 24/7 Qualification Bot",
                stack: ["Interactive Property Showcase", "WhatsApp Lead Qualifier Bot", "Automated Viewing Calendar", "Pixy Spaces CRM"],
                impact: "Sub-10-second buyer engagement and 3x booked viewing tours.",
                delivery: "8 to 14 business days",
                wa_msg: "Hi Pixy, I want to deploy the Real Estate interactive catalog and WhatsApp lead qualification bot."
            }
        },
        saas: {
            es: {
                space: "Core Unified Architecture & Cloud Consolidation",
                stack: ["Next.js / Tailwind / GSAP", "Arquitectura Monolito Modular", "Single Sign-On (SSO)", "Pixy Spaces Custom Stack"],
                impact: "Reducción de hasta un 50% en licencias de software dispersas y velocidad de carga de 0.6s.",
                delivery: "14 a 21 días hábiles",
                wa_msg: "Hola Pixy, queremos evaluar la consolidación de nuestro stack en una arquitectura moderna de software."
            },
            en: {
                space: "Core Unified Architecture & Cloud Consolidation",
                stack: ["Next.js / Tailwind / GSAP", "Modular Core Architecture", "Single Sign-On (SSO)", "Pixy Spaces Custom Stack"],
                impact: "Up to 50% reduction in SaaS tool sprawl costs and extreme 0.6s page load speed.",
                delivery: "14 to 21 business days",
                wa_msg: "Hi Pixy, we want to assess consolidating our software stack into a modern unified architecture."
            }
        },
        automation: {
            es: {
                space: "WhatsApp Cloud API & Autonomous AI Workflows",
                stack: ["WhatsApp Cloud API Oficial", "Webhooks & Make/n8n Engine", "IA de Enrutamiento de Leads", "Integración ERP / CRM"],
                impact: "Atención y cierre de ventas 24/7 en piloto automático sin contratar más agentes.",
                delivery: "5 a 10 días hábiles",
                wa_msg: "Hola Pixy, quiero automatizar los flujos de ventas y atención al cliente con WhatsApp API e IA."
            },
            en: {
                space: "WhatsApp Cloud API & Autonomous AI Workflows",
                stack: ["Official WhatsApp Cloud API", "Webhooks & Make/n8n Engine", "AI Lead Routing Engine", "ERP / CRM Integration"],
                impact: "24/7 automated sales and customer qualification without increasing headcount.",
                delivery: "5 to 10 business days",
                wa_msg: "Hi Pixy, I want to automate our sales and customer support flows with WhatsApp API and AI."
            }
        }
    };

    // Semantic Intent Classification
    function analyzeIntent(text) {
        const lower = text.toLowerCase();

        // 1. Greetings & Identity
        if (/^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey|hello|hi|saludos|quien eres|qui[eé]n eres|que haces|qu[eé] haces|ayuda)/i.test(lower)) {
            return { type: 'greeting' };
        }

        // 2. Pricing & Plans
        if (/cu[aá]nto cuesta|cu[aá]nto vale|precio|precios|costo|costos|tarifa|tarifas|presupuesto|cotizar|planes|suscripci[oó]n|cuanto cobran|how much|price|pricing|cost/i.test(lower)) {
            return { type: 'pricing' };
        }

        // 3. Timelines & Delivery
        if (/cu[aá]nto tardan|cu[aá]nto se demora|tiempo|tiempos|plazos|cu[aá]ndo entregan|duraci[oó]n|entrega|how long|timeline|turnaround/i.test(lower)) {
            return { type: 'timeline' };
        }

        // 4. E-Commerce
        if (/tienda|ropa|calzado|joyas|moda|producto|productos|stock|inventario|carrito|checkout|shopify|woocommerce|ecommerce|e-commerce|pasarela|wompi|bold|stripe|vender online/i.test(lower)) {
            return { type: 'domain', scenario: 'ecommerce' };
        }

        // 5. Restaurants & Hospitality
        if (/restaurante|comida|platos|carta|men[uú]|pedidos|delivery|rappi|uber|mesa|cocina|cafeter[ií]a|bar|food/i.test(lower)) {
            return { type: 'domain', scenario: 'resto' };
        }

        // 6. Real Estate
        if (/inmobiliaria|apartamento|casa|lote|propiedad|propiedades|real estate|inmueble|broker|arriendo|alquiler|constructora/i.test(lower)) {
            return { type: 'domain', scenario: 'realestate' };
        }

        // 7. Agency / Services / B2B
        if (/agencia|servicios|abogado|consultor|consultor[ií]a|retainer|dise[nñ]o dedicado|equipo dedicado|horas|entregables|marketing/i.test(lower)) {
            return { type: 'domain', scenario: 'agency' };
        }

        // 8. Automation & WhatsApp
        if (/automatiz|whatsapp|bot|chatbot|crm|n8n|make|leads|ventas por chat|respuestas autom[aá]ticas/i.test(lower)) {
            return { type: 'domain', scenario: 'automation' };
        }

        // 9. SaaS & Web Apps
        if (/saas|plataforma|software|app|dashboard|portal|startup|mvp|tecnolog[ií]a/i.test(lower)) {
            return { type: 'domain', scenario: 'saas' };
        }

        // 10. General Custom Business Query
        return { type: 'custom', raw: text };
    }

    // Dynamic Contextual Chip Suggestions
    const CHIP_SUGGESTIONS = {
        greeting: {
            es: [
                { label: "Tengo una tienda online", text: "Tengo una tienda online y quiero mejorar mis conversiones y checkout" },
                { label: "Automatizar WhatsApp", text: "Quiero automatizar la atención y ventas por WhatsApp" },
                { label: "¿Cuánto cuesta un proyecto?", text: "¿Cuáles son sus precios y modelos de trabajo?" },
                { label: "Rediseño de marca & Web", text: "Necesitamos un rediseño completo de identidad y sitio web" }
            ],
            en: [
                { label: "I have an online store", text: "I have an e-commerce store and want to optimize checkout and conversion" },
                { label: "Automate WhatsApp", text: "I want to automate customer engagement and sales on WhatsApp" },
                { label: "How much does it cost?", text: "What are your pricing tiers and engagement models?" },
                { label: "Brand & Web Redesign", text: "We need a complete brand identity and high-performance website redesign" }
            ]
        },
        pricing: {
            es: [
                { label: "Departamento de Diseño Dedicado", text: "¿Cómo funciona el Departamento de Diseño Dedicado?" },
                { label: "Proyectos web a medida", text: "¿Qué incluye un desarrollo web o funnel a medida?" },
                { label: "Cotizar por WhatsApp", text: "Quiero cotizar mi proyecto directamente por WhatsApp con un asesor" }
            ],
            en: [
                { label: "Dedicated Design Dept", text: "How does the Dedicated Design Department subscription work?" },
                { label: "Custom Web Projects", text: "What does a custom web or funnel sprint include?" },
                { label: "Quote on WhatsApp", text: "I want to request a custom quote directly via WhatsApp" }
            ]
        },
        timeline: {
            es: [
                { label: "¿Cómo iniciamos?", text: "¿Cuál es el proceso para iniciar un proyecto con Pixy?" },
                { label: "Ver casos de éxito", text: "¿Dónde puedo ver proyectos similares que hayan desarrollado?" },
                { label: "Agendar sesión de 15 min", text: "Quiero agendar una llamada de 15 minutos para estructurar mi proyecto" }
            ],
            en: [
                { label: "How do we start?", text: "What is the onboarding process to start working with Pixy?" },
                { label: "View Case Studies", text: "Where can I see portfolio case studies of previous work?" },
                { label: "Book 15-min Call", text: "I want to schedule a 15-minute scoping call for my project" }
            ]
        },
        domain: {
            es: [
                { label: "¿Cuánto tiempo toma?", text: "¿En cuánto tiempo entregan esta arquitectura implementada?" },
                { label: "¿Qué pasarelas soportan?", text: "¿Qué pasarelas de pago e integraciones tienen disponibles?" },
                { label: "Hablar con un Asesor", text: "Quiero hablar con un arquitecto de soluciones por WhatsApp" }
            ],
            en: [
                { label: "What is the delivery time?", text: "How long does this architecture take to deploy?" },
                { label: "Supported Gateways?", text: "What payment gateways and integrations are supported?" },
                { label: "Talk with an Advisor", text: "I want to discuss this architecture on WhatsApp" }
            ]
        }
    };

    // Google Gemini API caller (Plug & Play)
    async function queryGemini(prompt, history) {
        const apiKey = window.PIXY_GEMINI_API_KEY || localStorage.getItem('pixy_gemini_key');
        if (!apiKey) return null;

        try {
            const systemInstruction = `Eres el Arquitecto de Soluciones de Pixy (agencia de élite de diseño gráfico, desarrollo web ultra-rápido en JAMstack/GSAP, automatizaciones con WhatsApp Cloud API y la suite de software Pixy Spaces).
Tu objetivo es asesorar a dueños de negocio, directores de marketing y fundadores con respuestas ejecutivas, precisas, persuasivas y de alto nivel técnico.
Explica qué arquitectura técnica y diseño necesitan, tiempos de entrega realistas (sprints de 24-48h para diseño, 7-14 días para webs) y enfoca siempre la respuesta en el retorno de inversión y conversión.
Mantén las respuestas concisas (máximo 2 párrafos concisos) y en tono profesional y futurista.`;

            const contents = [];
            history.forEach(h => {
                contents.push({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.text }]
                });
            });
            contents.push({
                role: 'user',
                parts: [{ text: prompt }]
            });

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                })
            });

            if (!res.ok) return null;
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (e) {
            console.warn('[Pixy AI] Gemini API fallback to local semantic engine:', e.message);
            return null;
        }
    }

    // Local Generative Reasoner (100% Reliable Offline Fallback)
    function generateLocalResponse(intent, userText, lang) {
        if (intent.type === 'greeting') {
            const text = lang === 'en'
                ? "Hello! 👋 I am your **Pixy Solutions Architect**. I can analyze your business model, design your technical architecture (high-conversion web, WhatsApp automation, or your own dedicated design team), and estimate deliverables and timelines. What is your business model or what objective are you tackling today?"
                : "¡Hola! 👋 Soy tu **Arquitecto de Soluciones Pixy**. Puedo diagnosticar tu modelo de negocio, estructurar la arquitectura técnica ideal (web de alta conversión, automatización en WhatsApp o tu departamento de diseño dedicado) y proyectar tiempos de entrega. ¿De qué trata tu negocio o qué reto buscas resolver hoy?";
            return {
                text,
                chips: CHIP_SUGGESTIONS.greeting[lang],
                blueprint: null
            };
        }

        if (intent.type === 'pricing') {
            const text = lang === 'en'
                ? "At Pixy, we operate through two transparent models: **1) Dedicated Design Department**, a flat monthly retainer with unlimited requests, 24-48h turnaround, and no long-term contracts; and **2) Custom Engineering Sprints**, fixed-scope builds for websites, funnels, and platforms delivered in 7 to 14 days with guaranteed performance."
                : "En Pixy operamos con dos modelos transparentes: **1) Departamento de Diseño Dedicado**, una suscripción mensual con solicitudes ilimitadas, entregas en 24-48h y sin cláusulas de permanencia; y **2) Sprints de Ingeniería a Medida**, proyectos con alcance cerrado para desarrollo web, funnels y plataformas en 7 a 14 días con garantía de velocidad.";
            return {
                text,
                chips: CHIP_SUGGESTIONS.pricing[lang],
                blueprint: BLUEPRINTS.agency[lang]
            };
        }

        if (intent.type === 'timeline') {
            const text = lang === 'en'
                ? "We work in rapid agile sprints: creative assets and brand deliverables are ready in **24 to 48 hours**. Complete high-converting JAMstack websites and WhatsApp checkout funnels launch in **7 to 14 business days**, while full SaaS architectures deploy in 3-4 weeks with continuous functional milestones."
                : "Trabajamos en sprints ágiles de alta velocidad: piezas creativas y de diseño se entregan en **24 a 48 horas**. Sitios web JAMstack de alta conversión y funnels de WhatsApp se lanzan en **7 a 14 días hábiles**, mientras que arquitecturas SaaS complejas se despliegan en 3 a 4 semanas por fases funcionales.";
            return {
                text,
                chips: CHIP_SUGGESTIONS.timeline[lang],
                blueprint: null
            };
        }

        if (intent.scenario && BLUEPRINTS[intent.scenario]) {
            const bp = BLUEPRINTS[intent.scenario][lang];
            const text = lang === 'en'
                ? `Here is your specialized architectural blueprint for **${bp.space}**. Designed to eliminate friction points, automate customer touchpoints, and scale conversion rapidly.`
                : `Aquí tienes la arquitectura especializada para **${bp.space}**. Diseñada para eliminar cuellos de botella operativos, acelerar conversiones y cerrar clientes en piloto automático.`;
            return {
                text,
                chips: CHIP_SUGGESTIONS.domain[lang],
                blueprint: bp
            };
        }

        // Custom Business Case
        const bp = {
            space: lang === 'en' ? "Tailored Growth & Cloud Architecture" : "Arquitectura de Crecimiento a Medida",
            stack: [
                "Diagnóstico Estratégico 360",
                "Figma High-End UI/UX",
                "JAMstack Ultra-Speed (0.6s)",
                "WhatsApp Cloud API & CRM"
            ],
            impact: lang === 'en'
                ? "Clear operational blueprint, elimination of manual friction, and conversion readiness in 10-14 days."
                : "Eliminación de fricción manual, aumento de conversión y arquitectura lista en 10 a 14 días hábiles.",
            delivery: "7 a 14 días hábiles",
            wa_msg: `Hola Pixy, describí mi negocio en su sitio web: "${userText.substring(0, 80)}..." y quiero estructurar la propuesta de implementación.`
        };

        const text = lang === 'en'
            ? `Based on your requirements (**"${escapeHtml(userText.substring(0, 60))}..."**), we recommend a hybrid architecture combining high-speed custom frontend engineering with automated lead capture on WhatsApp and Pixy Spaces CRM.`
            : `Analizando tu caso (**"${escapeHtml(userText.substring(0, 60))}..."**), tu solución ideal requiere una arquitectura híbrida: desarrollo web JAMstack de velocidad extrema combinado con captura y cierre automatizado en WhatsApp y el CRM Pixy Spaces.`;

        return {
            text,
            chips: CHIP_SUGGESTIONS.domain[lang],
            blueprint: bp
        };
    }

    function initAssistant() {
        const wrapper = document.getElementById('pixy-assistant');
        const trigger = document.getElementById('pixy-orb-trigger');
        const chatStream = document.getElementById('pixy-chat-stream');
        const chatScroll = document.getElementById('pixy-chat-scroll');
        const inputField = document.getElementById('pixy-chat-input');
        const sendBtn = document.getElementById('pixy-chat-send');
        const chipsContainer = document.getElementById('pixy-chips-container');
        const inputOrb = document.getElementById('v.a.o.');

        if (!wrapper || !trigger) return;

        let isTyping = false;

        function openChat() {
            if (inputOrb && !inputOrb.checked) inputOrb.checked = true;
            wrapper.classList.add('is-open');
            if (inputField) {
                setTimeout(() => inputField.focus(), 350);
            }
        }

        function closeChat() {
            if (inputOrb && inputOrb.checked) inputOrb.checked = false;
            wrapper.classList.remove('is-open');
        }

        if (inputOrb) {
            inputOrb.addEventListener('change', () => {
                if (inputOrb.checked) {
                    openChat();
                } else {
                    closeChat();
                }
            });
        }

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (inputOrb) {
                inputOrb.checked = !inputOrb.checked;
                if (inputOrb.checked) {
                    openChat();
                } else {
                    closeChat();
                }
                inputOrb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && inputOrb && inputOrb.checked) {
                closeChat();
            }
        });

        function scrollToBottom() {
            if (chatScroll) {
                chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: 'smooth' });
            }
        }

        function appendUserMessage(text) {
            const bubble = document.createElement('div');
            bubble.className = 'pixy-msg-user';
            bubble.innerHTML = `<p>${escapeHtml(text)}</p>`;
            chatStream.appendChild(bubble);
            scrollToBottom();
        }

        function appendAiStream(text, onComplete) {
            isTyping = true;
            const bubble = document.createElement('div');
            bubble.className = 'pixy-msg-ai';
            bubble.innerHTML = `<p><span class="stream-text"></span><span class="chat-cursor">▍</span></p>`;
            chatStream.appendChild(bubble);
            scrollToBottom();

            const streamText = bubble.querySelector('.stream-text');
            const cursor = bubble.querySelector('.chat-cursor');
            let idx = 0;
            const speed = 12;

            function typeNext() {
                if (idx < text.length) {
                    streamText.textContent += text.charAt(idx);
                    idx++;
                    scrollToBottom();
                    setTimeout(typeNext, speed);
                } else {
                    if (cursor) cursor.remove();
                    isTyping = false;
                    if (typeof onComplete === 'function') onComplete();
                }
            }
            typeNext();
        }

        function appendBlueprint(blueprint, lang) {
            const card = document.createElement('div');
            card.className = 'pixy-chat-blueprint';
            const waUrl = 'https://wa.me/573218520846?text=' + encodeURIComponent(blueprint.wa_msg);
            const spaceLbl = lang === 'en' ? 'Architecture Blueprint:' : 'Arquitectura Recomendada:';
            const waBtnLbl = lang === 'en' ? 'Discuss on WhatsApp →' : 'Consultar por WhatsApp →';
            const timeLbl = lang === 'en' ? 'Turnaround:' : 'Tiempo estimado:';

            let tagsHtml = '';
            blueprint.stack.forEach(tag => {
                tagsHtml += `<span class="bp-tag">${escapeHtml(tag)}</span>`;
            });

            card.innerHTML = `
                <div class="bp-space-row">
                    <span>${spaceLbl}</span>
                    <span class="bp-space-pill">${escapeHtml(blueprint.space)}</span>
                </div>
                <div class="bp-tags-wrap">
                    ${tagsHtml}
                </div>
                <div style="font-size: 0.78rem; color: #34d399; font-weight: 700; margin-bottom: 6px;">
                    ⚡ ${escapeHtml(blueprint.impact)}
                </div>
                ${blueprint.delivery ? `<div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 12px;">⏱️ ${timeLbl} <strong>${escapeHtml(blueprint.delivery)}</strong></div>` : ''}
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="bp-wa-btn">
                    <span>💬</span>
                    <span>${waBtnLbl}</span>
                </a>
            `;
            chatStream.appendChild(card);
            scrollToBottom();
        }

        function renderChips(chipsList) {
            if (!chipsContainer || !chipsList || chipsList.length === 0) return;
            chipsContainer.innerHTML = '';
            chipsList.forEach(item => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pixy-chip';
                btn.textContent = item.label;
                btn.addEventListener('click', () => {
                    handlePrompt(item.text || item.label);
                });
                chipsContainer.appendChild(btn);
            });
        }

        async function handlePrompt(promptText) {
            if (!promptText || isTyping) return;

            openChat();
            appendUserMessage(promptText);

            const lang = getLang();
            state.turnCount++;
            state.history.push({ role: 'user', text: promptText });

            const intent = analyzeIntent(promptText);

            // Attempt Gemini API if key is present
            let geminiResponse = null;
            if (intent.type !== 'greeting') {
                geminiResponse = await queryGemini(promptText, state.history);
            }

            if (geminiResponse) {
                state.history.push({ role: 'model', text: geminiResponse });
                setTimeout(() => {
                    appendAiStream(geminiResponse, () => {
                        const localPlan = generateLocalResponse(intent, promptText, lang);
                        if (localPlan.blueprint) {
                            appendBlueprint(localPlan.blueprint, lang);
                        }
                        renderChips(localPlan.chips);
                    });
                }, 200);
            } else {
                const localPlan = generateLocalResponse(intent, promptText, lang);
                state.history.push({ role: 'model', text: localPlan.text });

                setTimeout(() => {
                    appendAiStream(localPlan.text, () => {
                        if (localPlan.blueprint) {
                            appendBlueprint(localPlan.blueprint, lang);
                        }
                        renderChips(localPlan.chips);
                    });
                }, 200);
            }

            if (inputField) inputField.value = '';
        }

        if (sendBtn && inputField) {
            sendBtn.addEventListener('click', () => {
                const text = inputField.value.trim();
                if (text) handlePrompt(text);
            });
            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const text = inputField.value.trim();
                    if (text) handlePrompt(text);
                }
            });
        }

        // Attach initial chips
        const initialChips = document.querySelectorAll('.pixy-chip');
        Array.prototype.forEach.call(initialChips, (chip) => {
            chip.addEventListener('click', () => {
                const scenario = chip.getAttribute('data-scenario');
                const lang = getLang();
                let prompt = "";
                if (scenario === 'ecommerce') {
                    prompt = lang === 'en' ? "E-Commerce & WhatsApp Checkout" : "E-Commerce con checkout directo en WhatsApp";
                } else if (scenario === 'agency') {
                    prompt = lang === 'en' ? "Dedicated Design Department & Agency Space" : "Planes del Departamento de Diseño Dedicado";
                } else if (scenario === 'resto') {
                    prompt = lang === 'en' ? "Direct QR Orders & 0% Commission Delivery" : "Restaurantes con menú QR y pedidos directos sin comisiones";
                } else if (scenario === 'realestate') {
                    prompt = lang === 'en' ? "Real Estate Lead Qualification & Catalog" : "Calificación de prospectos inmobiliarios y catálogo interactivo";
                } else if (scenario === 'saas') {
                    prompt = lang === 'en' ? "SaaS & Web Application Architecture" : "Arquitectura para SaaS y aplicaciones web";
                } else if (scenario === 'automation') {
                    prompt = lang === 'en' ? "WhatsApp Cloud API & Autonomous Workflows" : "Automatización de ventas y soporte con WhatsApp Cloud API";
                } else {
                    prompt = chip.textContent.trim();
                }
                handlePrompt(prompt);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAssistant);
    } else {
        initAssistant();
    }
})();
