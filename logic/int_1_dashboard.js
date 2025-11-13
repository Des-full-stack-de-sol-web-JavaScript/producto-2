import { almacenaje } from "./almacenaje.js";
import { dashboardCard } from "../components/dashboard-card.js";
import { dashboardData } from "../assets/data/dashboardData.js";

const contDisponibles = document.getElementById("dashboard");
const contSeleccionados = document.getElementById("dashboard-box");
const botonesFiltro = document.querySelectorAll(".buttons-container .btn");
const contBotones = document.querySelector(".buttons-container");

async function iniciarPaginaPrincipal() {
  if (!contDisponibles || !contSeleccionados) return;

  try {
    await almacenaje.initDB();

    let todosLosVoluntariados = await almacenaje.obtenerVoluntariados();

    if (todosLosVoluntariados.length === 0) {
      for (const v of dashboardData) {
        await almacenaje.insertarVoluntariado(v);
      }
      todosLosVoluntariados = await almacenaje.obtenerVoluntariados();
    }

    if (todosLosVoluntariados.length === 0) {
      contDisponibles.innerHTML = `<div class="col-12 text-center text-muted py-5">
            <i class="bi bi-inbox display-1"></i>
            <p class="mt-3">No hay voluntariados disponibles.</p>
         </div>`;
    }

    const activeUser = almacenaje.obtenerUsuarioActivo();
    let claveGuardado;
    let datosParaMostrar;

    if (activeUser) {
      claveGuardado = `seleccion_${activeUser.email}`;
      datosParaMostrar = todosLosVoluntariados;
      if (contBotones) contBotones.style.display = "block";
    } else {
      claveGuardado = "seleccionIndex";
      datosParaMostrar = todosLosVoluntariados;
      if (contBotones) contBotones.style.display = "none";
    }

    const idsGuardados = JSON.parse(localStorage.getItem(claveGuardado)) || [];

    renderizarTodo(
      datosParaMostrar,
      idsGuardados,
      claveGuardado,
      activeUser,
      todosLosVoluntariados
    );
  } catch (error) {
    console.error(error);
    contDisponibles.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
}

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
    tarjetaElement.draggable = true;
    tarjetaElement.dataset.itemId = item.id;

    tarjetaElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", event.target.dataset.itemId);
      event.target.classList.add("dragging");
    });

    tarjetaElement.addEventListener("dragend", (event) => {
      event.target.classList.remove("dragging");
    });

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
  const manejadorDrop = (event) => handleDrop(event, claveGuardado);

  if (zona._manejadorDrop){
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
  const arrayDeIdsNumericos = Array.from(tarjetasEnLaCaja).map((tarjeta) =>
    Number(tarjeta.dataset.itemId)
  );
  localStorage.setItem(claveDeGuardado, JSON.stringify(arrayDeIdsNumericos));
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

      botonesFiltro.forEach((btn) => {
        btn.classList.remove("active", "btn-primary");
        btn.classList.add("btn-outline-primary");
      });

      button.classList.remove("btn-outline-primary");
      button.classList.add("active", "btn-primary");

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

    if (button._manejadorFiltro){
      button.removeEventListener("click", button._manejadorFiltro);
    }

    button._manejadorFiltro = manejadorFiltro;
    button.addEventListener("click", manejadorFiltro);
  });
}

document.addEventListener("DOMContentLoaded", iniciarPaginaPrincipal);
