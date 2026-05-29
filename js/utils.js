// Project: StayEasy - Developed by SlimexDev / Rimuru Scripter

export const Utils = {
    // --- DARK MODE UTILITIES ---
    
    /**
     * Initialize dark mode settings
     */
    initDarkMode() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        this.updateDarkModeUI(savedTheme);
    },

    /**
     * Toggle between light and dark themes
     */
    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateDarkModeUI(newTheme);
        return newTheme;
    },

    /**
     * Update toggle button icons or labels depending on current theme
     * @param {string} theme 
     */
    updateDarkModeUI(theme) {
        const btn = document.getElementById('darkModeToggle');
        if (!btn) return;
        
        if (theme === 'dark') {
            btn.innerHTML = '<i class="bi bi-sun-fill"></i> Giao diện Sáng';
            btn.classList.remove('btn-outline-dark');
            btn.classList.add('btn-outline-warning');
        } else {
            btn.innerHTML = '<i class="bi bi-moon-stars-fill"></i> Giao diện Tối';
            btn.classList.remove('btn-outline-warning');
            btn.classList.add('btn-outline-dark');
        }
    },

    // --- SESSION UTILITIES ---

    /**
     * Get currently logged in user
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    },

    /**
     * Set logged in user details
     * @param {Object} user 
     */
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    /**
     * Clear user session on logout
     */
    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    },

    // --- SPINNER UTILITIES ---

    /**
     * Show global screen loading spinner
     */
    showSpinner() {
        const spinner = document.getElementById('globalSpinner');
        if (spinner) {
            spinner.classList.remove('d-none');
            spinner.classList.add('d-flex');
        }
    },

    /**
     * Hide global screen loading spinner
     */
    hideSpinner() {
        const spinner = document.getElementById('globalSpinner');
        if (spinner) {
            spinner.classList.remove('d-flex');
            spinner.classList.add('d-none');
        }
    },

    // --- DATE CALCULATIONS ---

    /**
     * Calculate difference in nights between two ISO dates
     * @param {string} checkInStr (YYYY-MM-DD)
     * @param {string} checkOutStr (YYYY-MM-DD)
     * @returns {number}
     */
    calculateNights(checkInStr, checkOutStr) {
        if (!checkInStr || !checkOutStr) return 0;
        
        const checkIn = new Date(checkInStr);
        const checkOut = new Date(checkOutStr);
        
        // Reset times to avoid daylight saving issues
        checkIn.setHours(12, 0, 0, 0);
        checkOut.setHours(12, 0, 0, 0);
        
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return nightCount > 0 ? nightCount : 0;
    },

    // --- FORMATTERS & NOTIFICATIONS ---

    /**
     * Format numbers into Vietnamese currency strings
     * @param {number|string} amount 
     * @returns {string}
     */
    formatCurrency(amount) {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(num);
    },

    /**
     * Render a gorgeous custom floating alert notification on top right of the viewport
     * @param {string} message 
     * @param {string} type ('success', 'danger', 'warning', 'info')
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            // Create a toast container on the fly if it doesn't exist
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        const container = document.getElementById('toastContainer');
        const toastId = 'toast_' + Date.now();
        
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 show shadow-lg mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center">
                        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2 fs-5"></i>
                        <span>${message}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (toastElement) {
                toastElement.classList.remove('show');
                setTimeout(() => toastElement.remove(), 300);
            }
        }, 4000);
    }
};
