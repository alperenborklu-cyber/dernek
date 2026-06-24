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

    // 2. Sticky Header & Top Bar Logic
    const header = document.getElementById('header');
    if (header) {
        // Oturum durumuna göre header butonlarını düzenleyelim
        const session = localStorage.getItem("dernek_session") ? JSON.parse(localStorage.getItem("dernek_session")) : null;
        const isSubDir = window.location.pathname.includes('/member/') || window.location.pathname.includes('/admin/');
        const prefix = isSubDir ? '../' : '';

        const headerActions = header.querySelector('.header-actions');
        if (headerActions) {
            if (session) {
                const dashboardUrl = session.role === 'admin' ? `${prefix}admin/dashboard.html` : `${prefix}member/dashboard.html`;
                const panelText = session.role === 'admin' ? 'Yönetim Paneli' : 'Üye Paneli';
                headerActions.innerHTML = `
                    <a href="${prefix}bagis-yap.html" class="btn btn-secondary"><i class="fa-solid fa-heart"></i> Bağış Yap</a>
                    <a href="${dashboardUrl}" class="btn btn-primary"><i class="fa-solid fa-gauge"></i> ${panelText}</a>
                    <button class="btn btn-danger btn-logout-trigger" style="padding: 10px; margin-left: 8px; border-radius: 50%; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; background-color: #ef4444; color: white; border: none; cursor: pointer;" title="Çıkış Yap"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
                    <button class="mobile-menu-btn"><i class="fa-solid fa-bars"></i></button>
                `;
            } else {
                headerActions.innerHTML = `
                    <a href="${prefix}bagis-yap.html" class="btn btn-secondary"><i class="fa-solid fa-heart"></i> Bağış Yap</a>
                    <a href="${prefix}login.html" class="btn btn-secondary" style="margin-right: 8px;"><i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap</a>
                    <a href="${prefix}uyelik.html" class="btn btn-primary">Üye Ol</a>
                    <button class="mobile-menu-btn"><i class="fa-solid fa-bars"></i></button>
                `;
            }
        }

        // Create and prepend top bar
        const topBar = document.createElement('div');
        topBar.className = 'header-top-bar';
        topBar.innerHTML = `
            <div class="container top-bar-container">
                <div class="top-bar-left">
                    <span><i class="fa-solid fa-phone"></i> +90 (312) 444 03 93</span>
                    <span><i class="fa-solid fa-envelope"></i> info@dernek.org.tr</span>
                    <span><i class="fa-solid fa-location-dot"></i> Ankara, Türkiye</span>
                </div>
                <div class="top-bar-right">
                    <div class="accessibility-options">
                        <button id="dark-mode-toggle" title="Gece Modu" aria-label="Gece Modu"><i class="fa-solid fa-moon"></i> Gece Modu</button>
                        <button id="text-increase" title="Yazı Boyutunu Artır" aria-label="Yazı Boyutunu Artır"><i class="fa-solid fa-plus"></i> A</button>
                        <button id="text-decrease" title="Yazı Boyutunu Azalt" aria-label="Yazı Boyutunu Azalt"><i class="fa-solid fa-minus"></i> A</button>
                    </div>
                    <div class="top-bar-socials">
                        <a href="#" target="_blank" title="Facebook" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#" target="_blank" title="X (Twitter)" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="#" target="_blank" title="Instagram" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" target="_blank" title="YouTube" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
            </div>
        `;
        header.insertBefore(topBar, header.firstChild);

        // Dark Mode Logic
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                localStorage.setItem('dark-mode', isDarkMode);
                
                // Update icon dynamically
                const icon = darkModeToggle.querySelector('i');
                if (isDarkMode) {
                    icon.className = 'fa-solid fa-sun';
                } else {
                    icon.className = 'fa-solid fa-moon';
                }
            });
            // Keep preference
            const savedDarkMode = localStorage.getItem('dark-mode');
            if (savedDarkMode === 'true') {
                document.body.classList.add('dark-mode');
                const icon = darkModeToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-sun';
            }
        }

        let fontSizeOffset = 0;
        const increaseBtn = document.getElementById('text-increase');
        const decreaseBtn = document.getElementById('text-decrease');
        if (increaseBtn && decreaseBtn) {
            increaseBtn.addEventListener('click', () => {
                if (fontSizeOffset < 4) {
                    fontSizeOffset += 2;
                    document.documentElement.style.fontSize = `calc(100% + ${fontSizeOffset}px)`;
                }
            });
            decreaseBtn.addEventListener('click', () => {
                if (fontSizeOffset > -2) {
                    fontSizeOffset -= 2;
                    document.documentElement.style.fontSize = `calc(100% + ${fontSizeOffset}px)`;
                }
            });
        }
    }

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
    const session = localStorage.getItem("dernek_session") ? JSON.parse(localStorage.getItem("dernek_session")) : null;
    const isSubDir = window.location.pathname.includes('/member/') || window.location.pathname.includes('/admin/');
    const prefix = isSubDir ? '../' : '';
    
    if (mobileMenuBtn) {
        // Inject mobile action buttons dynamically
        if (navMenu && !navMenu.querySelector('.mobile-nav-actions')) {
            const mobileActions = document.createElement('div');
            mobileActions.className = 'mobile-nav-actions';
            if (session) {
                const dashboardUrl = session.role === 'admin' ? `${prefix}admin/dashboard.html` : `${prefix}member/dashboard.html`;
                const panelText = session.role === 'admin' ? 'Yönetim Paneli' : 'Üye Paneli';
                mobileActions.innerHTML = `
                    <a href="${prefix}bagis-yap.html" class="btn btn-secondary"><i class="fa-solid fa-heart"></i> Bağış Yap</a>
                    <a href="${dashboardUrl}" class="btn btn-primary"><i class="fa-solid fa-gauge"></i> ${panelText}</a>
                    <a href="#" class="btn btn-danger btn-logout-trigger-mobile" style="background-color: #ef4444; color: white;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Çıkış Yap</a>
                `;
            } else {
                mobileActions.innerHTML = `
                    <a href="${prefix}bagis-yap.html" class="btn btn-secondary"><i class="fa-solid fa-heart"></i> Bağış Yap</a>
                    <a href="${prefix}login.html" class="btn btn-secondary"><i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap</a>
                    <a href="${prefix}uyelik.html" class="btn btn-primary">Üye Ol</a>
                `;
            }
            navMenu.appendChild(mobileActions);
        }

        // Attach logout trigger event listener
        document.querySelectorAll('.btn-logout-trigger, .btn-logout-trigger-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem("dernek_session");
                window.location.href = `${prefix}index.html`;
            });
        });

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

    // 3.5. Dropdown Toggle Logic for Mobile
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                e.preventDefault();
                const parent = toggle.parentElement;
                parent.classList.toggle('active');
            }
        });
    });

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

    // 10. Hero Background Videos Cross-Fade Loop
    const video1 = document.getElementById('hero-video-1');
    const video2 = document.getElementById('hero-video-2');

    if (video1 && video2) {
        let v1Triggered = false;
        let v2Triggered = false;

        const playVideo2 = () => {
            video2.style.opacity = '1';
            video2.play().catch(e => console.log('Video 2 play failed:', e));
            video1.style.opacity = '0';
            setTimeout(() => {
                if (v1Triggered) {
                    video1.pause();
                    video1.currentTime = 0;
                }
            }, 1500);
        };

        const playVideo1 = () => {
            video1.style.opacity = '1';
            video1.play().catch(e => console.log('Video 1 play failed:', e));
            video2.style.opacity = '0';
            setTimeout(() => {
                if (v2Triggered) {
                    video2.pause();
                    video2.currentTime = 0;
                }
            }, 1500);
        };

        video1.addEventListener('timeupdate', () => {
            if (video1.duration && !v1Triggered) {
                // Cross-fade 1.5 seconds before end
                if (video1.duration - video1.currentTime <= 1.5) {
                    v1Triggered = true;
                    v2Triggered = false;
                    playVideo2();
                }
            }
        });

        video2.addEventListener('timeupdate', () => {
            if (video2.duration && !v2Triggered) {
                // Cross-fade 1.5 seconds before end
                if (video2.duration - video2.currentTime <= 1.5) {
                    v2Triggered = true;
                    v1Triggered = false;
                    playVideo1();
                }
            }
        });

        video1.addEventListener('ended', () => {
            if (!v1Triggered) {
                v1Triggered = true;
                v2Triggered = false;
                playVideo2();
            }
        });

        video2.addEventListener('ended', () => {
            if (!v2Triggered) {
                v2Triggered = true;
                v1Triggered = false;
                playVideo1();
            }
        });
    }

    // 11. Dynamic News Page Comment System
    const newsDetailContent = document.querySelector('.news-detail-content');
    if (newsDetailContent) {
        // Identify the page ID (filename without ext)
        const pathParts = window.location.pathname.split('/');
        const pageId = pathParts[pathParts.length - 1].replace('.html', '') || 'general-news';

        // Render Comments Widget Wrapper
        const commentsWrapper = document.createElement('div');
        commentsWrapper.className = 'comments-widget-container';
        commentsWrapper.style.marginTop = '48px';
        commentsWrapper.style.paddingTop = '32px';
        commentsWrapper.style.borderTop = '1px solid var(--border-color)';

        // Render functions
        const renderComments = () => {
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const pageComments = comments.filter(c => c.targetId === pageId && c.status === 'approved');
            
            let listHtml = '';
            if (pageComments.length === 0) {
                listHtml = `<p class="no-comments-msg" style="color: var(--text-muted); font-size: 0.95rem; font-style: italic; margin-bottom: 24px;">Bu habere henüz yorum yapılmamış. İlk yorumu siz yapın!</p>`;
            } else {
                listHtml = pageComments.map(c => `
                    <div class="comment-item" style="background: var(--white); padding: 18px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                        <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: var(--text-main); font-size: 0.95rem;"><i class="fa-solid fa-user-circle" style="color: var(--primary); margin-right: 6px;"></i> ${c.authorName}</strong>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${c.date}</span>
                        </div>
                        <p style="color: var(--text-main); font-size: 0.92rem; margin: 0; line-height: 1.5;">${c.content}</p>
                    </div>
                `).join('');
            }

            const currentUser = localStorage.getItem('dernek_session') ? JSON.parse(localStorage.getItem('dernek_session')) : null;
            const isSubDir = window.location.pathname.includes('/member/') || window.location.pathname.includes('/admin/');
            const prefix = isSubDir ? '../' : '';
            let formHtml = '';

            if (currentUser && currentUser.role === 'member') {
                formHtml = `
                    <form id="commentSubmitForm" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                        <h4 style="font-size: 1.1rem; color: var(--text-main); font-family: var(--font-heading); margin-bottom: 4px;">Bir Yorum Bırakın</h4>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 4px;">
                            <span><i class="fa-solid fa-user"></i> Yazan: <strong>${currentUser.fullName}</strong></span>
                        </div>
                        <div style="position: relative;">
                            <textarea id="commentText" class="form-control" rows="3" placeholder="Yorumunuzu buraya yazın..." style="padding: 12px; border-radius: 12px; font-size: 0.92rem; width: 100%; min-height: 80px; resize: vertical;" required></textarea>
                        </div>
                        <div id="commentAlert" style="display: none; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; margin-bottom: 8px;"></div>
                        <button type="submit" class="btn btn-primary" style="align-self: flex-start; padding: 10px 20px;"><i class="fa-solid fa-paper-plane" style="margin-right: 8px;"></i> Yorum Gönder</button>
                    </form>
                `;
            } else if (currentUser && currentUser.role === 'admin') {
                formHtml = `
                    <div style="background-color: rgba(0, 92, 230, 0.05); border: 1px solid rgba(0, 92, 230, 0.2); padding: 16px; border-radius: 12px; margin-top: 24px; font-size: 0.9rem; color: var(--text-main);">
                        <i class="fa-solid fa-shield-halved" style="color: var(--primary); margin-right: 8px;"></i> Yönetici olarak giriş yaptınız. Yorumları onaylamak için lütfen <a href="${prefix}admin/dashboard.html" style="color: var(--primary); font-weight: 600; text-decoration: underline;">Yönetim Paneline</a> gidin.
                    </div>
                `;
            } else {
                formHtml = `
                    <div style="background-color: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 12px; margin-top: 24px; text-align: center; font-size: 0.92rem; color: var(--text-muted);">
                        <i class="fa-solid fa-lock" style="margin-right: 6px;"></i> Yorum yazabilmek için lütfen <a href="${prefix}login.html" style="color: var(--primary); font-weight: 600; text-decoration: underline;">giriş yapınız</a>.
                    </div>
                `;
            }

            commentsWrapper.innerHTML = `
                <h3 style="font-size: 1.5rem; color: var(--text-main); font-family: var(--font-heading); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                    Yorumlar 
                    <span style="font-size: 1rem; padding: 4px 10px; background-color: var(--border-color); border-radius: 20px; color: var(--text-muted); font-weight: 500;">${pageComments.length}</span>
                </h3>
                <div class="comments-list-wrapper">
                    ${listHtml}
                </div>
                ${formHtml}
            `;

            // Attach form submission listener
            const form = commentsWrapper.querySelector('#commentSubmitForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const text = commentsWrapper.querySelector('#commentText').value.trim();
                    if (!text) return;

                    const allComments = JSON.parse(localStorage.getItem('comments') || '[]');
                    const newComment = {
                        id: 'comm-' + Date.now(),
                        targetId: pageId,
                        authorName: currentUser.fullName,
                        authorEmail: currentUser.email,
                        content: text,
                        date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        status: 'pending'
                    };

                    allComments.push(newComment);
                    localStorage.setItem('comments', JSON.stringify(allComments));

                    commentsWrapper.querySelector('#commentText').value = '';
                    const alertBox = commentsWrapper.querySelector('#commentAlert');
                    alertBox.textContent = 'Yorumunuz başarıyla gönderildi! Yönetici onayından sonra yayınlanacaktır.';
                    alertBox.style.display = 'block';
                    
                    setTimeout(() => {
                        alertBox.style.display = 'none';
                    }, 4000);
                });
            }
        };

        renderComments();
        newsDetailContent.appendChild(commentsWrapper);
    }
});

