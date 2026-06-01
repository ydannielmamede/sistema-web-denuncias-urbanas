class FormUtils {
    static validateEmail(value) {
        if (!value) {
            return { isValid: false, message: 'O email é obrigatório' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { isValid: false, message: 'Digite um endereço de email válido' };
        }
        return { isValid: true };
    }

    static validatePassword(value) {
        if (!value) {
            return { isValid: false, message: 'A senha é obrigatória' };
        }
        if (value.length < 8) {
            return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return { isValid: false, message: 'A senha deve conter letras maiúsculas, minúsculas e números' };
        }
        return { isValid: true };
    }

    static showError(fieldName, message, formGroupSelector = '.form-group') {
        const field = document.getElementById(fieldName);
        if (!field) return;
        const formGroup = field.closest(formGroupSelector);
        const errorElement = document.getElementById(fieldName + 'Error');

        if (formGroup) formGroup.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    static clearError(fieldName, formGroupSelector = '.form-group') {
        const field = document.getElementById(fieldName);
        if (!field) return;
        const formGroup = field.closest(formGroupSelector);
        const errorElement = document.getElementById(fieldName + 'Error');

        if (formGroup) formGroup.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    static showSuccess(fieldName) {
        const field = document.getElementById(fieldName);
        const wrapper = field?.closest('.input-wrapper');
        if (!wrapper) return;

        wrapper.style.borderColor = '#22c55e';
        setTimeout(() => { wrapper.style.borderColor = ''; }, 2000);
    }

    static simulateLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@demo.com' && password === 'wrongpassword') {
                    reject(new Error('Email ou senha inválidos'));
                } else {
                    resolve({ success: true, user: { email } });
                }
            }, 2000);
        });
    }

    // Build the toast with DOM APIs so untrusted `message` values can't inject HTML.
    static showNotification(message, type = 'info', container = null) {
        const target = container || document.querySelector('form');
        if (!target) return;

        const palette = {
            error:   { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
            success: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
            info:    { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#06b6d4' },
        };
        const c = palette[type] || palette.info;

        const wrapper = document.createElement('div');
        wrapper.className = `notification ${type}`;
        wrapper.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const inner = document.createElement('div');
        inner.style.cssText = `
            background: ${c.bg};
            backdrop-filter: blur(10px);
            border: 1px solid ${c.border};
            border-radius: 12px;
            padding: 12px 16px;
            margin-top: 16px;
            color: ${c.text};
            text-align: center;
            font-size: 14px;
        `;
        inner.textContent = message;
        wrapper.appendChild(inner);

        target.appendChild(wrapper);

        setTimeout(() => {
            wrapper.remove();
        }, 3000);
    }

    static setupFloatingLabels(form) {
        if (!form) return;
        form.querySelectorAll('input').forEach(input => {
            const sync = () => input.classList.toggle('has-value', input.value.trim() !== '');
            sync();
            input.addEventListener('input', sync);
        });
    }

    static setupPasswordToggle(passwordInput, toggleButton) {
        if (!passwordInput || !toggleButton) return;
        toggleButton.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            const eyeIcon = toggleButton.querySelector('.eye-icon');
            eyeIcon?.classList.toggle('show-password', isPassword);

            passwordInput.focus();
        });
    }

    static addEntranceAnimation(element, delay = 100) {
        // Animations removed
    }

    static addSharedAnimations() {
        // Animations removed
    }
}

