import { headerComponent } from '../components/header.js';
import { footerComponent } from '../components/footer.js';
import { almacenaje } from './almacenaje.js'; 

document.addEventListener('DOMContentLoaded', () => {
    console.log('Main JS: Cargando componentes globales...');
    almacenaje.initusers();
    

    // 2. Renderizamos la interfaz común
    headerComponent();
    footerComponent();
});