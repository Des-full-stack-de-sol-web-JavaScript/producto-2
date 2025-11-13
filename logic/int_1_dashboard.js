import { almacenaje } from "./almacenaje.js";
import { dashboardCard } from "../components/dashboard-card.js";

// --- ELEMENTOS DEL DOM ---
const contDisponibles = document.getElementById("dashboard");
const contSeleccionados = document.getElementById("dashboard-box");
const botonesFiltro = document.querySelectorAll(".buttons-container .btn");
const contBotones = document.querySelector(".buttons-container");

/**
 * Función Principal
 */
async function iniciarPaginaPrincipal() {
  console.log("Iniciando pagina");

  if (!contDisponibles || !contSeleccionados) {
    console.error("No se han encontrado los contenedores");
    return;
  }
  console.log("Contenedores HTML encontrados");

  try {
    // Inicializamos la DB
    await almacenaje.initDB();
    // Inicializamos usuarios por si es la primera vez
    
    console.log("Base de datos conectada");

    const todosLosVoluntariados = await almacenaje.obtenerVoluntariados();
    console.log(`4. Obtenidos ${todosLosVoluntariados.length} voluntariados.`);

    if (todosLosVoluntariados.length === 0) {
      console.warn("Base de datos vacia");
      contDisponibles.innerHTML =
        "<p>No hay voluntariados en la base de datos, puedes crear uno en la pestaña de voluntariados.</p>";
    }

    // --- CORRECCIÓN DEL ERROR AQUÍ ---
    // Usamos 'activeUser' en todo momento para evitar ReferenceError
    const activeUser = almacenaje.obtenerUsuarioActivo();

    let claveGuardado;
    let datosParaMostrar;

    if (activeUser) {
      console.log(`5. MODO PRIVADO para ${activeUser.email}`);
      claveGuardado = `seleccion_${activeUser.email}`;
      datosParaMostrar = todosLosVoluntariados;
      if (contBotones) contBotones.style.display = "block";
    } else {
      console.log("Es un modo publico");
      claveGuardado = "seleccionIndex";
      datosParaMostrar = todosLosVoluntariados;
      if (contBotones) contBotones.style.display = "none";
    }

    const idsGuardados = JSON.parse(localStorage.getItem(claveGuardado)) || [];
    console.log(
      `6. Clave de guardado: ${claveGuardado}. IDs encontrados: ${idsGuardados.length}`
    );

    // Ahora pasamos 'activeUser' que ya está definido correctamente arriba
    renderizarTodo(
      datosParaMostrar,
      idsGuardados,
      claveGuardado,
      activeUser,
      todosLosVoluntariados
    );

    console.log("Dashboard cargado correctamente");
  } catch (error) {
    console.error("Hay un error al cargar la pagina principal", error);
    contDisponibles.innerHTML = `<p class="text-danger">Error al cargar la base de datos: ${error.message}</p>`;
  }
}

// Renderizado de tarjetas
function renderizarTodo(
  datosParaMostrar,
  idsGuardados,
  claveGuardado,
  activeUser,
  todosLosVoluntariados
) {
  contDisponibles.innerHTML = "";
  contSeleccionados.innerHTML = "";

  datosParaMostrar.forEach((item) => {
    const tarjetaElement = dashboardCard(item);

    // Activamos Drag & Drop
    tarjetaElement.draggable = true;
    tarjetaElement.dataset.itemId = item.id;

    tarjetaElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", event.target.dataset.itemId);
      event.target.classList.add("dragging");
    });

    tarjetaElement.addEventListener("dragend", (event) => {
      event.target.classList.remove("dragging");
    });

    // Renderizamos en la columna correcta
    if (idsGuardados.includes(item.id)) {
      contSeleccionados.appendChild(tarjetaElement);
    } else {
      contDisponibles.appendChild(tarjetaElement);
    }
  });

  activarZonasDrop(claveGuardado);

  if (activeUser) {
    conectarFiltros(
      activeUser,
      todosLosVoluntariados,
      idsGuardados,
      claveGuardado
    );
  }
}

// Activa las columnas para que sean Zonas de "Drop".
function activarZonasDrop(claveGuardado) {
  const zonas = [contDisponibles, contSeleccionados];

  zonas.forEach((zona) => {
    const manejadorDragOver = (event) => handleDragOver(event);
    const manejadorDragLeave = (event) => handleDragLeave(event);

    if (zona._manejadorDragOver)
      zona.removeEventListener("dragover", zona._manejadorDragOver);
    if (zona._manejadorDragLeave)
      zona.removeEventListener("dragleave", zona._manejadorDragLeave);

    zona.addEventListener("dragover", manejadorDragOver);
    zona.addEventListener("dragleave", manejadorDragLeave);

    zona._manejadorDragOver = manejadorDragOver;
    zona._manejadorDragLeave = manejadorDragLeave;

    activarDropEnZona(zona, claveGuardado);
  });
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function activarDropEnZona(zona, claveGuardado) {
  const manejadorDrop = (event) => {
    handleDrop(event, claveGuardado);
  };

  if (zona._manejadorDrop) {
    zona.removeEventListener("drop", zona._manejadorDrop);
  }
  zona._manejadorDrop = manejadorDrop;
  zona.addEventListener("drop", manejadorDrop);
}

function handleDrop(event, claveDeGuardado) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const itemId = event.dataTransfer.getData("text/plain");
  const tarjetaArrastrada = document.querySelector(
    `[data-item-id="${itemId}"]`
  );

  if (tarjetaArrastrada) {
    event.currentTarget.appendChild(tarjetaArrastrada);
    guardarSeleccionActual(claveDeGuardado);
  }
}

function guardarSeleccionActual(claveDeGuardado) {
  const tarjetasEnLaCaja = contSeleccionados.querySelectorAll("[data-item-id]");
  const arrayDeIdsNumericos = Array.from(tarjetasEnLaCaja).map((tarjeta) => {
    return Number(tarjeta.dataset.itemId);
  });
  localStorage.setItem(claveDeGuardado, JSON.stringify(arrayDeIdsNumericos));
  console.log("Selección guardada:", arrayDeIdsNumericos);
}

function conectarFiltros(
  activeUser,
  todosLosVoluntariados,
  idsGuardados,
  claveGuardado
) {
  botonesFiltro.forEach((button) => {
    const manejadorFiltro = (event) => {
      event.preventDefault();
      const filterType = button.textContent.trim();
      let datosFiltrados;

      switch (filterType) {
        case "Propias":
          datosFiltrados = todosLosVoluntariados.filter(
            (item) => item.email === activeUser.email
          );
          break;
        case "Otras":
          datosFiltrados = todosLosVoluntariados.filter(
            (item) => item.email !== activeUser.email
          );
          break;
        case "Todas":
        default:
          datosFiltrados = todosLosVoluntariados;
          break;
      }
      renderizarTodo(
        datosFiltrados,
        idsGuardados,
        claveGuardado,
        activeUser,
        todosLosVoluntariados
      );
    };

    if (button._manejadorFiltro) {
      button.removeEventListener("click", button._manejadorFiltro);
    }
    button._manejadorFiltro = manejadorFiltro;
    button.addEventListener("click", manejadorFiltro);
  });
}

iniciarPaginaPrincipal();
