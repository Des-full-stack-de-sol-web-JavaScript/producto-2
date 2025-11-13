import { almacenaje } from "./almacenaje.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Gestión de Usuarios cargada");

  // --- Elementos del DOM ---
  const form = document.getElementById("form-alta-usuario");
  const tablaBody = document.getElementById("cuerpo-tabla-usuarios");
  const mensajeContainer = document.getElementById("mensaje-sistema");

  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmar-password");

  // --- FUNCIÓN PARA MOSTRAR NOTIFICACIÓN (Sustituye a alert) ---
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    // Tipos: 'success' (verde), 'danger' (rojo), 'warning' (amarillo)
    mensajeContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${
              tipo === "success"
                ? '<i class="bi bi-check-circle-fill me-2"></i>'
                : '<i class="bi bi-exclamation-triangle-fill me-2"></i>'
            }
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      const alerta = mensajeContainer.querySelector(".alert");
      if (alerta) {
        alerta.classList.remove("show");
        setTimeout(() => (mensajeContainer.innerHTML = ""), 150);
      }
    }, 4000);
  };

  // --- 1. RENDERIZADO DE LA TABLA ---
  const renderizarTabla = () => {
    tablaBody.innerHTML = "";
    const usuarios = almacenaje.obtenerUsuarios();

    if (usuarios.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay usuarios registrados.</td></tr>`;
      return;
    }

    usuarios.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.nombre}</td>
        <td>${user.email}</td>
        <td>********</td> 
        <td class="text-end">
          <button class="btn btn-outline-danger btn-sm btn-eliminar" data-email="${user.email}" title="Eliminar">
            <i class="bi bi-trash"></i> Borrar
          </button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  };

  // --- 2. GESTIÓN DE BORRADO ---
  tablaBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-eliminar");
    if (!btn) return;

    const email = btn.dataset.email;
    const usuarioActivo = almacenaje.obtenerUsuarioActivo();

    if (usuarioActivo && usuarioActivo.email === email) {
      mostrarNotificacion(
        "No puedes borrar tu propio usuario mientras estás conectado.",
        "danger"
      );
      return;
    }

    if (confirm(`¿Seguro que quieres eliminar al usuario ${email}?`)) {
      const borrado = almacenaje.borrarUsuario(email);
      if (borrado) {
        renderizarTabla();
        mostrarNotificacion("Usuario eliminado correctamente.", "warning");
      } else {
        // CORREGIDO: Antes usabas alert() aquí
        mostrarNotificacion("Error al borrar el usuario.", "danger");
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

    validarPasswords();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const nuevoUsuario = {
      rol: "usuario",
      nombre: nombreInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    };

    const resultado = almacenaje.registrarUsuario(nuevoUsuario);

    if (resultado) {
      mostrarNotificacion(
        `¡Bienvenido/a, <strong>${nuevoUsuario.nombre}</strong>! Usuario creado con éxito.`,
        "success"
      );

      form.reset();
      form.classList.remove("was-validated");
      renderizarTabla();
    } else {
      // CORREGIDO: Antes usabas alert() aquí
      mostrarNotificacion(
        "Error: El correo electrónico ya está registrado.",
        "danger"
      );

      emailInput.classList.add("is-invalid");
      emailInput.focus();
    }
  });

  renderizarTabla();
});