// Base class for every login form. Subclasses override hooks like `decorate`,
// `onSuccess`, `getElementsToHideOnSuccess`, and `onLoginError` instead of
// reimplementing the lifecycle.
FormUtils.LoginFormBase = class LoginFormBase {
    constructor(options = {}) {
        this.formId = options.formId || 'loginForm';
        this.form = document.getElementById(this.formId);
        if (!this.form) return;

        this.submitBtn = options.submitButtonSelector
            ? this.form.querySelector(options.submitButtonSelector)
            : this.form.querySelector('button[type="submit"], .login-btn, .submit-btn, .signin-btn, .auth-btn');
        this.passwordInput = this.form.querySelector('input[type="password"]');
        this.passwordToggle =
            document.getElementById('passwordToggle') ||
            this.form.querySelector('.password-toggle');
        this.successMessage = document.getElementById('successMessage');
        this.cardSelector = options.cardSelector || '.login-card, .form-card, .auth-card, .signin-card';
        this.formGroupSelector = options.formGroupSelector || '.form-group';
        this.hideOnSuccess = options.hideOnSuccess || [];
        this.redirectMessage = options.redirectMessage || null;

        this.validators = options.validators || {
            email: FormUtils.validateEmail,
            password: FormUtils.validatePassword,
        };

        this.isSubmitting = false;
        this.init();
    }

    init() {
        FormUtils.addSharedAnimations();
        FormUtils.setupFloatingLabels(this.form);
        FormUtils.setupPasswordToggle(this.passwordInput, this.passwordToggle);
        this.bindCoreEvents();
        this.bindAuxLinks();
        this.bindKeyboardShortcuts();
        this.decorate();
    }

    bindCoreEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        Object.keys(this.validators).forEach(name => {
            const field = document.getElementById(name);
            if (!field) return;
            field.addEventListener('blur', () => this.validateField(name));
            field.addEventListener('input', () => this.clearError(name));
            field.addEventListener('focus', (e) => this.onInputFocus(e));
            field.addEventListener('blur', (e) => this.onInputBlur(e));
        });

        const checkbox = document.getElementById('remember');
        checkbox?.addEventListener('change', () => this.onRememberChange());
    }

    showError(name, message) {
        FormUtils.showError(name, message, this.formGroupSelector);
    }

    clearError(name) {
        FormUtils.clearError(name, this.formGroupSelector);
    }

    bindAuxLinks() {
        document.querySelectorAll('.forgot-password').forEach(link => {
            link.addEventListener('click', (e) => this.onForgotPassword(e));
        });
        document.querySelectorAll('.signup-link a, .signup-link button').forEach(link => {
            link.addEventListener('click', (e) => this.onSignupLink(e));
        });
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.onSocialLogin(e));
        });
    }

    // Scoped to the form, not document — multiple form instances no longer stack handlers.
    bindKeyboardShortcuts() {
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Object.keys(this.validators).forEach(name => this.clearError(name));
            }
        });
    }

    // ---- hooks ----
    decorate() {}
    onInputFocus(e) { e.target.closest('.input-wrapper')?.classList.add('focused'); }
    onInputBlur(e)  { e.target.closest('.input-wrapper')?.classList.remove('focused'); }
    onRememberChange() {
        // Animation removed
    }
    onForgotPassword(e) {
        e.preventDefault();
        FormUtils.showNotification('Um link para redefinir a senha será enviado para seu email', 'info', this.form);
    }
    onSignupLink(e) {
        e.preventDefault();
        FormUtils.showNotification('Redirecionando para a página de cadastro...', 'info', this.form);
    }
    onSocialLogin(e) {
        const btn = e.currentTarget;
        const provider = btn.dataset.provider
            || (btn.classList.contains('google-btn') ? 'Google'
              : btn.classList.contains('github-btn') ? 'GitHub'
              : btn.classList.contains('facebook-btn') ? 'Facebook'
              : btn.classList.contains('apple-btn') ? 'Apple'
              : 'provedor');
        FormUtils.showNotification(`Conectando ao ${provider}...`, 'info', this.form);
    }

    // ---- lifecycle ----
    async handleSubmit(e) {
        e.preventDefault();
        if (this.isSubmitting) return;
        if (this.validateForm()) {
            await this.submitForm();
        } else {
            this.shakeForm();
        }
    }

    validateForm() {
        return Object.keys(this.validators).every(name => this.validateField(name));
    }

    validateField(name) {
        const field = document.getElementById(name);
        const validator = this.validators[name];
        if (!field || !validator) return true;

        const result = validator(field.value.trim(), field);
        if (result.isValid) {
            this.clearError(name);
            FormUtils.showSuccess(name);
        } else {
            this.showError(name, result.message);
        }
        return result.isValid;
    }

    shakeForm() {
        // Animation removed
    }

    async submitForm() {
        this.isSubmitting = true;
        this.submitBtn?.classList.add('loading');

        try {
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            await FormUtils.simulateLogin(email, password);
            this.onSuccess();
        } catch (error) {
            this.onLoginError(error.message);
        } finally {
            this.isSubmitting = false;
            this.submitBtn?.classList.remove('loading');
        }
    }

    // Default success behavior: fade out the form, fade in #successMessage.
    // Forms that want to hide additional elements override `getElementsToHideOnSuccess`
    // or pass `hideOnSuccess` in constructor options.
    onSuccess() {
        const elementsToHide = [...this.hideOnSuccess, ...this.getElementsToHideOnSuccess()];
        this.form.style.opacity = '0';
        this.form.style.display = 'none';

        elementsToHide.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.style.opacity = '0';
                el.style.display = 'none';
            }
        });

        this.successMessage?.classList.add('show');
    }

    getElementsToHideOnSuccess() { return []; }

    onLoginError(message) {
        FormUtils.showNotification(message || 'Falha no login. Tente novamente.', 'error', this.form);
    }

    getFormData() {
        return Object.fromEntries(new FormData(this.form).entries());
    }
};