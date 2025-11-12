import { postList } from '../assets/db/data.js';
import { dashboardCard } from '../components/dashboard-card.js';

const contenedor = document.getElementById('dashboard');

function renderCards(dataToRender) {
  contenedor.innerHTML = '';

  if (dataToRender.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-muted">No hay publicaciones que coincidan con el filtro.</p>';
    return;
  }

  dataToRender.forEach(item => {
    contenedor.appendChild(dashboardCard(item));
  });
}


function dashboardPage() {
  console.log("Dashboard Page Loaded");

  renderCards(postList);
}

dashboardPage();