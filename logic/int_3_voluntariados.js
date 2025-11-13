import { dashboardData } from '../assets/data/dashboardData.js';
import { almacenaje } from './almacenaje.js';

function voluntariadosPage() {
    console.log("Cargando página de Voluntariados...");

    const tabla = document.getElementById("tablaVoluntariado");
    const formulario = document.getElementById("formulario");
    const canvas = document.getElementById("graficoVoluntariados");
    const mensajeContainer = document.getElementById("mensaje-sistema");

    if (!tabla || !formulario || !canvas) return;

    // --- Notificaciones Visuales (Toast) ---
    function mostrarNotificacion(mensaje, tipo = 'success') {
        if (!mensajeContainer) return;

        mensajeContainer.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
                <div class="d-flex align-items-center">
                    <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-4 me-2"></i>
                    <div>${mensaje}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // Auto-cerrar a los 4 segundos
        setTimeout(() => {
            const alerta = mensajeContainer.querySelector('.alert');
            if (alerta) {
                alerta.classList.remove('show');
                setTimeout(() => mensajeContainer.innerHTML = '', 150);
            }
        }, 4000);
    }

    // --- Inicialización de Datos ---
    async function inicializarDatos() {
        try {
            const voluntariados = await almacenaje.obtenerVoluntariados();
            if (voluntariados.length === 0) {
                for (const v of dashboardData) {
                    await almacenaje.insertarVoluntariado(v);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function cargarDatosTabla() {
        try {
            const datosTabla = await almacenaje.obtenerVoluntariados();
            tabla.innerHTML = "";

            datosTabla.forEach((voluntariado) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${voluntariado.title || ''}</td>
                    <td>${voluntariado.email || ''}</td>
                    <td>${voluntariado.date || ''}</td>
                    <td>${voluntariado.description || ''}</td>
                    <td>${voluntariado.type || ''}</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-outline-danger btn-sm borrarBtn" data-id="${voluntariado.id}">
                            <i class="bi bi-trash"></i> Borrar
                        </button>
                    </td>`;
                tabla.appendChild(fila);
            });
            dibujarGrafico(datosTabla);
        } catch (error) {
            console.error(error);
            mostrarNotificacion("Error al cargar la tabla", "danger");
        }
    }

    function dibujarGrafico(voluntariados) {
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const leyendaY = 10;
        const leyendaX = 10;
        const cuadrado = 15;
        
        ctx.font = "14px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "start";
        
        ctx.fillStyle = "#6f42c1"; 
        ctx.fillRect(leyendaX, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Petición", leyendaX + cuadrado + 10, leyendaY + cuadrado / 2);

        ctx.fillStyle = "#198754"; 
        ctx.fillRect(leyendaX + 100, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Oferta", leyendaX + 100 + cuadrado + 10, leyendaY + cuadrado / 2);

        const usuarios = {};
        voluntariados.forEach(v => {
            const email = v.email || 'unknown';
            const authorName = v.author || email.split('@')[0];
            if (!usuarios[email]) usuarios[email] = { Petición: 0, Oferta: 0, author: authorName };
            if (v.type === 'Petición' || v.type === 'Oferta') usuarios[email][v.type]++;
        });

        const emails = Object.keys(usuarios);
        if (!emails.length) return;

        const maxValor = Math.max(...emails.map(e => Math.max(usuarios[e].Petición, usuarios[e].Oferta))) || 1;
        const topMargin = 60;
        const bottomMargin = 40;
        const gap = 30;
        const barWidth = (width - (emails.length + 1) * gap) / (emails.length * 2);

        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        emails.forEach((email, i) => {
            const { Petición: peticion, Oferta: oferta, author } = usuarios[email];
            const xPeticion = gap + i * (2 * barWidth + gap);
            const xOferta = xPeticion + barWidth;
            const drawHeight = height - topMargin - bottomMargin;

            const hPeticion = (peticion / maxValor) * drawHeight;
            const hOferta = (oferta / maxValor) * drawHeight;

            ctx.fillStyle = "#6f42c1";
            ctx.fillRect(xPeticion, height - hPeticion - bottomMargin, barWidth, hPeticion);

            ctx.fillStyle = "#198754";
            ctx.fillRect(xOferta, height - hOferta - bottomMargin, barWidth, hOferta);

            ctx.fillStyle = "#000";
            ctx.fillText(author, xPeticion + barWidth, height - bottomMargin + 15);
            
            if (peticion > 0) ctx.fillText(peticion, xPeticion + barWidth / 2, height - hPeticion - bottomMargin - 5);
            if (oferta > 0) ctx.fillText(oferta, xOferta + barWidth / 2, height - hOferta - bottomMargin - 5);
        });
    }

    function initListeners() {
        // Listener Borrar
        tabla.addEventListener("click", async (event) => {
            const btn = event.target.closest(".borrarBtn");
            if (btn) {
                if(!confirm("¿Estás seguro de borrar este voluntariado?")) return;
                
                try {
                    await almacenaje.borrarVoluntariado(Number(btn.dataset.id));
                    await cargarDatosTabla();
                    mostrarNotificacion("Voluntariado eliminado correctamente.", "warning");
                } catch (error) {
                    console.error("Error al borrar:", error);
                    mostrarNotificacion("No se pudo borrar el registro.", "danger");
                }
            }
        });

        // Listener Crear (AQUÍ ESTABA EL PROBLEMA)
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            formulario.classList.add('was-validated');

            if (formulario.checkValidity()) {
                const formData = new FormData(formulario);
                const nuevo = Object.fromEntries(formData.entries());
                
                const usuarioActivo = almacenaje.obtenerUsuarioActivo();
                nuevo.author = usuarioActivo ? usuarioActivo.nombre : (nuevo.email ? nuevo.email.split('@')[0] : 'Anónimo');

                try {
                    await almacenaje.insertarVoluntariado(nuevo);
                    
                    // Limpieza
                    formulario.classList.remove("was-validated");
                    formulario.reset();
                    await cargarDatosTabla();
                    
                    // --- NOTIFICACIÓN DE ÉXITO (Sin Alert) ---
                    mostrarNotificacion("¡Voluntariado creado con éxito!", "success");

                } catch (error) {
                    console.error("Error:", error);
                    mostrarNotificacion("Error al guardar el voluntariado.", "danger");
                }
            }
        });
    }

    async function init() {
        await almacenaje.initDB();
        initListeners();
        await inicializarDatos();
        await cargarDatosTabla();
    }

    init();
}

document.addEventListener('DOMContentLoaded', voluntariadosPage);