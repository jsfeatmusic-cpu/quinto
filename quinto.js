// --- CONFIGURACIÓN ---
// REEMPLAZA ESTA URL POR LA NUEVA QUE GENERASTE EN EL PASO 1
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzVbK1lDCnt9MUVOzREwxboTBWQRTodOPcqHsZ0MBB6pNUILM6oiB24L3WDMsYTWSdxKQ/exec';

// --- 1. CONTROL DE PESTAÑAS ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-target');
        
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(tabName).classList.add('active');
        e.target.classList.add('active');
    });
});

// --- 2. MODAL RECORDATORIO ---
document.getElementById('btn-close-reminder').addEventListener('click', () => {
    document.getElementById('reminder-modal').classList.add('hidden');
});

document.getElementById('btn-open-reminder').addEventListener('click', () => {
    document.getElementById('reminder-modal').classList.remove('hidden');
});

// --- 3. TABLÓN DE AVISOS ---
async function loadNotices() {
    const list = document.getElementById('notices-list');
    list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">📡 Sincronizando avisos con el servidor...</p>';
    
    try {
        // Al quitar mode: 'no-cors', la petición se hace normal y permite leer el JSON
        const response = await fetch(WEB_APP_URL);
        const data = await response.json(); 

        list.innerHTML = '';
        
        if(data.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:gray; font-style:italic;">No hay trabajos pendientes.</p>';
            return;
        }
        
        // Invertimos para que los más nuevos salgan arriba
        data.reverse().forEach(notice => {
            let linkHtml = notice.link ? `<a href="${notice.link}" target="_blank" class="notice-link">📄 Descargar PDF</a>` : '';
            list.innerHTML += `
                <div class="notice-card">
                    <button class="btn-delete" onclick="deleteNotice(${notice.row})" title="Borrar Aviso">✖</button>
                    <div class="notice-date">${notice.date}</div>
                    <div class="notice-title">${notice.title}</div>
                    <div class="notice-desc">${notice.desc}</div>
                    ${linkHtml}
                </div>
            `;
        });
    } catch (e) {
        console.error("Error en la conexión:", e);
        list.innerHTML = `<p style="color: var(--danger); text-align:center;">⚠️ Error de conexión: ${e.message}</p>`;
    }
}

async function addNotice() {
    const titleInput = document.getElementById('notice-title');
    const descInput = document.getElementById('notice-desc');
    const linkInput = document.getElementById('notice-link');

    if (!titleInput.value.trim()) return alert('Por favor, ingresá un título.');

    const payload = {
        action: 'add',
        title: titleInput.value.trim(),
        desc: descInput.value.trim(),
        link: linkInput.value.trim(),
        date: new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })
    };

    const btn = document.getElementById('btn-add-notice');
    const originalText = btn.innerText;
    btn.innerText = "Publicando...";
    btn.disabled = true;

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            // Usamos text/plain para evadir el preflight CORS de Google
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        titleInput.value = '';
        descInput.value = '';
        linkInput.value = '';
        await loadNotices();

    } catch (error) {
        alert("Error de red al intentar publicar el aviso.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Esta función se llama directamente desde el HTML generado dinámicamente
window.deleteNotice = async function(rowNumber) {
    if(confirm("¿Seguro que deseas borrar este aviso para todos los alumnos?")) {
        try {
            document.getElementById('notices-list').innerHTML = '<p style="text-align:center; color:var(--danger);">Borrando datos del servidor...</p>';
            
            await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'delete', row: rowNumber })
            });

            await loadNotices();

        } catch(e) {
            alert("Error al intentar borrar el aviso.");
        }
    }
};

// Event Listener para el botón de agregar
document.getElementById('btn-add-notice').addEventListener('click', addNotice);

// Cargar los avisos al iniciar
window.addEventListener('DOMContentLoaded', loadNotices);
