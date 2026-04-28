// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
const WEB_APP_URL = 'https://docs.google.com/spreadsheets/d/1wR4yojz8tHk0MQX0NsZ_-cnwvcKEdOOpQV2Xzhde2V4/edit?gid=1423478089#gid=1423478089'; // Reemplazar con tu URL real

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
    list.innerHTML = '<p>🛰 Escaneando satélites...</p>';
    
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        list.innerHTML = '';
        
        data.reverse().forEach(item => {
            list.innerHTML += `
                <div class="notice-card">
                    <button class="btn-delete" onclick="deleteNotice(${item.row})">✖</button>
                    <small>${item.date}</small>
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank" class="btn-action">📂 Abrir Archivo</a>` : ''}
                </div>
            `;
        });
    } catch (e) {
        list.innerHTML = '<p>⚠️ Error de conexión con la base estelar.</p>';
    }
}

async function addNotice() {
    const title = document.getElementById('notice-title').value;
    const desc = document.getElementById('notice-desc').value;
    const link = document.getElementById('notice-link').value;

    if(!title) return alert("¡Título requerido!");

    const payload = {
        action: 'add',
        title, desc, link,
        date: new Date().toLocaleDateString()
    };

    // Envío a Google Sheets
    await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    });

    setTimeout(loadNotices, 1500);
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
