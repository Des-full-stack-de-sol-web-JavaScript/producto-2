export function dashboardCard({ title, date, description, author, category, color, email }) {
  const cardColumn = document.createElement('div');
  
  cardColumn.className = 'col-lg-6 col-md-4 col-sm-12';

  cardColumn.innerHTML = `
    <div class="card" style="--accent-color: ${color || '#007bff'}">
      <div class="accent"></div> 
      <div class="body">
        <h3 class="title">${title}</h3>
        <p class="date">${new Date(date).toLocaleDateString()}</p>
        <p class="description">${description}</p>
        <div class="meta">
          <p><span class="meta-label">Publicado por:</span> ${author}</p>
          <p><span class="meta-label">Categoría:</span> <span class="badge">${category}</span></p>
          <p><span class="meta-label">Email:</span> ${email}</p>
        </div>
      </div>
    </div>
  `;
  
  return cardColumn;
}