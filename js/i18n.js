/**
 * PIXY I18N ENGINE
 * Client-side language switcher with nested key lookup,
 * input placeholder translation, and real-time custom event dispatching.
 */
document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('pixy_lang') || 'es';
    let currentTranslations = {};

    // Initial Load
    loadLanguage(currentLang);
    updateToggleUI(currentLang);

    // Toggle Event
    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.preventDefault();
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('pixy_lang', currentLang);
            loadLanguage(currentLang);
            updateToggleUI(currentLang);
        });
    }

    async function loadLanguage(lang) {
        try {
            let response = null;
            // 1. Try root-relative
            try {
                response = await fetch(`/locales/${lang}.json`);
            } catch (e) { }

            // 2. Try relative based on path
            if (!response || !response.ok) {
                try {
                    const isSubfolder = window.location.pathname.includes('/agency/');
                    const rel = isSubfolder ? `../locales/${lang}.json` : `locales/${lang}.json`;
                    response = await fetch(rel);
                } catch (e) { }
            }

            // 3. Fallbacks
            if (!response || !response.ok) {
                try { response = await fetch(`locales/${lang}.json`); } catch (e) { }
            }
            if (!response || !response.ok) {
                try { response = await fetch(`../locales/${lang}.json`); } catch (e) { }
            }

            if (!response || !response.ok) {
                throw new Error(`Could not load ${lang}.json`);
            }

            const translations = await response.json();
            currentTranslations = translations;
            applyTranslations(translations);
            document.documentElement.lang = lang;

            // Notify dynamic components (Benchmark, Calculators, etc.)
            window.dispatchEvent(new CustomEvent('pixy:langChange', {
                detail: { lang, translations }
            }));
        } catch (error) {
            console.error('Error loading language:', error);
        }
    }

    function applyTranslations(translations) {
        // 1. Standard text and inputs
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = getNestedTranslation(translations, key);

            if (translation !== undefined && translation !== null) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'submit' || el.type === 'button') {
                        el.value = translation;
                    } else {
                        el.placeholder = translation;
                    }
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        // 2. Dedicated placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = getNestedTranslation(translations, key);
            if (translation !== undefined && translation !== null) {
                el.placeholder = translation;
            }
        });

        // 3. Titles and Aria labels
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = getNestedTranslation(translations, key);
            if (translation !== undefined && translation !== null) {
                el.title = translation;
            }
        });

        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = getNestedTranslation(translations, key);
            if (translation !== undefined && translation !== null) {
                el.setAttribute('aria-label', translation);
            }
        });
    }

    function getNestedTranslation(obj, p) {
        if (!p || !obj) return undefined;
        return p.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
    }

    function updateToggleUI(lang) {
        if (langText) {
            langText.textContent = lang.toUpperCase();
        }
    }

    // Expose global helper
    window.pixyI18n = {
        getCurrentLang: () => currentLang,
        getTranslations: () => currentTranslations,
        t: (key) => getNestedTranslation(currentTranslations, key),
        loadLanguage: (lang) => {
            currentLang = lang;
            localStorage.setItem('pixy_lang', lang);
            loadLanguage(lang);
            updateToggleUI(lang);
        }
    };
});
