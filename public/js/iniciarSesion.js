document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formulario-iniciar-sesion");
    const correo = document.getElementById("correo");
    const contrasenia = document.getElementById("contrasenia");

    // Validar al enviar el formulario
    formulario.addEventListener("submit", procesarFormulario);

    function procesarFormulario(event) {
        event.preventDefault();
        if (!validarCorreo(correo)) {
            if (correo.value !== "") {
                !validarTelefono();
            }
            alert("Por favor, corrige los errores antes de enviar el formulario.");
            return false;
        }

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

    function validarCampo(campo, condicion, mensaje) {
        var error = campo.nextElementSibling;

        if (!error || !error.classList.contains("error")) {
            error = document.createElement("span");
            error.classList.add("error");
            error.setAttribute("aria-live", "polite");
            campo.insertAdjacentElement("afterend", error);
        }

        if (campo.value == "") {
            campo.style.border = "1px solid black";
            error.textContent = "";
            return true;
        }

        if (!condicion) {
            error.textContent = mensaje;
            error.style.color = "red"
            campo.style.border = "2px solid red";
            return false;
        } else {
            campo.style.border = "2px solid green";
            if (error && error.classList.contains("error")) {
                error.textContent = "";
            }
            return true;
        }
    }

function validarCorreo(correo) {
        const regex = /^[a-zA-Z0-9._%+-]+@zfleet\.com$/;
        return validarCampo(
            correo,
            regex.test(correo.value),
            "Ingrese un correo electrónico válido."
        );
    }
