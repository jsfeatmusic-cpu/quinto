// --- NAVEGACIÓN DE PESTAÑAS ---
function openTab(tabName, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    btnElement.classList.add('active');
}

// --- CONEXIÓN A GOOGLE SHEETS (Generador de Avisos) ---
// NOTA: Debes reemplazar 'URL_DE_TU_GOOGLE_APPS_SCRIPT' con la URL web generada 
// al desplegar tu código .gs (Google Apps Script) asociado a tu Google Sheet.
const scriptURL = 'https://script.google.com/macros/s/AKfycbwP5PTTDzPvVSHoHyRXaHN8kWqIShVE6tAdYveKgb_2F647b6eYwfwZSGtvJg2ltg3l/exec'; 
const form = document.getElementById('form-avisos');
const btnSubmit = document.getElementById('btn-submit');
const feedback = document.getElementById('form-feedback');

form.addEventListener('submit', e => {
    e.preventDefault(); // Evita que la página recargue
    
    // Si no has configurado la URL real, detiene la ejecución para pruebas visuales.
    if(scriptURL === 'URL_DE_TU_GOOGLE_APPS_SCRIPT') {
        feedback.style.color = "var(--accent)";
        feedback.innerHTML = "⚠️ Debes colocar tu URL de Google Apps Script en el archivo cuarto.js para que funcione.";
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Enviando...";
    feedback.innerHTML = "";

    // API fetch para enviar los datos por método POST a Google Sheets
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            feedback.style.color = "var(--primary)";
            feedback.innerHTML = "✅ ¡Aviso guardado correctamente en Google Sheets!";
            form.reset(); // Limpia el formulario
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Enviar Aviso a Sheets 🚀";
        })
        .catch(error => {
            feedback.style.color = "red";
            feedback.innerHTML = "❌ Error al enviar. Revisa tu conexión o el script.";
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Enviar Aviso a Sheets 🚀";
            console.error('Error!', error.message);
        });
});
