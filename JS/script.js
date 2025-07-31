/**
 * Enhanced Portfolio JavaScript
 * Handles theme switching, navigation, form validation, accessibility, and animations
 */

class PortfolioApp {
    constructor() {
        this.mobileMenuOpen = false;
        this.focusTrap = null;
        this.currentTheme = 'light';
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeAnimations();
        this.initializeNavigation();
        this.initializeProjectFilters();
        this.initializeContactForm();
        this.initializeAccessibility();
        this.initializeLazyLoading();
        this.initializePerformanceMonitoring();
    }

    setupEventListeners() {
        // Theme toggle - handle both buttons
        const themeToggleFixed = document.getElementById('theme-toggle-fixed');
        const themeToggleNav = document.getElementById('theme-toggle-nav');
        
        if (themeToggleFixed) {
            themeToggleFixed.addEventListener('click', () => this.toggleTheme());
        }
        if (themeToggleNav) {
            themeToggleNav.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Window resize handler
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

        // Scroll event for header behavior
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));

        // Handle focus events for better keyboard navigation
        document.addEventListener('focusin', (e) => this.handleFocus(e));
        document.addEventListener('focusout', (e) => this.handleBlur(e));
    }

    
document.getElementById('theme-toggle-mobile').addEventListener('click', function() {

    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

    // Utility functions for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');

        this.setTheme(theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Theme toggle clicked:', { currentTheme, newTheme });
        
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Announce theme change to screen readers
        this.announceToScreenReader(`Switched to ${newTheme} mode`);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Update both theme toggle buttons
        const themeToggleFixed = document.getElementById('theme-toggle-fixed');
        const themeToggleNav = document.getElementById('theme-toggle-nav');
        
        const updateButton = (button) => {
            if (button) {
                button.setAttribute('aria-label',
                    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                );
                button.setAttribute('title',
                    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                );
            }
        };
        
        updateButton(themeToggleFixed);
        updateButton(themeToggleNav);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = theme === 'dark' ? '#1f2937' : '#ffffff';
    }

    // Navigation Management
    initializeNavigation() {
        this.mobileMenuOpen = false;
        this.focusTrap = null;

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !this.isClickInsideMenu(e)) {
                this.closeMobileMenu();
            }
        });
    }

    isClickInsideMenu(e) {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        return mobileMenu?.contains(e.target) || mobileMenuToggle?.contains(e.target);
    }

    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

        if (!mobileMenu || !mobileMenuToggle) return;

        this.mobileMenuOpen = true;

        // Store the element that was focused before opening the menu
        this.previousFocusElement = document.activeElement;

        // Show menu
        mobileMenu.classList.add('show');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');

        // Focus first menu item
        const firstMenuItem = mobileMenu.querySelector('a');
        if (firstMenuItem) {
            // Small delay to ensure smooth animation
            setTimeout(() => firstMenuItem.focus(), 100);
        }

        // Trap focus within menu
        this.trapFocus(mobileMenu);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

        if (!mobileMenu || !mobileMenuToggle) return;

        this.mobileMenuOpen = false;

        // Hide menu
        mobileMenu.classList.remove('show');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');

        // Return focus to toggle button
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
        }

        // Remove focus trap
        this.removeFocusTrap();

        // Restore body scroll
        document.body.style.overflow = '';
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.focusTrap = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', this.focusTrap);
    }

    removeFocusTrap() {
        if (this.focusTrap) {
            document.removeEventListener('keydown', this.focusTrap);
            this.focusTrap = null;
        }
    }

    // Smooth Scrolling
    handleSmoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();

            // Close mobile menu if open
            if (this.mobileMenuOpen) {
                this.closeMobileMenu();
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                this.scrollToElement(targetElement);

                // Update URL without triggering scroll
                if (history.pushState) {
                    history.pushState(null, null, href);
                }

                // Focus target element for accessibility
                this.focusElement(targetElement);
            }
        }
    }

    scrollToElement(element) {
        const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;

        // Use smooth scrolling with fallback
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            this.smoothScrollTo(targetPosition, 500);
        }
    }

    smoothScrollTo(to, duration) {
        const start = window.pageYOffset;
        const change = to - start;
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, start, change, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    focusElement(element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
        element.addEventListener('blur', () => {
            element.removeAttribute('tabindex');
        }, { once: true });
    }

    // Project Filters
    initializeProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter, filterButtons, projectCards);
            });
        });

        // Initialize with 'all' filter
        this.filterProjects('all', filterButtons, projectCards);
    }

    filterProjects(filter, buttons, cards) {
        // Update active button
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        const activeButton = document.querySelector(`[data-filter="${filter}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
        }

        // Filter cards with staggered animation
        let visibleCount = 0;
        cards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;

            if (shouldShow) {
                visibleCount++;
                card.style.display = 'block';
                card.style.animationDelay = `${index * 100}ms`;

                // Use requestAnimationFrame for smooth animation
                requestAnimationFrame(() => {
                    card.classList.add('animate-slide-up');
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.classList.remove('animate-slide-up');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Announce filter results to screen readers
        this.announceToScreenReader(
            `Showing ${visibleCount} project${visibleCount !== 1 ? 's' : ''} for ${filter === 'all' ? 'all categories' : filter}`
        );
    }

    // Contact Form
    initializeContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));

            // Character count for message field
            if (input.name === 'message') {
                this.addCharacterCounter(input);
            }
        });
    }

    addCharacterCounter(textarea) {
        const maxLength = 500;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.setAttribute('aria-live', 'polite');
        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const current = textarea.value.length;
            counter.textContent = `${current}/${maxLength} characters`;
            counter.classList.toggle('warning', current > maxLength * 0.9);
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitButton = form.querySelector('.form-submit');
        const formData = new FormData(form);

        // Validate all fields
        const isValid = this.validateForm(form);
        if (!isValid) {
            this.announceToScreenReader('Please fix the errors in the form before submitting.');
            return;
        }

        // Show loading state
        this.setSubmitButtonState(submitButton, 'loading');

        try {
            // Submit form (replace with actual endpoint)
            await this.submitForm(formData);

            // Show success state
            this.setSubmitButtonState(submitButton, 'success');
            this.showFormMessage('Thank you! Your message has been sent successfully.', 'success');
            form.reset();

            // Reset character counter
            const counter = form.querySelector('.character-counter');
            if (counter) counter.textContent = '0/500 characters';

        } catch (error) {
            console.error('Form submission error:', error);
            this.setSubmitButtonState(submitButton, 'error');
            this.showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        }

        // Reset button state after 3 seconds
        setTimeout(() => {
            this.setSubmitButtonState(submitButton, 'default');
        }, 3000);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        let firstErrorField = null;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = input;
                }
            }
        });

        // Focus first error field
        if (firstErrorField) {
            firstErrorField.focus();
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
        }
        // Email validation
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address.';
        }
        // Name validation
        else if (field.name === 'name' && value && value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long.';
        }
        // Subject validation
        else if (field.name === 'subject' && value && value.length < 5) {
            errorMessage = 'Subject must be at least 5 characters long.';
        }
        // Message validation
        else if (field.name === 'message' && value && value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long.';
        }
        else if (field.name === 'message' && value && value.length > 500) {
            errorMessage = 'Message must not exceed 500 characters.';
        }

        this.showFieldError(field, errorMessage);
        return !errorMessage;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.toggle('show', !!message);
        }

        field.classList.toggle('error', !!message);
        field.setAttribute('aria-invalid', !!message);

        if (message) {
            field.setAttribute('aria-describedby', `${field.name}-error`);
        } else {
            field.removeAttribute('aria-describedby');
        }
    }

    clearFieldError(field) {
        this.showFieldError(field, '');
    }

    getFieldLabel(fieldName) {
        const labels = {
            name: 'Full Name',
            email: 'Email Address',
            subject: 'Subject',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setSubmitButtonState(button, state) {
        const states = {
            default: { text: 'Send Message', disabled: false, class: '' },
            loading: { text: 'Sending...', disabled: true, class: 'btn-loading' },
            success: { text: 'Message Sent!', disabled: true, class: 'btn-success' },
            error: { text: 'Try Again', disabled: false, class: 'btn-error' }
        };

        const config = states[state];
        const textElement = button.querySelector('.btn-text');
        if (textElement) {
            textElement.textContent = config.text;
        }

        button.disabled = config.disabled;

        // Remove all state classes
        Object.values(states).forEach(s => button.classList.remove(s.class));

        // Add current state class
        if (config.class) {
            button.classList.add(config.class);
        }
    }

    async submitForm(formData) {
        // Replace this with your actual form submission logic
        // For demo purposes, we'll simulate an API call

        const submitUrl = '/api/contact'; // Replace with your endpoint

        try {
            const response = await fetch(submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // Fallback to email link if API fails
            const email = 'thoratomkar018@gmail.com';
            const subject = formData.get('subject') || 'Contact from Portfolio';
            const body = formData.get('message') || '';
            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoLink;
            throw error;
        }
    }

    showFormMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'assertive');

        const form = document.getElementById('contact-form');
        form.insertBefore(messageEl, form.firstChild);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    // Animations and Scroll Effects
    initializeAnimations() {
        // Intersection Observer for scroll animations
        this.observeElements();

        // Parallax effects (if preferred-reduced-motion is not set)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.initializeParallaxEffects();
        }
    }

    observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve after animation to improve performance
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.project-card, .skill-category, .section-header, .about-text, .contact-info').forEach(el => {
            el.classList.add('fade-in');
            this.intersectionObserver.observe(el);
        });
    }

    initializeParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (parallaxElements.length === 0) return;

        const handleParallax = this.throttle(() => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        }, 16); // ~60fps

        window.addEventListener('scroll', handleParallax);
    }

    // Accessibility Features
    initializeAccessibility() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    this.focusElement(target);
                    this.scrollToElement(target);
                }
            });
        }

        // Enhanced keyboard navigation
        this.initializeKeyboardNavigation();

        // ARIA live regions for dynamic content
        this.initializeAriaLiveRegions();

        // High contrast mode detection
        this.detectHighContrastMode();
    }

    initializeKeyboardNavigation() {
        // Project card keyboard navigation
        document.querySelectorAll('.project-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('.project-link');
                    if (link) {
                        link.click();
                        this.announceToScreenReader(`Opening ${link.textContent}`);
                    }
                }
            });
        });

        // Filter button keyboard navigation
        document.querySelectorAll('.filter-btn').forEach((btn, index, buttons) => {
            btn.addEventListener('keydown', (e) => {
                let targetIndex = index;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = index > 0 ? index - 1 : buttons.length - 1;
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = index < buttons.length - 1 ? index + 1 : 0;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = buttons.length - 1;
                        break;
                }

                if (targetIndex !== index) {
                    buttons[targetIndex].focus();
                }
            });
        });
    }

    initializeAriaLiveRegions() {
        // Create live region for announcements
        if (!document.getElementById('live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.id = 'live-region';
            document.body.appendChild(liveRegion);
        }
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    detectHighContrastMode() {
        // Detect Windows High Contrast Mode
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.classList.add('high-contrast');
        }
    }

    // Focus Management
    handleFocus(e) {
        // Add focus-visible class for keyboard navigation
        if (this.isKeyboardNavigation) {
            e.target.classList.add('focus-visible');
        }
    }

    handleBlur(e) {
        e.target.classList.remove('focus-visible');
    }

    // Keyboard Navigation Handler
    handleKeyboardNavigation(e) {
        // Track if user is using keyboard navigation
        this.isKeyboardNavigation = true;

        // Close mobile menu with Escape key
        if (e.key === 'Escape') {
            if (this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        }

        // Theme toggle keyboard shortcut (Alt+T)
        if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            this.toggleTheme();
            return;
        }

        // Quick navigation shortcuts
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToSection('home');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToSection('projects');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToSection('about');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToSection('contact');
                    break;
            }
        }
    }

    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            this.scrollToElement(section);
            this.focusElement(section);
            this.announceToScreenReader(`Navigated to ${sectionId} section`);
        }
    }

    // Lazy Loading
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        // Load image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }

                        img.classList.remove('loading');
                        img.classList.add('loaded');

                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe lazy images
            document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
                img.classList.add('loading');
                imageObserver.observe(img);
            });
        }
    }

    // Responsive Handling
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Update layout calculations
        this.updateLayoutCalculations();
    }

    updateLayoutCalculations() {
        // Recalculate any dynamic measurements
        const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }

    // Scroll Handler
    handleScroll() {
        const header = document.querySelector('.main-header');
        if (header) {
            const scrolled = window.scrollY > 50;
            header.classList.toggle('scrolled', scrolled);
        }

        // Update active navigation link
        this.updateActiveNavLink();

        // Update scroll progress
        this.updateScrollProgress();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        let currentSection = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    updateScrollProgress() {
        const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);
    }

    // Performance Monitoring
    initializePerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                // Log performance metrics
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                        connect: perfData.connectEnd - perfData.connectStart,
                        ttfb: perfData.responseStart - perfData.requestStart,
                        download: perfData.responseEnd - perfData.responseStart,
                        domParse: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        totalLoad: perfData.loadEventEnd - perfData.navigationStart
                    };

                    console.log('Performance Metrics:', metrics);

                    // Send to analytics if needed
                    this.sendPerformanceMetrics(metrics);
                }, 0);
            });
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    sendPerformanceMetrics(metrics) {
        // Replace with your analytics endpoint
        // Example: Google Analytics, custom endpoint, etc.
        if (typeof gtag === 'function') {
            gtag('event', 'page_load_time', {
                custom_parameter: metrics.totalLoad
            });
        }
    }

    // Cleanup
    destroy() {
        // Clean up event listeners and observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        this.removeFocusTrap();

        // Remove custom event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
    }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.portfolioApp = new PortfolioApp();
    });
} else {
    window.portfolioApp = new PortfolioApp();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // You could send this to an error tracking service
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}
