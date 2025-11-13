export function footerComponent() {
  const footer = document.querySelector("#footer");

  if (!footer) return;

  const currentYear = new Date().getFullYear();
  const appName = "Comunidad Voluntaria";

  footer.innerHTML = `
    <div class="container-fluid bg-dark py-3 mt-4">
      <div class="container">
        <p class="text-center text-white mb-0">
          © ${currentYear} ${appName}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  return footer;
}
