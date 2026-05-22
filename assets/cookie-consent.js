// Cookie Consent Management
const CookieConsent = {
    STORAGE_KEY: 'ici-tech-cookie-consent',
    COOKIE_NAME: '_ici_cookies_accepted',
    
    init() {
        // Check if user has already given consent
        if (!this.hasConsented()) {
            this.showBanner();
        }
    },
    
    hasConsented() {
        return localStorage.getItem(this.STORAGE_KEY) === 'true' ||
               document.cookie.includes(this.COOKIE_NAME);
    },
    
    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-text">
                    <p>We use cookies to personalize your experience. By continuing, you agree to our <a href="policies.html#cookies" class="cookie-link">Cookie Policy</a>.</p>
                </div>
                <div class="cookie-actions">
                    <a href="policies.html" class="cookie-link">Manage</a>
                    <button id="cookie-accept" class="cookie-button">Accept All</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        document.getElementById('cookie-accept').addEventListener('click', () => {
            this.acceptCookies();
        });
    },
    
    acceptCookies() {
        // Store consent in localStorage
        localStorage.setItem(this.STORAGE_KEY, 'true');
        
        // Set a cookie
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `${this.COOKIE_NAME}=true; expires=${date.toUTCString()}; path=/`;
        
        // Remove banner with animation
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('fade-out');
            setTimeout(() => banner.remove(), 300);
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
