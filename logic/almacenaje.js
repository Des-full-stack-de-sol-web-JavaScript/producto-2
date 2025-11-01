
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

// Inicializa la lista de usuarios en localStorage

export function initusers() {
    if(!localStorage.getItem("usersList")){
      const  users = [
  {
    rol: "usuario",
    nombre: "Kevin",
    email: "kevin.gomez@gmail.com",
    password: "password123" 
  },
  {
    rol: "usuario",
    nombre: "Thabata",
    email: "thabata.diaz@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Anna",
    email: "anna.ruiz@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Mar",
    email: "mar.sanchez@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Pol",
    email: "pol.lopez@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Lia",
    email: "lia.martin@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Rau",
    email: "rau.perez@gmail.com",
    password: "password123"
  },
  {
    rol: "usuario",
    nombre: "Jor",
    email: "jor.fernandez@gmail.com",
    password: "password123"
  }
];
    const userJson = JSON.stringify(users);
    localStorage.setItem("usersList", userJson)
    }
    

}

//La función almacenaje.loguearUsuario se utiliza para autenticar al usuario.

export function loguearUsuario (emailLogin, passwordLogin){
    const users = JSON.parse(localStorage.getItem("usersList")) || [];
    const login =  users.find(u => u.email === emailLogin && u.password === passwordLogin);

    if(login){
        localStorage.setItem("activeUser", JSON.stringify(login));
        return true;

    }else {
        return false;
    }
}

export function logoutUser (){
    localStorage.removeItem("activeUser");
}

//almacenaje.obtenerUsuarioActivo se utiliza para obtener el usuario activo.

export function getActiveUser(){
     const userJSON = localStorage.getItem("activeUser");
    if (!userJSON) return null;

    return JSON.parse(userJSON);

}