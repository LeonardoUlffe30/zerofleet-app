const html = document.documentElement;
const body = document.body;
window.addEventListener("DOMContentLoaded", () => {
    cargarPreferencias();
    registrarAtajo("atajoReservar");
    registrarAtajo("atajoMisReservas");
});


// Funciones de sesión
async function guardarPreferencia() {
    const preferencias = {
        altoContraste: body.classList.contains("alto-contraste"),
        tamanoFuente: html.style.fontSize,
        atajos: {
            reservar: document.getElementById("atajoReservar").value,
            misReservas: document.getElementById("atajoMisReservas").value
        }
    };

    fetch("/accesibilidad/guardar-preferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencias)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error guardando preferencias");
            alert("Preferencias guardadas");
            return response.json();
        })
        .catch(err => console.error("Error guardando preferencia:", err));
}

async function cargarPreferencias() {
    fetch("/accesibilidad/obtener-preferencias")
        .then(response => {
            if (!response.ok) throw new Error("Error obteniendo preferencias");
            return response.json();
        })
        .then(data => {
            if (data.tamañoFuente) html.style.fontSize = data.fontSize;
            if (data.altoContraste) body.classList.add("alto-contraste");
        })
        .catch(err => console.error("Error obteniendo preferencias:", err));
}

// Tamaño del texto
document.getElementById("btnAumentarTexto")?.addEventListener("click", () => {
    //Coge el fontSize actual del html
    let size = parseInt(getComputedStyle(html).fontSize);
    if (size < 22) {
        html.style.fontSize = (size + 1) + "px";
        guardarPreferencia("fontSize", html.style.fontSize);
    }
})

document.getElementById("btnReducirTexto")?.addEventListener("click", () => {
    let size = parseInt(getComputedStyle(html).fontSize);
    if (size > 12) {
        html.style.fontSize = (size - 1) + "px";
    }
});

document.getElementById("btnResetTexto")?.addEventListener("click", () => {
    html.style.fontSize = "16px";
});

function registrarAtajo(inputId) {
    const input = document.getElementById(inputId);

    input.addEventListener("keydown", (e) => {
        e.preventDefault(); // evita que aparezca la letra en el input

        let combo = "";

        if (e.ctrlKey) combo += "Ctrl+";
        if (e.altKey) combo += "Alt+";
        if (e.shiftKey) combo += "Shift+";

        // Usamos e.key para obtener la tecla presionada
        let tecla = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        const teclasProhibidas = ["T", "N", "W", "F4"];

        if (teclasProhibidas.includes(tecla)) {
            input.value = ""; // opcional: limpiar
            alert("Esa combinación está reservada por el navegador, elige otra");
            return;
        }

        combo += tecla;

        input.value = combo;
    });
}

// Alto contraste
document.getElementById("btnContraste")?.addEventListener("click", () => {
    body.classList.toggle("alto-contraste");

    const boton = document.getElementById("btnContraste");
    const icono = boton.querySelector("i");

    if (body.classList.contains("alto-contraste")) {
        icono.classList.replace("bi-moon-stars-fill", "bi-brightness-high-fill");
    } else {
        icono.classList.replace("bi-brightness-high-fill", "bi-moon-stars-fill");
    }
})

