import { dashboardCard } from '../components/dashboard-card.js';
import { initDB, obtenerVoluntariados, getActiveUser } from './almacenaje.js';

// --- ELEMENTOS DEL DOM ---
const contDisponibles = document.getElementById('dashboard');
const contSeleccionados = document.getElementById('dashboard-box');
const botonesFiltro = document.querySelectorAll('.buttons-container .btn');
const contBotones = document.querySelector('.buttons-container');

/**
 * Función para tener toda la logica de los dashboard
 */
async function iniciarPaginaPrincipal() {
    
    console.log("Iniciando pagina");

    // ¿Existen los contenedores? ---
    if (!contDisponibles || !contSeleccionados) {
        console.error("No se han encontrado los contenedores");
        return;
    }
    console.log("Contenedores HTML encontrados");

    try {
        //¿Funciona la Base de Datos?
        await initDB();
        console.log("Base de datos conectada");

        const todosLosVoluntariados = await obtenerVoluntariados();
        
        //¿Hay datos?
        console.log(`4. Obtenidos ${todosLosVoluntariados.length} voluntariados.`);
        
        if (todosLosVoluntariados.length === 0) {
            console.warn("Base de datos vacia");
            contDisponibles.innerHTML = "<p>No hay voluntariados en la base de datos, puedes crear una en la pestaña de voluntariados.</p>";
        }

        //Distinguimos si esta logueado o no y se muestran los dashboards y botones
        const activeUser = getActiveUser();
        let claveGuardado;
        let datosParaMostrar;

        if (activeUser) {
            console.log(`5. MODO PRIVADO para ${activeUser.email}`);
            claveGuardado = `seleccion_${activeUser.email}`;
            datosParaMostrar = todosLosVoluntariados;
            if (contBotones) contBotones.style.display = 'block';
        } else {
            console.log("Es un modo publico");
            claveGuardado = "seleccionIndex";
            datosParaMostrar = todosLosVoluntariados;
            if (contBotones) contBotones.style.display = 'none';
        }
        
        const idsGuardados = JSON.parse(localStorage.getItem(claveGuardado)) || [];
        console.log(`6. Clave de guardado: ${claveGuardado}. IDs encontrados: ${idsGuardados.length}`);
        console.log("Llamando a renderizarTodo()");
        renderizarTodo(datosParaMostrar, idsGuardados, claveGuardado, activeUser, todosLosVoluntariados);
        console.log("Esta conectado");

    } catch (error) {
        console.error("Hay un error al cargar la pagina principal", error);
        contDisponibles.innerHTML = `<p class="text-danger">Error al cargar la base de datos: ${error.message}</p>`;
    }
}

// Renderizado de tarjetas
function renderizarTodo(datosParaMostrar, idsGuardados, claveGuardado, activeUser, todosLosVoluntariados) {

    contDisponibles.innerHTML = '';
    contSeleccionados.innerHTML = '';
    // Recorremos los datos para mostrar
    datosParaMostrar.forEach(item => {

        const tarjetaElement = dashboardCard(item); 

        // --- Activamos que sea seleccionable y que se pueda soltar---
        tarjetaElement.draggable = true;
        tarjetaElement.dataset.itemId = item.id; 

        tarjetaElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.dataset.itemId);
            event.target.classList.add('dragging'); 
        });

        tarjetaElement.addEventListener('dragend', (event) => {
            event.target.classList.remove('dragging'); 
        });
        
        // --- Renderizamos ---
        if (idsGuardados.includes(item.id)) {
            contSeleccionados.appendChild(tarjetaElement);
        } else {
            contDisponibles.appendChild(tarjetaElement);
        }
    });
    activarZonasDrop(claveGuardado);
    if (activeUser) {
        conectarFiltros(activeUser, todosLosVoluntariados, idsGuardados, claveGuardado);
    }
}

// Activa las columnas para que sean Zonas de "Drop".

