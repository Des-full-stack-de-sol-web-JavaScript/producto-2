export function headerComponent() {
  const isGithubPages = window.location.hostname.includes("github.io");
  const BASE_PATH = isGithubPages ? "/producto-1/" : "/";

  const header = document.querySelector("#header");

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
                   <span class="navbar-text text-white me-2">
                      -- No Loggined In --
                    </span>
                </div>

              </div>
          </div>
      </nav>
    `;

  return header;
}
