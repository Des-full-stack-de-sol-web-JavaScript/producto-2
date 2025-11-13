import { almacenaje } from './almacenaje.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("Gestión de Usuarios cargada");

  // --- Elementos del DOM ---
  const form = document.getElementById("form-alta-usuario");
  const tablaBody = document.getElementById("cuerpo-tabla-usuarios");
  
  // Inputs del formulario (Asegúrate que tu HTML solo tenga estos)
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password"); // Ojo al ID en tu HTML
  const confirmInput = document.getElementById("confirmar-password"); // Ojo al ID en tu HTML

  // --- 1. RENDERIZADO DE LA TABLA ---
  const renderizarTabla = () => {
    tablaBody.innerHTML = ""; // Limpiar tabla
    const usuarios = almacenaje.obtenerUsuarios();

    if (usuarios.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="4" class="text-center">No hay usuarios registrados.</td></tr>`;
      return;
    }

    usuarios.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.nombre}</td>
        <td>${user.email}</td>
        <td>********</td> <td>
          <button class="btn btn-danger btn-sm btn-eliminar" data-email="${user.email}" title="Eliminar">
            Borrar
          </button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  };

  // --- 2. GESTIÓN DE BORRADO (Delegación de eventos) ---
  tablaBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-eliminar");
    if (!btn) return;

    const email = btn.dataset.email;
    
    // Evitar borrarte a ti mismo si estás logueado (Opcional pero recomendado)
    const usuarioActivo = almacenaje.getActiveUser();
    if (usuarioActivo && usuarioActivo.email === email) {
        alert("No puedes borrar tu propio usuario mientras estás conectado.");
        return;
    }

    if (confirm(`¿Seguro que quieres eliminar al usuario ${email}?`)) {
      const borrado = almacenaje.borrarUsuario(email);
      if (borrado) {
        renderizarTabla();
      } else {
        alert("Error al borrar el usuario.");
      }
    }
  });

  // --- 3. VALIDACIÓN DE CONTRASEÑAS ---
  const validarPasswords = () => {
    if (passwordInput.value !== confirmInput.value) {
      confirmInput.setCustomValidity("Las contraseñas no coinciden");
      confirmInput.classList.add("is-invalid");
    } else {
      confirmInput.setCustomValidity("");
      confirmInput.classList.remove("is-invalid");
    }
  };

  passwordInput.addEventListener("input", validarPasswords);
  confirmInput.addEventListener("input", validarPasswords);

  // --- 4. ENVÍO DEL FORMULARIO (ALTA) ---
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    validarPasswords(); // Comprobación final

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Crear objeto usuario (Estructura simple)
    const nuevoUsuario = {
      rol: "usuario", // Por defecto
      nombre: nombreInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    };

    // Usamos el módulo almacenaje para registrar
    const resultado = almacenaje.registrarUsuario(nuevoUsuario);

    if (resultado) {
      // Éxito
      alert(`Usuario ${nuevoUsuario.nombre} creado correctamente.`);
      form.reset();
      form.classList.remove("was-validated");
      renderizarTabla(); // Actualizamos la lista visual
    } else {
      // Error (probablemente email duplicado)
      alert("Error: El correo electrónico ya está registrado.");
      emailInput.classList.add("is-invalid");
      emailInput.focus();
    }
  });

  // --- Carga Inicial ---
  renderizarTabla();
});