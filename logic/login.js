import { headerComponent } from "../components/header.js";
import { almacenaje } from './almacenaje.js';

almacenaje.initusers();


headerComponent();

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

    clearFieldError([emailInput, passwordInput]);

    loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let valid = true;
    const emailError = validateEmailField(emailInput);
    const passwordError = validatePasswordField(passwordInput);


    if (emailError) { showError(emailInput, emailError); valid = false; }
    if (passwordError) { showError(passwordInput, passwordError); valid = false; }
    if (!valid) return;

    const loginOk = almacenaje.loguearUsuario(emailInput.value.trim(), passwordInput.value.trim());

     if (loginOk) {
      loginMessage.innerHTML = `<div class="alert alert-success mt-3">Bienvenido!</div>`;


       // Redirigimos después de 2 segundos
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
    } else {
      loginMessage.innerHTML = `<div class="alert alert-danger mt-3">Correo o contraseña incorrectos.</div>`;
    }

    loginForm.reset();
  });
}

loginPage();