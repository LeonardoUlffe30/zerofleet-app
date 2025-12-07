const html = document.documentElement;
const body = document.body;

document.addEventListener("DOMContentLoaded", () => {
    const btnAumentarTexto = document.getElementById("btnAumentarTexto");
    const btnReducirTexto = document.getElementById("btnReducirTexto");
    const btnRestablecerTexto = document.getElementById("btnRestablecerTexto");
    const btnPreferencias = document.getElementById("guardarPreferencias");
    const atajoReservar = document.getElementById("atajoReservar");
    const atajoMisReservas = document.getElementById("atajoMisReservas");
    const btnContraste = document.getElementById("btnContraste");

    btnAumentarTexto.addEventListener("click", aumentarTexto);
    btnReducirTexto.addEventListener("click", reducirTexto);
    btnRestablecerTexto.addEventListener("click", restablecerTexto);
    btnPreferencias.addEventListener("click", guardarPreferencias);
    atajoReservar.addEventListener("keydown", (event) => registrarAtajo(event, atajoReservar));
    atajoMisReservas.addEventListener("keydown", (event) => registrarAtajo(event, atajoMisReservas));
    btnContraste.addEventListener("click", () => alternarContraste(btnContraste));

    document.addEventListener("keydown", (event) => redireccionarAtajos(event));
});


// Funciones de sesión
function guardarPreferencias() {
    const preferencias = {
        altoContraste: body.classList.contains("alto-contraste"),
        tamanoFuente: html.style.fontSize,
        atajos: {
            reservar: document.getElementById("atajoReservar").value,
            misReservas: document.getElementById("atajoMisReservas").value
        }
    };

    if (window.usuarioAutenticado) {
        // Usuario autenticado, guardar en BD
        fetch("/accesibilidad/guardar-preferencias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferencias)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error guardando preferencias");
                }
                alert("Preferencias guardadas");
                return response.json();
            })
            .catch(err => {
                console.error("Error guardando preferencias:", err);
            });

        window.atajosGlobales = preferencias.atajos;

    } else {
        // Usuario no autenticado, guardar en localStorage
        window.atajosGlobales = preferencias.atajos;
        localStorage.setItem("preferenciasAccesibilidad", JSON.stringify(preferencias));
        alert("Preferencias guardadas en el navegador");
    }
}


// Tamaño del texto
function aumentarTexto() {
    //Coge el fontSize actual del html
    let size = parseInt(getComputedStyle(html).fontSize);
    if (size < 22) {
        html.style.fontSize = (size + 1) + "px";
    }
}

function reducirTexto() {
    let size = parseInt(getComputedStyle(html).fontSize);
    if (size > 12) {
        html.style.fontSize = (size - 1) + "px";
    }
}

function restablecerTexto() {
    html.style.fontSize = "16px";
}

function registrarAtajo(event, input) {
    event.preventDefault(); // evita que aparezca la letra en el input

    let combo = "";

    if (event.ctrlKey) combo += "Ctrl+";
    if (event.altKey) combo += "Alt+";
    if (event.shiftKey) combo += "Shift+";

    // Usamos e.key para obtener la tecla presionada
    let tecla = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const teclasProhibidas = ["T", "N", "W", "F4"];

    if (teclasProhibidas.includes(tecla)) {
        input.value = ""; // opcional: limpiar
        alert("Esa combinación está reservada por el navegador, elige otra");
        return;
    }

    combo += tecla;

    input.value = combo;
}

function redireccionarAtajos(event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

    let combo = "";
    if (event.ctrlKey) combo += "Ctrl+";
    if (event.altKey) combo += "Alt+";
    if (event.shiftKey) combo += "Shift+";

    let tecla = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    combo += tecla;

    console.log("Evento keydown entrando");
    console.log("en accesibilidad.js window.atajosGlobales ", window.atajosGlobales);

    if (window.atajosGlobales.reservar && combo === window.atajosGlobales.reservar) {
        event.preventDefault();
        window.location.href = "/reservas/nuevo";
    }

    if (window.atajosGlobales.misReservas && combo === window.atajosGlobales.misReservas) {
        event.preventDefault();
        window.location.href = "/reservas/mis-reservas";
    }
}

function alternarContraste(btnContraste) {
    body.classList.toggle("alto-contraste");

    const icono = btnContraste.querySelector("i");

    if (body.classList.contains("alto-contraste")) {
        icono.classList.replace("bi-moon-stars-fill", "bi-brightness-high-fill");
    } else {
        icono.classList.replace("bi-brightness-high-fill", "bi-moon-stars-fill");
    }
}

