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
    const icono = boton.querySelector("i");

    //const botonAcc = document.getElementByClassName("iconoAccesibilidad")[0];

    if (body.classList.contains("alto-contraste")) {
        icono.classList.replace("bi-moon-stars-fill", "bi-brightness-high-fill");
        //botonAcc.classList.replace("btn btn-outline-dark", "btn btn-outline-light");
    } else {
        icono.classList.replace("bi-brightness-high-fill", "bi-moon-stars-fill");
       // botonAcc.classList.replace("btn btn-outline-light", "btn btn-outline-dark");
    }
    guardarPreferencia("altoContraste", body.classList.contains("alto-contraste"))
})

window.addEventListener("DOMContentLoaded", () => {
  cargarPreferencias();
});