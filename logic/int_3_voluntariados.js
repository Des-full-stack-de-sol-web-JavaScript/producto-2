import { dashboardData } from '../assets/data/dashboardData.js';

import { insertarVoluntariado, obtenerVoluntariados, borrarVoluntariado, initDB } from './almacenaje.js';

function voluntariadosPage() {
    console.log("Voluntariados Page Loaded");

    const tabla = document.getElementById("tablaVoluntariado");
    const formulario = document.getElementById("formulario");


    /**Inicializar base de datos con datos de dashboradData.js si está vacía. */
    async function inicializarDatos() {
        const voluntariados = await obtenerVoluntariados();
        if (voluntariados.length === 0) {
            for (const v of dashboardData) {
                await insertarVoluntariado(v);
            }
        }
    }

    /* Carga los datos iniciales procedentes del archivo dashboardData.js y crea el botón  de borrado*/
    async function cargarDatosTabla() {
        const datosTabla = await obtenerVoluntariados();

        tabla.innerHTML = "";

        datosTabla.forEach((voluntariado) => {
            const fila = document.createElement("tr");

            fila.innerHTML =
                `<td>${voluntariado.title}</td>
                    <td>${voluntariado.email}</td>
                    <td>${voluntariado.date}</td>
                    <td>${voluntariado.description}</td>
                    <td>${voluntariado.type}</td>
                    <td> <button type="button" class="btn btn-danger borrarBtn" data-id="${voluntariado.id}">Borrar</button></td>`;

            tabla.appendChild(fila);
        });

        dibujarGrafico(datosTabla);
    }

    function dibujarGrafico(voluntariados) {
        const canvas = document.getElementById("graficoVoluntariados");
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // --- Leyenda simple ---
        const leyendaY = 10;
        const leyendaX = 10;
        const cuadrado = 15;
        //petición
        ctx.font = "14px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "start";
        ctx.fillStyle = "purple";
        ctx.fillRect(leyendaX, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Petición", leyendaX + cuadrado + 10, leyendaY + cuadrado / 2);

        //oferta
        ctx.fillStyle = "green";
        ctx.fillRect(leyendaX + 100, leyendaY, cuadrado, cuadrado);
        ctx.fillStyle = "#000";
        ctx.fillText("Oferta", leyendaX + 100 + cuadrado + 10, leyendaY + cuadrado / 2);

        const topMargin = leyendaY + cuadrado + 50;
        const bottomMargin = 40;

        // Agrupar voluntariados por usuario e incrementar petición y oferta
        const usuarios = {};
        voluntariados.forEach(v => {
            if (!usuarios[v.email]) usuarios[v.email] = { Petición: 0, Oferta: 0, author: v.author };
            usuarios[v.email][v.type]++;
        });

        const emails = Object.keys(usuarios);
        if (!emails.length) return;

        const maxValor = Math.max(...emails.map(e => Math.max(usuarios[e].Petición, usuarios[e].Oferta)));
        const gap = 30;
        const barWidth = (width - (emails.length + 1) * gap) / (emails.length * 2);

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = "14px Arial";


        emails.forEach((email, i) => {
            const { Petición: peticion, Oferta: oferta, author } = usuarios[email];
            const xPeticion = gap + i * (2 * barWidth + gap);
            const xOferta = xPeticion + barWidth;

            // alturas proporcionales
            const peticionHeight = (peticion / maxValor) * (height - topMargin - bottomMargin);
            const ofertaHeight = (oferta / maxValor) * (height - topMargin - bottomMargin);

            // dibujar barra Petición
            ctx.fillStyle = "purple";
            ctx.fillRect(xPeticion, height - peticionHeight - bottomMargin, barWidth, peticionHeight);

            // dibujar barra Oferta
            ctx.fillStyle = "green";
            ctx.fillRect(xOferta, height - ofertaHeight - bottomMargin, barWidth, ofertaHeight);

            // mostrar author debajo de las barras
            ctx.fillStyle = "#000";
            ctx.fillText(author, xPeticion + barWidth, height - bottomMargin + 5);

            // dibujar valores arriba de las barras
            ctx.fillText(peticion, xPeticion + barWidth / 2, height - peticionHeight - bottomMargin - 25);
            ctx.fillText(oferta, xOferta + barWidth / 2, height - ofertaHeight - bottomMargin - 25);
        });
    }



    /** Función para agrupar los eventListeners */
    function initListeners() {

        /** Se obtiene el índice del botón que contiene la clase borrarBtn y se pasa a la función borrarVoluntariado*/
        tabla.addEventListener("click", async (event) => {
            if (event.target.classList.contains("borrarBtn")) {
                const id = Number(event.target.dataset.id);
                await borrarVoluntariado(id);
                await cargarDatosTabla();
            }
        });

        /**Se comprueba si se han rellenado los campos del formulario, si está relleno: se obtienen los datos del formulario con 
         * FormData y formEntries, se insertan en IndexDB con insertarVoluntariado.
         * Si no está relleno se cambia la clase del form a was-validated para mostrar los campos incorrectos.*/
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            formulario.classList.add('was-validated');

            if (formulario.checkValidity()) {
                const formData = new FormData(formulario);
                const nuevoVoluntariado = Object.fromEntries(formData.entries());

                await insertarVoluntariado(nuevoVoluntariado);
                formulario.classList.remove("was-validated");
                formulario.reset();
                await cargarDatosTabla();

            } else {
                event.stopPropagation();
            }
        });
    }

    /** Función para la inicialización principal */
    async function init() {
        await initDB();
        initListeners();
        await inicializarDatos();
        await cargarDatosTabla();

    }

    init();
}
voluntariadosPage()
