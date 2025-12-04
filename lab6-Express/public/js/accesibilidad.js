const html = document.documentElement;
const body = document.body;

// Funciones de sesión
async function guardarPreferencia(clave, valor) {
    fetch("/accesibilidad/guardar-preferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave, valor })
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
        if (data.fontSize) html.style.fontSize = data.fontSize;
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
    guardarPreferencia("fontSize", html.style.fontSize);
  }
});

document.getElementById("btnResetTexto")?.addEventListener("click", () => {
  html.style.fontSize = "16px";
  guardarPreferencia("fontSize", "16px");
});

// Alto contraste
document.getElementById("btnContraste")?.addEventListener("click", () => {
    body.classList.toggle("alto-contraste");

    const boton = document.getElementById("btnContraste");
    const icono = boton.querySelector("img");

    if (body.classList.contains("alto-contraste")) {
        icono.src = "assets/icons/lightMode.png";
        icono.style.background = "white";
        icono.style.borderRadius = "50%";
        icono.style.padding = "1px";
        icono.alt = "modo claro";
        boton.setAttribute("aria-label", "desactivar modo alto contraste");
    } else {
        icono.src = "assets/icons/darkMode.png";
        icono.alt = "modo oscuro";
        boton.setAttribute("aria-label", "activar modo alto contraste");
        icono.style.background = "none";
        icono.style.padding = "0";
        icono.style.borderRadius = "0";
    }
    guardarPreferencia("altoContraste", body.classList.contains("alto-contraste"))
})

window.addEventListener("DOMContentLoaded", () => {
  cargarPreferencias();
});