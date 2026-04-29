// ==========================================
// 1. NAVEGACIÓN DE PESTAÑAS (Aislada y Segura)
// ==========================================
function openTab(tabName, btnElement) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // Quitar el color activo de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada y pintar el botón
    document.getElementById(tabName).classList.add('active');
    btnElement.classList.add('active');
}

// ==========================================
// 2. LÓGICA DE GOOGLE SHEETS
// ==========================================
// Envolvemos esto para que solo se ejecute cuando el HTML cargue por completo
document.addEventListener('DOMContentLoaded', () => {
    
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwP5PTTDzPvVSHoHyRXaHN8kWqIShVE6tAdYveKgb_2F647b6eYwfwZSGtvJg2ltg3l/exec'; 
    const form = document.getElementById('form-avisos');
    const contenedorAvisos = document.getElementById('contenedor-avisos');

    // --- ENVIAR AVISO ---
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit');
            btn.disabled = true;
            btn.innerText = "Publicando...";

            fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                .then(() => {
                    const feedback = document.getElementById('form-feedback');
                    if(feedback) feedback.innerHTML = "✅ Publicado con éxito";
                    form.reset();
                    btn.disabled = false;
                    btn.innerText = "Publicar Aviso";
                    cargarAvisos(); // Recargar la lista automáticamente
                })
                .catch(error => {
                    console.error('Error al enviar:', error.message);
                    btn.disabled = false;
                    btn.innerText = "Publicar Aviso";
                });
        });
    }

    // --- LEER Y MOSTRAR AVISOS ---
    function cargarAvisos() {
        if (!contenedorAvisos) return; // Si no existe el contenedor, no hace nada
        
        contenedorAvisos.innerHTML = "<p>Actualizando lista...</p>";

        fetch(scriptURL) 
            .then(res => res.json())
            .then(data => {
                contenedorAvisos.innerHTML = ""; 
                
                if (data.length === 0) {
                    contenedorAvisos.innerHTML = "<p>No hay avisos publicados todavía.</p>";
                    return;
                }

                // Invertimos el array para que los más nuevos salgan arriba
                data.reverse().forEach(aviso => {
                    const card = document.createElement('div');
                    card.className = "theory-section"; 
                    card.style.borderLeftColor = "var(--accent)";
                    card.style.marginBottom = "10px";
                    
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: var(--primary); font-size: 1.1rem;">${aviso.titulo || 'Sin título'}</strong>
                            <span style="font-size: 0.8rem; color: #666;">${aviso.curso || ''}</span>
                        </div>
                        <p style="margin: 5px 0; color: #444;">${aviso.mensaje || ''}</p>
                        <small style="color: #999; font-size: 0.7rem;">${aviso.fecha ? new Date(aviso.fecha).toLocaleString() : ''}</small>
                    `;
                    contenedorAvisos.appendChild(card);
                });
            })
            .catch(err => {
                console.error("Error cargando avisos:", err);
                contenedorAvisos.innerHTML = "<p>Error al cargar avisos. Verifica tu conexión.</p>";
            });
    }

    // Llamamos a la función por primera vez
    cargarAvisos();
});
