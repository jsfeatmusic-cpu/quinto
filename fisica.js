// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// ⚠️ IMPORTANTE: Aquí debes pegar la URL que te da Apps Script, NO el link de la planilla.
// Tiene que verse similar a: 'https://script.google.com/macros/s/AKfycby.../exec'
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyVXvxTHdnfPwWzy202u6Dhgx8JPDpHd2eBwWRZn4pqbGl_d8bPGr06JI_ZxSsD46cosg/exec'; 

// --- NAVEGACIÓN ---
function openTab(tabName, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    btnElement.classList.add('active');
    
    if(tabName === 'entrenamiento') startSim();
}

// --- GESTIÓN DE MISIONES (GOOGLE SHEETS) ---
async function loadNotices() {
    const list = document.getElementById('lista-avisos');
    list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">🛰 Escaneando satélites...</p>';
    
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        list.innerHTML = '';
        
        if(data.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-style:italic;">No hay transmisiones pendientes en la base.</p>';
            return;
        }
        
        data.reverse().forEach(item => {
            list.innerHTML += `
                <div class="notice-card">
                    <button class="btn-delete" onclick="deleteNotice(${item.row})" title="Borrar Transmisión">✖</button>
                    <small style="color: var(--text-muted);">${item.date}</small>
                    <h3 style="color: var(--accent); margin: 5px 0;">${item.title}</h3>
                    <p>${item.desc}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank" class="btn-action" style="display:inline-block; margin-top:10px; text-decoration:none;">📂 Abrir Archivo</a>` : ''}
                </div>
            `;
        });
    } catch (e) {
        console.error("Error en la conexión:", e);
        list.innerHTML = '<p style="color: var(--danger); text-align:center;">⚠️ Error de conexión con la base estelar. Verifica que la URL de WEB_APP_URL sea la de Apps Script.</p>';
    }
}

async function addNotice() {
    const title = document.getElementById('notice-title').value;
    const desc = document.getElementById('notice-desc').value;
    const link = document.getElementById('notice-link').value;

    if(!title) return alert("¡Título requerido para la transmisión!");

    const payload = {
        action: 'add',
        title, desc, link,
        date: new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })
    };

    // Cambio visual mientras carga
    const btn = document.querySelector('.admin-panel .btn-action');
    const originalText = btn.innerText;
    btn.innerText = "Emitiendo señal...";
    btn.disabled = true;

    try {
        // Envío a Google Sheets
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });

        // Limpiar inputs y recargar después de un breve delay
        setTimeout(() => {
            document.getElementById('notice-title').value = '';
            document.getElementById('notice-desc').value = '';
            document.getElementById('notice-link').value = '';
            btn.innerText = originalText;
            btn.disabled = false;
            loadNotices();
        }, 1500);
    } catch (error) {
        alert("Falla de comunicación al intentar enviar la misión.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// NUEVA FUNCIÓN AGREGADA: Necesaria para borrar los avisos
async function deleteNotice(rowNumber) {
    if(confirm("¿Seguro que deseas borrar esta transmisión del satélite general? Desaparecerá para todos los cadetes.")) {
        try {
            document.getElementById('lista-avisos').innerHTML = '<p style="text-align:center; color:var(--danger);">Borrando datos del servidor...</p>';
            
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'delete', row: rowNumber })
            });

            setTimeout(() => {
                loadNotices();
            }, 1500);

        } catch(e) {
            alert("Error al intentar borrar la transmisión.");
        }
    }
}

// --- SIMULADOR DE ENTRENAMIENTO ---
const preguntas = [
    { q: "¿Cuál es la unidad de medida de la Fuerza?", a: ["Newton", "Joule", "Pascal"], c: 0 },
    { q: "¿Qué sucede con la materia si aumenta mucho el calor?", a: ["Desaparece", "Se transforma", "Se enfría"], c: 1 }
];

function startSim() {
    const container = document.getElementById('opciones-contenedor');
    const qData = preguntas[Math.floor(Math.random() * preguntas.length)];
    
    document.getElementById('pregunta-texto').innerText = qData.q;
    container.innerHTML = '';
    
    qData.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = 'btn-action';
        btn.style.background = '#334155';
        btn.style.marginTop = '10px';
        btn.onclick = () => {
            if(i === qData.c) {
                alert("¡Correcto, Cadete!");
                startSim();
            } else {
                alert("Falla en los sistemas. Intenta de nuevo.");
            }
        };
        container.appendChild(btn);
    });
}

// Inicialización
window.onload = loadNotices;
