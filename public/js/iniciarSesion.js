document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formulario-iniciar-sesion");
    const correo = document.getElementById("correo");
    const contrasenia = document.getElementById("contrasenia");

    // Validar al enviar el formulario
    formulario.addEventListener("submit", procesarFormulario);

    function procesarFormulario(event) {
        event.preventDefault();

        const datosIniciarSesion = {
            correo: correo.value,
            contrasenia: contrasenia.value,
        };

        fetch(`/autenticar/iniciarSesion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosIniciarSesion)
        })
        .then(response => {
            return response.json().then(resultadoJSON => ({ ok: response.ok, body: resultadoJSON }));
        })
        .then(resultado => {
            const mensajeError = document.getElementById("mensajes");

            if (!resultado.ok) {
                if(resultado.body.errores) {
                    mensajeError.innerHTML = resultado.body.errores.map(e => `
                    <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                    </div>`).join("");
                } else {;
                    mensajeError.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${resultado.body.mensaje}</p>
                    </div>`;
                }
            } else {
                formulario.reset();
                window.location.href = "/";
            }
        })
        .catch(error => {
            console.error("Error en iniciar sesion: " + error.message);
        });
    }

});
