document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navbar = document.querySelector('.navbar');
    const backToTopButton = document.querySelector('.back-to-top');
    const mobileBreakpoint = window.matchMedia('(max-width: 768px)');

    // Detect mobile and add class to body
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }

    if (hamburger && navMenu) {
        const closeMobileMenu = () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        const openMobileMenu = () => {
            navMenu.classList.add('active');
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        hamburger.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
                return;
            }
            openMobileMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        const handleBreakpointChange = (event) => {
            if (!event.matches) {
                closeMobileMenu();
            }
        };

        if (typeof mobileBreakpoint.addEventListener === 'function') {
            mobileBreakpoint.addEventListener('change', handleBreakpointChange);
        } else if (typeof mobileBreakpoint.addListener === 'function') {
            mobileBreakpoint.addListener(handleBreakpointChange);
        }

        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target) && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    event.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    } else {
        navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    event.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Mark the current page in the nav (adds .active and aria-current)
    const setActiveNav = () => {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const target = href.split('/').pop();
            if ((target === 'index.html' && (path === '' || path === 'index.html')) || target === path) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    };

    setActiveNav();

    // Re-run on history change (in case of SPA-like navigation)
    window.addEventListener('popstate', setActiveNav);

    const revealTargets = document.querySelectorAll(
        '.impact-card, .service-card, .feature-item, .price-card, .contact-card, .contact-form-card, .faq-item, .testimonial-card, .stat-block, .hero-panel-card, .credibility-item'
    );

    revealTargets.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 350)}ms`);
    });

    if ('IntersectionObserver' in window && revealTargets.length > 0) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.18,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        revealTargets.forEach((element) => revealObserver.observe(element));
    } else {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
    }

    // Also handle simple fade-in elements (hero headlines, small copy)
    const fadeTargets = document.querySelectorAll('.fade-in');
    fadeTargets.forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 350)}ms`);
    });

    if ('IntersectionObserver' in window && fadeTargets.length > 0) {
        const fadeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        fadeTargets.forEach((el) => fadeObserver.observe(el));
    } else {
        fadeTargets.forEach((el) => el.classList.add('visible'));
    }

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 40;
        navbar?.classList.toggle('scrolled', scrolled);
        if (backToTopButton) {
            backToTopButton.classList.toggle('visible', window.scrollY > 400);
        }
    }, { passive: true });

    backToTopButton?.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            
            // Close other FAQ items to keep a clean interface
            faqButtons.forEach(btn => {
                if (btn !== button) {
                    btn.setAttribute('aria-expanded', 'false');
                    btn.closest('.faq-item')?.classList.remove('open');
                }
            });

            button.setAttribute('aria-expanded', String(!expanded));
            button.closest('.faq-item')?.classList.toggle('open', !expanded);
        });
    });

    // Policy Accordion functionality for policies.html
    const policyItems = document.querySelectorAll('.policy-item');
    if (policyItems.length > 0) {
        function openPolicyFromHash() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const target = document.getElementById(hash);
                if (target && target.classList.contains('policy-item')) {
                    policyItems.forEach(p => {
                        p.classList.remove('active');
                        p.querySelector('.policy-header')?.setAttribute('aria-expanded', 'false');
                    });
                    target.classList.add('active');
                    target.querySelector('.policy-header')?.setAttribute('aria-expanded', 'true');
                    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
            }
        }

        policyItems.forEach(item => {
            const questionBtn = item.querySelector('.policy-header');
            if (questionBtn) {
                questionBtn.addEventListener('click', () => {
                    const wasActive = item.classList.contains('active');
                    policyItems.forEach(p => p.classList.remove('active'));
                    if (!wasActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
        window.addEventListener('hashchange', openPolicyFromHash);
        if (window.location.hash) openPolicyFromHash();
    }
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const originalFormHTML = contactForm.innerHTML;
        const setupListener = (form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const name = form.querySelector('input[name="name"]')?.value.trim();
                const email = form.querySelector('input[name="email"]')?.value.trim();
                const message = form.querySelector('textarea[name="message"]')?.value.trim();
                if (!name || !email || !message) {
                    alert('Please complete all required fields.');
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                const subject = `New inquiry from ${name}`;
                const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0AMessage: ${message}`;
                window.location.href = `mailto:contact@ici-tech.com?subject=${encodeURIComponent(subject)}&body=${body}`;
                form.innerHTML = `
                    <div style="text-align:center; padding:2rem;">
                        <h3 style="color:#fff; margin-bottom:1rem;">Thank you!</h3>
                        <p style="color:#fff; margin-bottom:1rem;">Your message has been prepared in your email client. We'll review it within 24 hours.</p>
                        <button type="button" class="cta-button" id="resetForm">Send another message</button>
                    </div>
                `;
                document.getElementById('resetForm')?.addEventListener('click', () => {
                    form.innerHTML = originalFormHTML;
                    setupListener(form);
                });
            });
        };
        setupListener(contactForm);
    }

    // Rotating text animation for hero headline
    const rotatingTextEl = document.getElementById('rotatingText');
    if (rotatingTextEl) {
        const texts = [
            'One team.',
            'Built as one system.',
            'Integrated by design.',
            'Aligned from day one.'
        ];
        let currentIndex = 0;
        
        const changeText = () => {
            rotatingTextEl.style.opacity = '0';
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % texts.length;
                rotatingTextEl.textContent = texts[currentIndex];
                rotatingTextEl.style.opacity = '1';
            }, 250);
        };
        
        setInterval(changeText, 2000);
    }

    // Gallery Modal Interaction
    const galleryCards = document.querySelectorAll('.gallery-card');
    const galleryModal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDescription');

    if (galleryCards.length && galleryModal) {
        galleryCards.forEach(card => {
            card.style.cursor = 'zoom-in';
            card.addEventListener('click', () => {
                const src = card.querySelector('img').src;
                const title = card.querySelector('strong').innerText;
                const desc = card.querySelector('span').innerText;

                modalImg.src = src;
                modalTitle.innerText = title;
                modalDesc.innerText = desc;
                galleryModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        galleryModal.addEventListener('click', (e) => {
            // Collapse if clicking the overlay (background) or the description area, 
            // but not the image itself
            if (e.target !== modalImg) {
                galleryModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
