// ============================================
// Mobile Menu Toggle
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transition = '0.3s';
        });
        
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(10px, 10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Add 'scrolled' class after 50px of scroll
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Back to Top button functionality
    const backToTopButton = document.querySelector('.back-to-top');

    if (backToTopButton) {
        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Smooth scroll to top on click
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// ============================================
// CTA Button - Link to Contact Page
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.cta-button');

    ctaButtons.forEach(button => {
        // Only handle buttons that don't have href attributes (like form submit buttons)
        if (!button.hasAttribute('href')) {
            button.addEventListener('click', function(e) {
                // If it's a submit button, let the form handle it
                if (button.type === 'submit') {
                    return;
                }
                // Otherwise, redirect to contact page
                window.location.href = 'contact.html';
            });
        }
    });
});

// ============================================
// Contact Form Handling
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const company = contactForm.querySelectorAll('input[type="text"]')[1].value;
            const service = contactForm.querySelector('select').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !service || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Prepare email content
            const subject = `New Inquiry from ${name} - ${service}`;
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService: ${service}\n\nMessage:\n${message}`);
            
            window.location.href = `mailto:ici.texh@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
            
            // Show success message
            const originalHTML = contactForm.innerHTML;
            contactForm.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h3 style="color: var(--white); margin-bottom: 1rem;">Thank You!</h3>
                    <p style="color: var(--white); margin-bottom: 1rem;">Your message has been received. We'll get back to you within 24 hours.</p>
                    <button type="button" class="cta-button" id="resetForm">Send Another Message</button>
                </div>
            `;
            
            // Reset form button
            document.getElementById('resetForm').addEventListener('click', function() {
                contactForm.innerHTML = originalHTML;
                // Re-attach event listeners
                document.addEventListener('DOMContentLoaded', setupContactForm);
            });
            
            // In a real application, you would send this data to a server
            console.log({
                name,
                email,
                company,
                service,
                message
            });
        });
    }
});

// ============================================
// Smooth Scroll Behavior on Page Load
// ============================================

window.addEventListener('load', function() {
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            setTimeout(function() {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }
});

// ============================================
// Add Animation on Scroll
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards, feature cards, and other content
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll(
        '.service-card, .feature, .price-card, .step, .benefit-item, .client-item'
    );
    
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.animation = 'none';
        element.style.animationDelay = `${index * 0.05}s`;
        observer.observe(element);
    });
});

// ============================================
// Add Fade-In Animation Styles
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// FAQ Accordion
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });
});

// ============================================
// Active Navigation Link on Current Page
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Keep the scroll-based highlighting for same-page sections (like on services.html)
    window.addEventListener('scroll', function() {
        let current = '';

        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('#') && href === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});
