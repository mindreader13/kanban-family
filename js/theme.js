/**
 * Theme Manager
 */
export class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('kanban-theme') || 'light';
        this.apply();
    }

    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.apply();
        localStorage.setItem('kanban-theme', this.theme);
    }

    apply() {
        if (this.theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }
}