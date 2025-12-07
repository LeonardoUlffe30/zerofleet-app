document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-cargar");

    formulario.addEventListener("submit", (event) => llenarBD(event, formulario));
})

function llenarBD(event, formulario) {
    event.preventDefault();
    const formData = new FormData(formulario);
    const mensajesDiv = document.getElementById("mensaje");

    fetch("/cargar-json", {
        method: "POST",
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Entra en segundo then del fetch de cargarJSON")
            if (data.mensaje === "Datos cargados correctamente") {
                console.log("Entra en el if del fetch de datos cargados correctamente");
                setTimeout(() => {
                    window.location.href = "/";
                }, 300);
            } else {
                mensajesDiv.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <p>${data.mensaje}</p>
                </div>`;
            }
        })
        .catch((err) => {
            mensajesDiv.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <p>Error cargando datos.</p>
            </div>`;
        });
}