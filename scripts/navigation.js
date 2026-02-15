// Navigation system for OSCE Practice App
class NavigationManager {
    constructor() {
        this.currentPage = 0;
        this.pages = [
            { id: 'welcome', title: 'Welcome', url: 'index.html' },
            { id: 'menu', title: 'Main Menu', url: 'menu.html' },
            { id: 'newScenario', title: 'New Scenario', url: 'new-scenario.html' },
            { id: 'instructions', title: 'Instructions', url: 'instructions.html' },
            { id: 'marking', title: 'Marking Scheme', url: 'marking.html' },
            { id: 'history', title: 'History', url: 'history.html' },
            { id: 'apiTest', title: 'API Test', url: 'api-test.html' }
        ];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGlobalKeyboardShortcuts();
        this.updateNavigationState();
    }

    setupNavigation() {
        // Add keyboard shortcuts for navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextPage();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToPage(0); // Welcome page
                        break;
                    case 'm':
                        e.preventDefault();
                        this.goToPage(1); // Main menu
                        break;
                    case 'n':
                        e.preventDefault();
                        this.goToPage(2); // New scenario
                        break;
                    case 'h':
                        e.preventDefault();
                        this.goToPage(5); // History
                        break;
                }
            }
        });

        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupGlobalKeyboardShortcuts() {
        // ESC key to return to main menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goToMainMenu();
            }
        });
    }

    goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.pages.length) {
            this.currentPage = pageIndex;
            const page = this.pages[pageIndex];
            window.location.href = page.url;
            this.updateNavigationState();
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }

    goToMainMenu() {
        this.goToPage(1); // Main menu index
    }

    goToWelcome() {
        this.goToPage(0); // Welcome page index
    }

    updateNavigationState() {
        // Update current page based on URL
        const currentPath = window.location.pathname.split('/').pop();
        const currentIndex = this.pages.findIndex(page => page.url === currentPath);
        if (currentIndex !== -1) {
            this.currentPage = currentIndex;
        }
    }

    // Create navigation buttons for a page
    createNavigationButtons(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const defaults = {
            showPrevious: true,
            showNext: true,
            showMenu: true,
            showHome: true,
            customButtons: []
        };

        const config = { ...defaults, ...options };
        const navContainer = document.createElement('div');
        navContainer.className = 'navigation-buttons';

        // Previous button
        if (config.showPrevious && this.currentPage > 0) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Previous';
            prevBtn.className = 'nav-btn nav-btn-secondary';
            prevBtn.onclick = () => this.previousPage();
            navContainer.appendChild(prevBtn);
        }

        // Home button
        if (config.showHome) {
            const homeBtn = document.createElement('button');
            homeBtn.textContent = '🏠 Home';
            homeBtn.className = 'nav-btn nav-btn-primary';
            homeBtn.onclick = () => this.goToWelcome();
            navContainer.appendChild(homeBtn);
        }

        // Menu button
        if (config.showMenu) {
            const menuBtn = document.createElement('button');
            menuBtn.textContent = '📋 Menu';
            menuBtn.className = 'nav-btn nav-btn-primary';
            menuBtn.onclick = () => this.goToMainMenu();
            navContainer.appendChild(menuBtn);
        }

        // Next button
        if (config.showNext && this.currentPage < this.pages.length - 1) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next →';
            nextBtn.className = 'nav-btn nav-btn-primary';
            nextBtn.onclick = () => this.nextPage();
            navContainer.appendChild(nextBtn);
        }

        // Custom buttons
        config.customButtons.forEach(btn => {
            const customBtn = document.createElement('button');
            customBtn.textContent = btn.text;
            customBtn.className = btn.className || 'nav-btn nav-btn-primary';
            customBtn.onclick = btn.onClick;
            navContainer.appendChild(customBtn);
        });

        // Clear container and add navigation
        container.innerHTML = '';
        container.appendChild(navContainer);
    }

    // Get current page info
    getCurrentPage() {
        return this.pages[this.currentPage];
    }

    // Check if we're on a specific page
    isOnPage(pageId) {
        return this.getCurrentPage().id === pageId;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}