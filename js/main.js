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

    // Add scroll-based nav styling
    handleNavScroll();
    window.addEventListener('scroll', handleNavScroll);

    // Intersection Observer for fade-in animations
    initScrollAnimations();

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

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
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
