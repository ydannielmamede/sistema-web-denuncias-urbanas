// Glassmorphism Login Form
class GlassmorphismLoginForm extends FormUtils.LoginFormBase {
    constructor() {
        super({
            hideOnSuccess: ['.divider', '.social-login', '.signup-link'],
        });
    }

    decorate() {
        // Animations removed
    }
}

document.addEventListener('DOMContentLoaded', () => new GlassmorphismLoginForm());
