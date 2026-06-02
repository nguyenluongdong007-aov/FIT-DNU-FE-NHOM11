export const Utils = {
    initDarkMode() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        this.updateDarkModeUI(savedTheme);
    },
    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateDarkModeUI(newTheme);
        return newTheme;
    },
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
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    },
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    },
    showSpinner() {
        const spinner = document.getElementById('globalSpinner');
        if (spinner) {
            spinner.classList.remove('d-none');
            spinner.classList.add('d-flex');
        }
    },
    hideSpinner() {
        const spinner = document.getElementById('globalSpinner');
        if (spinner) {
            spinner.classList.remove('d-flex');
            spinner.classList.add('d-none');
        }
    },
    calculateNights(checkInStr, checkOutStr) {
        if (!checkInStr || !checkOutStr) return 0;
        const checkIn = new Date(checkInStr);
        const checkOut = new Date(checkOutStr);
        checkIn.setHours(12, 0, 0, 0);
        checkOut.setHours(12, 0, 0, 0);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return nightCount > 0 ? nightCount : 0;
    },
    formatCurrency(amount) {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(num);
    },
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
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
        setTimeout(() => {
            if (toastElement) {
                toastElement.classList.remove('show');
                setTimeout(() => toastElement.remove(), 300);
            }
        }, 4000);
    }
};