function activarZonasDrop(claveGuardado) {
    const zonas = [contDisponibles, contSeleccionados];

    zonas.forEach(zona => {
        // Usamos manejadores con nombre para poder borrarlos luego
        const manejadorDragOver = (event) => handleDragOver(event);
        const manejadorDragLeave = (event) => handleDragLeave(event);

        // Limpiamos listeners antiguos
        if (zona._manejadorDragOver) zona.removeEventListener('dragover', zona._manejadorDragOver);
        if (zona._manejadorDragLeave) zona.removeEventListener('dragleave', zona._manejadorDragLeave);

        zona.addEventListener('dragover', manejadorDragOver);
        zona.addEventListener('dragleave', manejadorDragLeave);

        zona._manejadorDragOver = manejadorDragOver;
        zona._manejadorDragLeave = manejadorDragLeave;

        // (Llamada al Paso 4)
        activarDropEnZona(zona, claveGuardado);
    });
}

// Feedback visual al arrastrar por encima
function handleDragOver(event) {
    event.preventDefault(); // ¡OBLIGATORIO! Permite soltar.
    event.currentTarget.classList.add('drag-over'); 
}

// Limpia el feedback visual al salir
function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over'); 
}

// Activamos el evento de soltar en una zona

function activarDropEnZona(zona, claveGuardado) {
    
    const manejadorDrop = (event) => {
        handleDrop(event, claveGuardado);
    };

    // Quitamos el listener drop antiguo, esto nos ayudara con los filtros
    if (zona._manejadorDrop) {
        zona.removeEventListener('drop', zona._manejadorDrop);
    }
    zona._manejadorDrop = manejadorDrop;
    zona.addEventListener('drop', manejadorDrop);
}

// accion de soltar en seleccionados

function handleDrop(event, claveDeGuardado) {
    event.preventDefault(); 
    event.currentTarget.classList.remove('drag-over'); 

    const itemId = event.dataTransfer.getData('text/plain');
    const tarjetaArrastrada = document.querySelector(`[data-item-id="${itemId}"]`);

    if (tarjetaArrastrada) {
        // 1. Movemos el elemento HTML a la nueva zona
        event.currentTarget.appendChild(tarjetaArrastrada);
        // 2. ¡LLAMAMOS A GUARDAR! (Paso 5)
        guardarSeleccionActual(claveDeGuardado);
    }
}

// Guarda en localstorage la posicion de las dashboard

function guardarSeleccionActual(claveDeGuardado) {
    const tarjetasEnLaCaja = contSeleccionados.querySelectorAll('[data-item-id]');
    const arrayDeIdsNumericos = Array.from(tarjetasEnLaCaja).map(tarjeta => {
        return Number(tarjeta.dataset.itemId);
    });
    localStorage.setItem(claveDeGuardado, JSON.stringify(arrayDeIdsNumericos));
    console.log('Selección guardada:', arrayDeIdsNumericos);
}

// Botones de filtro que solo se activan si estas logueado

function conectarFiltros(activeUser, todosLosVoluntariados, idsGuardados, claveGuardado) {
    
    botonesFiltro.forEach(button => {
        
        const manejadorFiltro = (event) => {
            event.preventDefault(); 
            const filterType = button.textContent.trim(); 
            let datosFiltrados;

            switch (filterType) {
                case 'Propias':
                    datosFiltrados = todosLosVoluntariados.filter(item => item.email === activeUser.email);
                    break;
                case 'Otras':
                    datosFiltrados = todosLosVoluntariados.filter(item => item.email !== activeUser.email);
                    break;
                case 'Todas':
                default:
                    datosFiltrados = todosLosVoluntariados;
                    break;
            }

            // se renderiza otra vez
            renderizarTodo(datosFiltrados, idsGuardados, claveGuardado, activeUser, todosLosVoluntariados);
        };

        // Limpiamos listeners antiguos
        if (button._manejadorFiltro) {
            button.removeEventListener('click', button._manejadorFiltro);
        }
        button._manejadorFiltro = manejadorFiltro;
        button.addEventListener('click', manejadorFiltro);
    });
}

iniciarPaginaPrincipal();