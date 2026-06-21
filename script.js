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

    // 4. Accordion Logic for Mevzuat page
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Close other items
            const siblingItems = item.parentElement.querySelectorAll('.accordion-item');
            siblingItems.forEach(sibling => {
                if (sibling !== item) {
                    sibling.classList.remove('active');
                }
            });
        });
    });

    // 5. Hero Slideshow Logic
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000); // Switch every 4 seconds
    }

    // 6. Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    document.body.insertBefore(progressBar, document.body.firstChild);

    const updateProgressBar = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    };

    window.addEventListener('scroll', updateProgressBar, { passive: true });
    updateProgressBar();

    // 7. Floating Contact Widget Injection
    const contactContainer = document.createElement('div');
    contactContainer.className = 'floating-contact-container';
    contactContainer.innerHTML = `
        <a href="https://wa.me/905301234567" target="_blank" rel="noopener" class="floating-btn floating-whatsapp" data-tooltip="WhatsApp ile Ulaşın" aria-label="WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
        </a>
        <a href="tel:+903124440393" class="floating-btn floating-phone" data-tooltip="Bizi Arayın" aria-label="Telefon">
            <i class="fa-solid fa-phone"></i>
        </a>
    `;
    document.body.appendChild(contactContainer);
    // 8. Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    
    const formatNumber = (num) => {
        if (num >= 10000) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "+";
        }
        return num + "+";
    };

    const animateCount = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function: easeOutQuad
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.floor(easeProgress * target);

            el.textContent = formatNumber(currentVal);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = formatNumber(target);
            }
        };

        requestAnimationFrame(updateCount);
    };

    if (stats.length > 0) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        stats.forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    // 9. Append Dernek Kütük No to Footer
    const footerBottomP = document.querySelector('.footer-bottom p');
    if (footerBottomP) {
        // Prevent duplicate append just in case
        if (!footerBottomP.textContent.includes('06.157.157')) {
            footerBottomP.innerHTML += ' <span style="opacity: 0.8; margin-left: 8px;">| Dernek Kütük No: 06.157.157</span>';
        }
    }
});

