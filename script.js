document.addEventListener('DOMContentLoaded', () => {
    // 1. Preloader logic
    const preloader = document.getElementById('preloader');
    
    // Simulate some loading time to show off the fancy preloader (Optional)
    // Normally we just wait for 'load' event on window.
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 500); // Wait half a second for dramatic effect
    });

    // 2. Sticky Header Logic
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Check initial scroll position
    handleScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle icon between bars and times (close)
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
});
