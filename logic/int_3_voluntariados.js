import { dashboardData } from '../assets/data/dashboardData.js';
import { almacenaje } from './almacenaje.js';

// Función principal que encapsula la lógica de la página
function voluntariadosPage() {
    console.log("Cargando página de Voluntariados...");

    const tabla = document.getElementById("tablaVoluntariado");
    const formulario = document.getElementById("formulario");
    const canvas = document.getElementById("graficoVoluntariados");

    // 1. CLÁUSULA DE GUARDA: Si no estamos en la página correcta, salimos.
    if (!tabla || !formulario || !canvas) {
        console.warn("No se encontraron los elementos necesarios (tabla, formulario o canvas).");
        return;
    }

    /**
     * Inicializa la base de datos con datos de prueba si está vacía.
     */
    async function inicializarDatos() {
        try {
            const voluntariados = await almacenaje.obtenerVoluntariados();
            if (voluntariados.length === 0) {
                console.log("BD vacía. Insertando datos de prueba...");
                // Usamos un bucle for..of para respetar la asincronía secuencialmente
                for (const v of dashboardData) {
                    await almacenaje.insertarVoluntariado(v);
                }
                console.log("Datos de prueba cargados.");
            }
        } catch (error) {
            console.error("Error al inicializar datos:", error);
        }
    }

    /**
     * Renderiza la tabla y actualiza el gráfico.
     */
    async function cargarDatosTabla() {
        try {
            const datosTabla = await almacenaje.obtenerVoluntariados();

            tabla.innerHTML = ""; // Limpiar tabla

            datosTabla.forEach((voluntariado) => {
                const fila = document.createElement("tr");
                
                // Nos aseguramos de que si falta algún campo no salga "undefined"
                fila.innerHTML = `
                    <td>${voluntariado.title || 'Sin título'}</td>
                    <td>${voluntariado.email || 'Anonimo'}</td>
                    <td>${voluntariado.date || '-'}</td>
                    <td>${voluntariado.description || ''}</td>
                    <td>${voluntariado.type || 'Otro'}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm borrarBtn" data-id="${voluntariado.id}">
                            Borrar
                        </button>
                    </td>`;

                tabla.appendChild(fila);
            });

            dibujarGrafico(datosTabla);

        } catch (error) {
            console.error("Error al cargar la tabla:", error);
            tabla.innerHTML = `<tr><td colspan="6" class="text-danger">Error cargando datos</td></tr>`;
        }
    }

    /**
     * Dibuja el gráfico en el Canvas
     */
    function dibujarGrafico(voluntariados) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);

        // --- Configuración ---
        const leyendaY = 10;
        const leyendaX = 10;
        const cuadrado = 15;
        
        // Leyenda: Petición
        ctx.font = "14px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "start";
        
        ctx.fillStyle = "purple";
        ctx.fillRect(leyendaX, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Petición", leyendaX + cuadrado + 10, leyendaY + cuadrado / 2);

        // Leyenda: Oferta
        ctx.fillStyle = "green";
        ctx.fillRect(leyendaX + 100, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Oferta", leyendaX + 100 + cuadrado + 10, leyendaY + cuadrado / 2);

        const topMargin = leyendaY + cuadrado + 40;
        const bottomMargin = 40;

        // --- Procesamiento de Datos ---
        const usuarios = {};
        voluntariados.forEach(v => {
            const email = v.email || 'unknown';
            // Fallback para author si no existe: coger la parte antes del @ del email
            const authorName = v.author || email.split('@')[0]; 
            
            if (!usuarios[email]) {
                usuarios[email] = { Petición: 0, Oferta: 0, author: authorName };
            }
            // Aseguramos que el tipo coincida exactamente (case sensitive o fallback)
            if (v.type === 'Petición' || v.type === 'Oferta') {
                usuarios[email][v.type]++;
            }
        });

        const emails = Object.keys(usuarios);
        if (!emails.length) return; // No hay datos para dibujar

        // Calcular escala
        const maxValor = Math.max(...emails.map(e => Math.max(usuarios[e].Petición, usuarios[e].Oferta)));
        // Evitar división por cero si maxValor es 0
        const escala = maxValor > 0 ? maxValor : 1;

        const gap = 30;
        const barWidth = (width - (emails.length + 1) * gap) / (emails.length * 2);

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = "12px Arial"; // Fuente un poco más pequeña para nombres largos

        // --- Dibujado de Barras ---
        emails.forEach((email, i) => {
            const { Petición: peticion, Oferta: oferta, author } = usuarios[email];
            const xPeticion = gap + i * (2 * barWidth + gap);
            const xOferta = xPeticion + barWidth;

            // Alturas proporcionales (área de dibujo disponible)
            const drawingAreaHeight = height - topMargin - bottomMargin;
            const peticionHeight = (peticion / escala) * drawingAreaHeight;
            const ofertaHeight = (oferta / escala) * drawingAreaHeight;

            // Barra Petición
            ctx.fillStyle = "purple";
            ctx.fillRect(xPeticion, height - peticionHeight - bottomMargin, barWidth, peticionHeight);

            // Barra Oferta
            ctx.fillStyle = "green";
            ctx.fillRect(xOferta, height - ofertaHeight - bottomMargin, barWidth, ofertaHeight);

            // Etiquetas de texto (Autor)
            ctx.fillStyle = "#000";
            // Cortar nombre si es muy largo para que no se solape
            const displayName = author.length > 10 ? author.substring(0, 8) + '..' : author;
            ctx.fillText(displayName, xPeticion + barWidth, height - bottomMargin + 5);

            // Valores numéricos (solo si son mayores a 0 para limpiar visualmente)
            if (peticion > 0) ctx.fillText(peticion, xPeticion + barWidth / 2, height - peticionHeight - bottomMargin - 15);
            if (oferta > 0) ctx.fillText(oferta, xOferta + barWidth / 2, height - ofertaHeight - bottomMargin - 15);
        });
    }

    /**
     * Configura los Listeners (Eventos)
     */
    function initListeners() {
        
        // 1. Evento Borrar (Delegación de eventos en la tabla)
        tabla.addEventListener("click", async (event) => {
            if (event.target.classList.contains("borrarBtn")) {
                // Confirmación básica opcional
                if(!confirm("¿Estás seguro de borrar este voluntariado?")) return;

                const id = Number(event.target.dataset.id);
                try {
                    await almacenaje.borrarVoluntariado(id);
                    await cargarDatosTabla();
                } catch (error) {
                    console.error("Error al borrar:", error);
                    alert("No se pudo borrar el registro.");
                }
            }
        });

        // 2. Evento Submit del Formulario
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();
            event.stopPropagation(); // Evita burbujeo

            formulario.classList.add('was-validated');

            if (formulario.checkValidity()) {
                const formData = new FormData(formulario);
                const nuevoVoluntariado = Object.fromEntries(formData.entries());
                
                // Añadimos autor si estamos logueados (opcional, mejora la UX)
                const usuarioActivo = almacenaje.getActiveUser();
                if (usuarioActivo) {
                    nuevoVoluntariado.author = usuarioActivo.nombre;
                } else {
                     // Si no hay usuario logueado, usamos el email del formulario como autor o 'Anonimo'
                    nuevoVoluntariado.author = nuevoVoluntariado.email ? nuevoVoluntariado.email.split('@')[0] : 'Anónimo';
                }

                try {
                    await almacenaje.insertarVoluntariado(nuevoVoluntariado);
                    
                    // Limpieza post-submit
                    formulario.classList.remove("was-validated");
                    formulario.reset();
                    
                    await cargarDatosTabla();
                    alert("Voluntariado creado correctamente.");

                } catch (error) {
                    console.error("Error al insertar:", error);
                    alert("Error al guardar el voluntariado.");
                }
            }
        });
    }

    /**
     * Inicialización secuencial
     */
    async function init() {
        try {
            await almacenaje.initDB();
            console.log("DB Conectada en Voluntariados");
            
            initListeners();
            await inicializarDatos();
            await cargarDatosTabla();
        } catch (error) {
            console.error("Error crítico iniciando Voluntariados:", error);
        }
    }

    init();
}

document.addEventListener('DOMContentLoaded', voluntariadosPage);