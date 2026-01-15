// Pixy Website - Minimal JavaScript
// Only essential functionality

document.addEventListener('DOMContentLoaded', function () {
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

    // Add loaded class for animations
    document.body.classList.add('loaded');

    // Console easter egg
    console.log('%c🚀 Pixy', 'font-size: 24px; font-weight: bold; color: #f205e2;');
    console.log('%cBuilding the future of business management', 'color: #9ca3af;');
});
