document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('pixy_lang') || 'es';

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
            applyTranslations(translations);
            document.documentElement.lang = lang;
        } catch (error) {
            console.error('Error loading language:', error);
        }
    }

    function applyTranslations(translations) {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = getNestedTranslation(translations, key);

            if (translation !== undefined && translation !== null) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.innerHTML = translation;
                }
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
});
