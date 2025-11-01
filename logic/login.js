function showError(input, message) {
    input.classList.add('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback && feedback.className.includes('invalid-feedback')) {
        feedback.textContent = message;
    }
}


function clearFieldError(inputs) {
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
            
            const feedback = input.parentElement.querySelector('.invalid-feedback');
            if (feedback && feedback.className.includes('invalid-feedback')) {
                feedback.textContent = '';
            }
        });
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateEmailField(email) {
    const value = email.value.trim();
    if (!value) return "El correo es obligatorio.";
    if (!validateEmail(value)) return "Correo inválido.";
    return "";
}


function validatePasswordField(password) {
    const value = password.value.trim();
    if (!value) return "Contraseña obligatoria.";
    if (value.length < 8) return "Mínimo 8 caracteres.";
    return "";
}


function loginPage() {
    console.log("Login Page Loaded");

    const loginForm = document.querySelector('#loginForm');
    const emailInput = loginForm.querySelector('#email');
    const passwordInput = loginForm.querySelector('#password');
    const loginMessage = document.querySelector('#loginMessage');
    
    loginForm.addEventListener('submit', function(event) {
        const inputs = [emailInput, passwordInput];
        const emailValue = emailInput.value.trim();
        let valid = true;

        event.preventDefault();

        clearFieldError(inputs);
        const emailError = validateEmailField(emailInput);
        const passwordError = validatePasswordField(passwordInput);

        if (emailError) { showError(emailInput, emailError); valid = false; }
        if (passwordError) { showError(passwordInput, passwordError); valid = false; }
        if (!valid) return;

        localStorage.setItem('email', emailValue);

        const userEmailSpan = document.querySelector('.navbar-text.text-muted');
        if (userEmailSpan) userEmailSpan.textContent = emailValue;

        loginMessage.innerHTML = `<div class="alert alert-success mt-3">Bienvenido ${emailValue}</div>`;

        loginForm.reset();
        setTimeout(() => { window.location.href = '../index.html';}, 2500);

    });
}


loginPage();

