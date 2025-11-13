function altaUsuariosPage() {
  console.log("AltaUsuarios Page Loaded");
}

// ../logic/alta-usuario.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Selectores del DOM ---
  const form = document.getElementById("form-alta-usuario");
  const btnVolver = document.getElementById("btn-volver");
  const btnCancelar = document.getElementById("btn-cancelar");
  const passwordInput = document.getElementById("contrasena");
  const confirmPasswordInput = document.getElementById("confirmar-contrasena");
  const passwordStrengthBar = document.getElementById("password-strength-bar");
  const passwordStrengthText = document.getElementById("password-strength-text");
  const tablaBody = document.getElementById("cuerpo-tabla-usuarios");

  // --- Base de datos local (localStorage) ---
  const USUARIOS_KEY = "usuariosAppDB";
  const getUsuarios = () => JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
  const saveUsuarios = (usuarios) =>
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));

  // --- Función para renderizar la tabla de usuarios ---
  const renderizarTablaUsuarios = () => {
    tablaBody.innerHTML = ""; // Limpiar tabla
    const usuarios = getUsuarios();

    if (usuarios.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay usuarios registrados.</td></tr>`;
      return;
    }

    usuarios.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.nombre}</td>
        <td>${user.apellidos}</td>
        <td>${user.email}</td>
        <td>******</td> <td>
          <button class="btn btn-danger btn-sm btn-eliminar" data-email="${user.email}" title="Eliminar usuario">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  };

  // --- Función para eliminar usuario ---
  const handleEliminarUsuario = (e) => {
    // Usar .closest() para capturar clic en el icono <i> dentro del <button>
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (!btnEliminar) {
      return; // No se hizo clic en un botón de eliminar
    }

    const email = btnEliminar.dataset.email;
    if (
      !confirm(`¿Está seguro de que desea eliminar al usuario con email: ${email}?`)
    ) {
      return;
    }

    let usuarios = getUsuarios();
    usuarios = usuarios.filter((u) => u.email !== email);
    saveUsuarios(usuarios);

    renderizarTablaUsuarios(); // Re-renderizar la tabla
  };

  // --- Función para evaluar fuerza de contraseña ---
  const evaluarContrasena = (password) => {
    let fuerza = 0;
    if (password.length >= 8) fuerza += 1;
    if (/[A-Z]/.test(password)) fuerza += 1;
    if (/[a-z]/.test(password)) fuerza += 1;
    if (/\d/.test(password)) fuerza += 1;
    // La expresión original ([^A-Za-z0-9]) pedía un símbolo.
    // Si la contraseña tiene 8+ y cumple mayús, minús y núm, ya es fuerte (4/5)
    // Ajusto el criterio para 4 condiciones.
    const criterios = 4;
    fuerza = 0;
    if (password.length >= 8) fuerza++;
    if (/[A-Z]/.test(password)) fuerza++;
    if (/[a-z]/.test(password)) fuerza++;
    if (/\d/.test(password)) fuerza++;

    return { fuerza, porcentaje: (fuerza / criterios) * 100 };
  };

  const actualizarBarraContrasena = (password) => {
    const { fuerza, porcentaje } = evaluarContrasena(password);
    let color = "danger";
    let texto = "Débil";

    if (fuerza >= 4) {
      color = "success";
      texto = "Fuerte";
    } else if (fuerza === 3) {
      color = "warning";
      texto = "Media";
    }

    passwordStrengthBar.className = `progress-bar bg-${color}`;
    passwordStrengthBar.style.width = `${porcentaje}%`;
    passwordStrengthText.textContent = password ? `Seguridad: ${texto}` : "";
  };

  passwordInput.addEventListener("input", (e) => {
    actualizarBarraContrasena(e.target.value);
  });

  // --- Validación personalizada de contraseñas ---
  const validarCoincidenciaContrasenas = () => {
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden");
    } else {
      confirmPasswordInput.setCustomValidity("");
    }
  };

  confirmPasswordInput.addEventListener("input", validarCoincidenciaContrasenas);
  passwordInput.addEventListener("input", validarCoincidenciaContrasenas);

  // --- Botón volver ---
  btnVolver.addEventListener("click", () => {
    window.history.back();
  });

  // --- Botón cancelar ---
  btnCancelar.addEventListener("click", () => {
    const confirmar = confirm(
      "¿Desea cancelar el registro y limpiar el formulario?"
    );
    if (confirmar) {
      form.reset();
      form.classList.remove("was-validated");
      passwordStrengthBar.style.width = "0%";
      passwordStrengthText.textContent = "";
    }
  });

  // --- Validación y envío del formulario ---
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Validar coincidencia de contraseñas antes de checkValidity
    validarCoincidenciaContrasenas();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Si pasa la validación, quitamos 'was-validated' para limpiar errores previos
    form.classList.remove("was-validated");

    // Recoger todos los datos
    const nuevoUsuario = {
      nombre: document.getElementById("nombre").value.trim(),
      apellidos: document.getElementById("apellidos").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      fechaNacimiento: document.getElementById("fecha-nacimiento").value,
      genero: document.getElementById("genero").value,
      usuario: document.getElementById("usuario").value.trim(),
      rol: document.getElementById("rol").value,
      contrasena: passwordInput.value, // Guardar la contraseña
      departamento: document.getElementById("departamento").value,
      estado: document.getElementById("estado").value,
      direccion: document.getElementById("direccion").value.trim(),
      observaciones: document.getElementById("observaciones").value.trim(),
      suscrito: document.getElementById("enviar-correo").checked,
      aceptaTerminos: document.getElementById("acepta-terminos").checked,
    };

    // --- Validación de usuarios existentes ---
    const usuarios = getUsuarios();
    const emailExiste = usuarios.some((u) => u.email === nuevoUsuario.email);
    const usuarioExiste = usuarios.some(
      (u) => u.usuario === nuevoUsuario.usuario
    );

    let hayError = false;
    if (emailExiste) {
      alert("Error: El correo electrónico ya está registrado.");
      document.getElementById("email").classList.add("is-invalid");
      hayError = true;
    } else {
      document.getElementById("email").classList.remove("is-invalid");
    }

    if (usuarioExiste) {
      alert("Error: El nombre de usuario ya está en uso.");
      document.getElementById("usuario").classList.add("is-invalid");
      hayError = true;
    } else {
      document.getElementById("usuario").classList.remove("is-invalid");
    }

    if (hayError) {
      return; // Detener el envío
    }

    // --- Guardar usuario y actualizar UI ---
    usuarios.push(nuevoUsuario);
    saveUsuarios(usuarios);

    // Mostrar confirmación (sin datos sensibles como la contraseña)
    alert(`✅ Usuario registrado correctamente:\n
Nombre: ${nuevoUsuario.nombre} ${nuevoUsuario.apellidos}
Usuario: ${nuevoUsuario.usuario}
Email: ${nuevoUsuario.email}
Rol: ${nuevoUsuario.rol}
Departamento: ${nuevoUsuario.departamento || "N/A"}
Estado: ${nuevoUsuario.estado}`);

    // Limpiar el formulario
    form.reset();
    form.classList.remove("was-validated");
    passwordStrengthBar.style.width = "0%";
    passwordStrengthText.textContent = "";

    // Actualizar la tabla
    renderizarTablaUsuarios();
  });

  // --- Listeners de eventos ---
  tablaBody.addEventListener("click", handleEliminarUsuario);

  // --- Carga inicial ---
  renderizarTablaUsuarios();
});

// Llamada a la función (si es necesaria fuera del DOMContentLoaded)
altaUsuariosPage();