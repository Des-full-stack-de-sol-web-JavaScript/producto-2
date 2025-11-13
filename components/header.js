import almacenaje from "../logic/almacenaje.js";


export function headerComponent() {
  const headerContainer = document.querySelector("#header");
  if (!headerContainer) return;

  const isGithub = window.location.hostname.includes("github.io");
  const BASE_PATH = isGithub ? "/producto-1/" : "/";

  const currentCuser = almacenaje.getCurrentUser();
  const userClass = currentCuser ? "text-white fw-bold" : "text-muted"; 

  headerContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="${BASE_PATH}index.html">Voluntariado</a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="${BASE_PATH}index.html">Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="${BASE_PATH}pages/login.html">Login</a></li>
                <li class="nav-item"><a class="nav-link" href="${BASE_PATH}pages/voluntariados.html">Voluntariados</a></li>
                <li class="nav-item"><a class="nav-link" href="${BASE_PATH}pages/alta-usuario.html">Usuarios</a></li>
            </ul>
            
            <div class="d-flex align-items-center">
                <span class="navbar-text me-2 ${userClass}">
                    ${almacenaje.mostrarUsuarioActivo()}
                </span>
                
                ${currentCuser 
                    ? `<button class="btn btn-outline-light btn-sm ms-2" id="logoutButton">Logout</button>` 
                    : ''
                }
            </div>
        </div>
      </div>
    </nav>
  `;

  if (currentCuser) {
    const btnLogout = document.getElementById("logoutButton");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            almacenaje.logoutUser();
            window.location.href = `${BASE_PATH}pages/login.html`; 
        });
    }
  }
}