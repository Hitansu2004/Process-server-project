// SessionManager - Handles session timeout and activity tracking
class SessionManager {
    private static TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    private static WARNING_MS = 2 * 60 * 1000; // 2 minutes before timeout
    private static lastActivity: number = Date.now();
    private static timeoutCheckInterval: NodeJS.Timeout | null = null;
    private static warningShown: boolean = false;

    /**
     * Initialize the session manager
     * Call this once when the app loads
     */
    static init() {
        this.setupActivityListeners();
        this.startTimeoutChecker();
        this.updateActivity(); // Reset on init
    }

    /**
     * Setup event listeners to track user activity
     */
    private static setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), { passive: true });
        });
    }

    /**
     * Update the last activity timestamp
     */
    static updateActivity() {
        this.lastActivity = Date.now();
        this.warningShown = false;
    }

    /**
     * Start the timeout checker interval
     */
    private static startTimeoutChecker() {
        // Clear existing interval if any
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
        }

        // Check every 10 seconds
        this.timeoutCheckInterval = setInterval(() => {
            const inactive = Date.now() - this.lastActivity;

            if (inactive > this.TIMEOUT_MS) {
                this.logout();
            } else if (inactive > this.TIMEOUT_MS - this.WARNING_MS && !this.warningShown) {
                this.showWarning();
                this.warningShown = true;
            }
        }, 10000);
    }

    /**
     * Show warning before logout
     */
    private static showWarning() {
        const secondsLeft = Math.ceil((this.TIMEOUT_MS - (Date.now() - this.lastActivity)) / 1000);

        if (typeof window !== 'undefined') {
            const warning = confirm(
                `Your session will expire in ${secondsLeft} seconds due to inactivity.\n\n` +
                `Click OK to stay logged in, or Cancel to logout now.`
            );

            if (warning) {
                // User clicked OK, reset activity
                this.updateActivity();
            } else {
                // User clicked Cancel, logout now
                this.logout();
            }
        }
    }

    /**
     * Logout and clear session
     */
    static logout() {
        if (typeof window !== 'undefined') {
            // Clear session storage
            sessionStorage.clear();

            // Clear interval
            if (this.timeoutCheckInterval) {
                clearInterval(this.timeoutCheckInterval);
                this.timeoutCheckInterval = null;
            }

            // Redirect to login with timeout message
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('/login');

            if (!isLoginPage) {
                window.location.href = '/login?timeout=true';
            }
        }
    }

    /**
     * Manually clear session (for user-initiated logout)
     */
    static clear() {
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }
        sessionStorage.clear();
    }

    /**
     * Get session data
     */
    static getItem(key: string): string | null {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(key);
        }
        return null;
    }

    /**
     * Set session data
     */
    static setItem(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(key, value);
            this.updateActivity(); // Reset timeout on data save
        }
    }

    /**
     * Check if session is active
     */
    static isActive(): boolean {
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('token');
            return !!token;
        }
        return false;
    }
}

export default SessionManager;
