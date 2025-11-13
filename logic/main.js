import { headerComponent } from '../components/header.js';
import { footerComponent } from '../components/footer.js';
import { almacenaje } from './almacenaje.js'; 

document.addEventListener('DOMContentLoaded', () => {
    almacenaje.initusers();
    headerComponent();
    footerComponent();
});