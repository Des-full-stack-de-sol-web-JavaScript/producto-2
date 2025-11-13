import { userList } from "../assets/data/userList.js";

// Variable privada para la conexión a la base de datos
let db;

const almacenaje = {

  // ==========================================
  // 1. GESTIÓN DE INDEXEDDB (VOLUNTARIADOS)
  // ==========================================
  initDB() {
    return new Promise((resolve, reject) => {
      console.log("Inicializando IndexedDB...");
      const request = indexedDB.open("voluntariadoDB", 1);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("voluntariados")) {
          db.createObjectStore("voluntariados", { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onerror = () => reject("Error al abrir IndexDB");
    });
  },

  insertarVoluntariado(voluntariado) {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB no inicializada");
      
      const transaction = db.transaction("voluntariados", "readwrite");
      const store = transaction.objectStore("voluntariados");
      const request = store.add(voluntariado);

      request.onsuccess = () => {
        console.log("Voluntariado insertado");
        resolve();
      };
      request.onerror = () => reject("Error al insertar");
    });
  },

  obtenerVoluntariados() {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB no inicializada");

      const transaction = db.transaction("voluntariados", "readonly");
      const store = transaction.objectStore("voluntariados");
      const request = store.getAll();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject("Error al obtener datos");
    });
  },

  borrarVoluntariado(id) {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB no inicializada");

      const transaction = db.transaction("voluntariados", "readwrite");
      const store = transaction.objectStore("voluntariados");
      const request = store.delete(Number(id));

      request.onsuccess = () => {
        console.log(`ID ${id} borrado`);
        resolve();
      };
      request.onerror = () => reject("Error al borrar");
    });
  },

  // ==========================================
  // 2. GESTIÓN DE LOCALSTORAGE (USUARIOS Y SESIÓN)
  // ==========================================

  initusers() {
    if (!localStorage.getItem("usersList")) {
      localStorage.setItem("usersList", JSON.stringify(userList));
    }
  },

  obtenerUsuarios() {
    const usersJSON = localStorage.getItem("usersList");
    return usersJSON ? JSON.parse(usersJSON) : [];
  },

  registrarUsuario(nuevoUsuario) {
    const users = this.obtenerUsuarios(); // Usamos 'this' para llamar a funciones internas
    if (users.some(u => u.email === nuevoUsuario.email)) {
      return false;
    }
    users.push(nuevoUsuario);
    localStorage.setItem("usersList", JSON.stringify(users));
    return true;
  },

  borrarUsuario(email) {
    let users = this.obtenerUsuarios();
    const initLen = users.length;
    users = users.filter(u => u.email !== email);
    
    if (users.length < initLen) {
      localStorage.setItem("usersList", JSON.stringify(users));
      return true;
    }
    return false;
  },

  loguearUsuario(emailLogin, passwordLogin) {
    const users = this.obtenerUsuarios();
    const login = users.find(u => u.email === emailLogin && u.password === passwordLogin);

    if (login) {
      // Guardamos el usuario sin la contraseña por seguridad
      const { password, ...userSafe } = login;
      localStorage.setItem("activeUser", JSON.stringify(userSafe));
      return true;
    }
    return false;
  },

  logoutUser() {
    localStorage.removeItem("activeUser");
  },

  getCurrentUser() {
    const userJSON = localStorage.getItem("activeUser");
    return userJSON ? JSON.parse(userJSON) : null;
  },

  mostrarUsuarioActivo() {
    return this.getCurrentUser() ? this.getCurrentUser().nombre : "-- no login --";
  }
};

export default almacenaje;