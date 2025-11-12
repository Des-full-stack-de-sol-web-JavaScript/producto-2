import { postList } from '../assets/db/data.js';

function voluntariadosPage() {
    console.log("Voluntariados Page Loaded");

    const tabla = document.getElementById("tablaVoluntariado");
    const formulario = document.getElementById("formulario");

    /*se copian los datos iniciales */
    const datosTabla = [...postList];

    /* Carga los datos iniciales procedentes del archivo postList.js y crea el botón  de borrado*/
    function cargarDatosTabla() {
        tabla.innerHTML = "";

        datosTabla.forEach((voluntariado, index) => {
            const fila = document.createElement("tr");

            fila.innerHTML =`
                <td>${voluntariado.title}</td>
                <td>${voluntariado.author}</td>
                <td>${voluntariado.date}</td>
                <td>${voluntariado.description}</td>
                <td>${voluntariado.category}</td>
                <td> 
                    <button type="submit" class="btn btn-danger borrarBtn" data-index="${index}">Borrar</button>
                </td>
                `;

            tabla.appendChild(fila);
        });
    }

    /** Elimina el contenido de la fila de la tabla al pulsar el botón borrar */
    function borrarVoluntariado(index) {
        datosTabla.splice(index, 1);
        cargarDatosTabla();
    }

    /** Añade el contenido del formulario guardado en nuevoVoluntariado al array datosTabla y a la tabla. Vacía el formulario al finalizar*/
    function añadirVoluntariado(nuevoVoluntariado) {
        datosTabla.push(nuevoVoluntariado);
        cargarDatosTabla();
        formulario.reset();
        formulario.classList.remove('was-validated');
    }

    /** Función para agrupar los eventListeners */
    function initListeners() {

        /** Se obtiene el índice del botón que contiene la clase borrarBtn y se pasa a la función borrarVoluntariado*/
        tabla.addEventListener("click", (event) => {
            if (event.target.classList.contains("borrarBtn")) {
                const index = event.target.dataset.index;
                borrarVoluntariado(index);
            }
        });

        /**Se comprueba si se han rellenado los campos del formulario, si está relleno: se obtienen los datos del formulario con 
         * FormData y formEntries, se guardanen nuevoVoluntariado y se pasa a la función añadirVoluntariado.
         * Si no está relleno se cambia la clase del form a was-validated para mostrar los campos incorrectos.*/
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();

            formulario.classList.add('was-validated');

            if (formulario.checkValidity()) {
                const formData = new FormData(formulario);
                const nuevoVoluntariado = Object.fromEntries(formData.entries());
                añadirVoluntariado(nuevoVoluntariado);

            } else {
                event.stopPropagation();
            }
        });
    }

    /** Función para la inicialización principal */
    function init() {
        initListeners();
        cargarDatosTabla();
    }

    init();
}

voluntariadosPage()
