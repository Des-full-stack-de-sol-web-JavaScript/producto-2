import { almacenaje } from './almacenaje.js';

// Funciones de ayuda (validaciones)
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

// --- LÓGICA PRINCIPAL DEL LOGIN ---

function loginPage() {
    console.log("Login Page Loaded");

    const loginForm = document.querySelector('#loginForm');
    if (!loginForm) return; // Seguridad por si no carga el form

    const emailInput = loginForm.querySelector('#email');
    const passwordInput = loginForm.querySelector('#password');
    const loginMessage = document.querySelector('#loginMessage');

    clearFieldError([emailInput, passwordInput]);

    // Evento submit
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Previene comportamiento por defecto

        let valid = true;
        const emailError = validateEmailField(emailInput);
        const passwordError = validatePasswordField(passwordInput);

        if (emailError) { showError(emailInput, emailError); valid = false; }
        if (passwordError) { showError(passwordInput, passwordError); valid = false; }
        if (!valid) return;

        // 1. Llamada a loguearUsuario (Rúbrica)
        const loginOk = almacenaje.loguearUsuario(emailInput.value.trim(), passwordInput.value.trim());

        if (loginOk) {
            // 2. Recuperamos nombre con obtenerUsuarioActivo (Rúbrica)
            const usuarioActivo = almacenaje.obtenerUsuarioActivo();
            
            // 3. Feedback visual
            loginMessage.innerHTML = `<div class="alert alert-success mt-3">¡Bienvenido/a, <strong>${usuarioActivo.nombre}</strong>!</div>`;

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            loginMessage.innerHTML = `<div class="alert alert-danger mt-3">Correo o contraseña incorrectos.</div>`;
        }

        if (!loginOk) loginForm.reset(); 
    });
}

// --- CUMPLIMIENTO DE RÚBRICA: Evento DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    loginPage();
});