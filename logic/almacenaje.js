
//"Base de datos" voluntariado nombre voluntariadoDB
let db;


//crea tabla voluntariados si no existe
export function initDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open("voluntariadoDB", 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;

            if (!db.objectStoreNames.contains("voluntariados")) {
                db.createObjectStore("voluntariados", { keyPath: "id", autoIncrement: true });
            }

        };
        //comprobación de la base de datos
        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(db);
        };
        request.onerror = function () {
            reject("Error al abrir IndexDB");
        };
    });
};




//---------  operaciones CRUD Voluntariados -----------------

export function insertarVoluntariado(voluntariado) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Base de datos no inicializada");
            return;
        }
        const transaction = db.transaction("voluntariados", "readwrite");
        const store = transaction.objectStore("voluntariados");

        const request = store.add(voluntariado);

        request.onsuccess = function () {
            console.log("Voluntariado insertado correctamente");
            resolve();
        };

        request.onerror = function () {
            console.error("Error al insertar voluntariado");
            reject("Error al insertar voluntariado");
        };

    });
}

export function obtenerVoluntariados() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Base de datos no inicializada");
            return;
        }
        const transaction = db.transaction("voluntariados", "readonly");
        const store = transaction.objectStore("voluntariados");

        const request = store.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        }

        request.onerror = function () {
            reject("Error al obtener voluntariados")
        }
    })
}

export function borrarVoluntariado(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Base de datos no inicializada");
            return;
        }

        const transaction = db.transaction("voluntariados", "readwrite");
        const store = transaction.objectStore("voluntariados");

        const request = store.delete(id);

        request.onsuccess = function () {
            console.log(`Voluntariado con id ${id} borrado correctamente`);
            resolve();
        };

        request.onerror = function () {
            reject("Error al borrar el voluntariado");
        };
    });
}