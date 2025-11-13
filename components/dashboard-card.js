export function dashboardCard(item) {
  let accentColor = '#0d6efd'; 
  if (item.type === 'Petición') accentColor = '#6f42c1'; // Morado
  if (item.type === 'Oferta') accentColor = '#198754';   // Verde

  // Contenedor de columna Bootstrap (Responsive)
  const cardColumn = document.createElement('div');
  cardColumn.className = 'col-12 col-md-6 dashboard-card-wrapper';

  cardColumn.innerHTML = `
    <div class="card">
      <div class="accent" style="background-color: ${accentColor};"></div>
      
      <div class="body">
        <h3 class="title">${item.title}</h3>
        <p class="date">${new Date(item.date).toLocaleDateString()}</p>
        <p class="description">${item.description}</p>
        
        <div class="meta">
          <p>
            <span class="meta-label">Publicado por:</span> ${item.author || 'Anónimo'}
          </p>
          <p>
            <span class="meta-label">Categoría:</span> 
            <span class="badge">${item.category || item.type}</span>
          </p>
          <p>
            <span class="meta-label">Email:</span> ${item.email}
          </p>
        </div>
      </div>
    </div>
  `;

  const card = cardColumn.querySelector('.card');
  card.style.cursor = 'grab';

  return cardColumn;
}