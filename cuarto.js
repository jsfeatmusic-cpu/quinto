const scriptURL = 'https://script.google.com/macros/s/AKfycbwP5PTTDzPvVSHoHyRXaHN8kWqIShVE6tAdYveKgb_2F647b6eYwfwZSGtvJg2ltg3l/exec'; // Asegúrate de poner tu URL real aquí
const form = document.getElementById('form-avisos');
const contenedorAvisos = document.getElementById('contenedor-avisos');

// --- ENVIAR AVISO ---
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "Publicando...";

    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(() => {
            document.getElementById('form-feedback').innerHTML = "✅ Publicado con éxito";
            form.reset();
            btn.disabled = false;
            btn.innerText = "Publicar Aviso";
            cargarAvisos(); // Recargar la lista automáticamente
        })
        .catch(error => console.error('Error!', error.message));
});

// --- LEER Y MOSTRAR AVISOS ---
function cargarAvisos() {
    contenedorAvisos.innerHTML = "<p>Actualizando lista...</p>";

    fetch(scriptURL) // Al ser un GET simple, el script de Google ejecutará doGet()
        .then(res => res.json())
        .then(data => {
            contenedorAvisos.innerHTML = ""; // Limpiar cargando
            
            if (data.length === 0) {
                contenedorAvisos.innerHTML = "<p>No hay avisos publicados todavía.</p>";
                return;
            }

            // Invertimos el array para que los más nuevos salgan arriba
            data.reverse().forEach(aviso => {
                const card = document.createElement('div');
                card.className = "theory-section"; // Reutilizamos el estilo CSS que ya tenías
                card.style.borderLeftColor = "var(--accent)";
                card.style.marginBottom = "10px";
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: var(--primary); font-size: 1.1rem;">${aviso.titulo}</strong>
                        <span style="font-size: 0.8rem; color: #666;">${aviso.curso}</span>
                    </div>
                    <p style="margin: 5px 0; color: #444;">${aviso.mensaje}</p>
                    <small style="color: #999; font-size: 0.7rem;">${new Date(aviso.fecha).toLocaleString()}</small>
                `;
                contenedorAvisos.appendChild(card);
            });
        })
        .catch(err => {
            contenedorAvisos.innerHTML = "<p>Error al cargar avisos. Verifica la configuración.</p>";
        });
}

// Cargar avisos al entrar a la pestaña o al iniciar
document.addEventListener('DOMContentLoaded', cargarAvisos);
