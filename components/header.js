import { getActiveUser, logoutUser } from "../logic/almacenaje.js";

export function updateHeaderDisplay() {
  const headerSpan = document.querySelector('.navbar-text');
  if (!headerSpan) return;

  const active = getActiveUser();
  if (active) {
    headerSpan.textContent = active.nombre;
    headerSpan.classList.remove('text-muted');
    headerSpan.classList.add('text-white');
  } else {
    headerSpan.textContent = '-no login-';
    headerSpan.classList.remove('text-white');
    headerSpan.classList.add('text-muted');
  }
}

export function headerComponent() {
  const isGithubPages = window.location.hostname.includes("github.io");
  const BASE_PATH = isGithubPages ? "/producto-1/" : "/";

  const header = document.querySelector("#header");
  const currentUser = getActiveUser();
  console.log("currentUser", currentUser);

  let userAreaHtml = '';
  if (currentUser) {
    userAreaHtml = `
        <span class="navbar-text text-white me-2">
          ${currentUser.nombre} 
        </span>
        <button class="btn btn-outline-light btn-sm ms-2" id="logoutButton">Logout</button>
      `;
  } else {
    userAreaHtml = `
        <span class="navbar-text text-muted">
          -no login-
        </span>
      `;
  }

  header.innerHTML = ` 
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container-fluid">
              <a class="navbar-brand fw-bold" href="${BASE_PATH}index.html">Voluntariado</a>
              
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span class="navbar-toggler-icon"></span>
              </button>
              
              <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav me-auto">
                      <li class="nav-item">
                          <a class="nav-link" href="${BASE_PATH}index.html">Dashboard</a> 
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="${BASE_PATH}pages/login.html">Login</a> 
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="${BASE_PATH}pages/voluntariados.html">voluntariados</a> 
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="${BASE_PATH}pages/alta-usuario.html">Alta Usuario</a> 
                      </li>
                  </ul>
                  
                <div class="d-flex align-items-center justify-content-between">
                    ${userAreaHtml}
                </div>

              </div>
          </div>
      </nav>
    `;

    

 if (currentUser) {
  const logoutButton = header.querySelector("#logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutUser(); 
      window.location.href = `${BASE_PATH}index.html`;
    });
  }
}

  return header;
}