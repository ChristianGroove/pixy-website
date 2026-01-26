document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('pixy_lang') || 'es';

    // Initial Load
    loadLanguage(currentLang);
    updateToggleUI(currentLang);

    // Toggle Event
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('pixy_lang', currentLang);
            loadLanguage(currentLang);
            updateToggleUI(currentLang);
        });
    }

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang}.json`);

            const translations = await response.json();
            applyTranslations(translations);
            document.documentElement.lang = lang; // Update html lang attribute
        } catch (error) {
            console.error('Error loading language:', error);
        }
    }

    function applyTranslations(translations) {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = getNestedTranslation(translations, key);

            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.innerHTML = translation; // Allow HTML in translations
                }
            }
        });
    }

    function getNestedTranslation(obj, p) {
        return p.split('.').reduce((o, k) => (o || {})[k], obj);
    }

    function updateToggleUI(lang) {
        if (langText) {
            langText.textContent = lang.toUpperCase();
        }
    }
});
