document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-registro");
    const campos = {
        nombre: document.getElementById("nombre-registro"),
        apellido: document.getElementById("apellido-registro"),
        correo: document.getElementById("correo-registro"),
        telefono: document.getElementById("telefono-registro"),
        contrasenia: document.getElementById("contrasenia-registro"),
        repetirContrasenia: document.getElementById("repetir-contrasenia-registro"),
        concesionario: document.getElementById("concesionario")
    }

    function validarFormulario(event) {
        event.preventDefault();
        if (!validarNombre() || !validarApellido() || !validarCorreo() || !validarContrasenia() || !validarRepetirContrasenia()) {
            if(campos.telefono.value !==  ""){
                !validarTelefono();
            }
            alert("Por favor, corrige los errores antes de enviar el formulario.");
            return false;
        }

        // Si todo está bien, el formulario se envía con fetch
        const datosRegistro = {
            nombre: campos.nombre.value,
            apellido: campos.apellido.value,
            correo: campos.correo.value,
            telefono: campos.telefono.value || null,
            contrasenia: campos.contrasenia.value,
            repetirContrasenia: campos.repetirContrasenia.value,
            concesionario: campos.concesionario.value
        };

        fetch("/autenticar/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro)
    })
    .then(response => {
        return response.json().then(resultadoJson => ({ ok: response.ok, body: resultadoJson }));
    })
    .then(resultado => {
        const mensajeError = document.getElementById("mensajesRegistrar");
        console.log("data:", resultado.body);

        if (!resultado.ok) {
            if (resultado.body.errores) {
                mensajeError.innerHTML = resultado.body.errores.map(e => `
                    <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                    </div>`).join("");
            } else {
                mensajeError.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${resultado.body.mensaje}</p>
                    </div>`;
            }
        } else {
            window.location.href = "/";
        }
    })
    .catch(error => {
        console.error("Error: " + error.message);
    });
}

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

    function validarNombre() {
        return validarCampo(
            campos.nombre,
            campos.nombre.value.trim().length >= 3 || campos.nombre.value.trim() == "",
            "El nombre debe tener al menos 3 caracteres."
        );
    }

    function validarApellido() {
        return validarCampo(
            campos.apellido,
            campos.apellido.value.trim().length >= 3,
            "El apellido debe tener al menos 3 caracteres."
        );
    }

    function validarTelefono() {
        const regex = /^\d{9}$/;
        return validarCampo(
            campos.telefono,
            regex.test(campos.telefono.value),
            "Introducir un teléfono válido. Por ejemplo: 987654321"

        );
    }

    function validarCorreo() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return validarCampo(
            campos.correo,
            regex.test(campos.correo.value),
            "Ingrese un correo electrónico válido."
        );
    }

    function validarContrasenia() {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return validarCampo(
            campos.contrasenia,
            regex.test(campos.contrasenia.value),
            "Debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial."
        );
    }

    function validarRepetirContrasenia() {
        return validarCampo(
            campos.repetirContrasenia,
            campos.repetirContrasenia.value === campos.contrasenia.value,
            "Las contraseñas no coinciden."
        );
    }

    // Validar en tiempo real (onInput)
    campos.nombre.addEventListener("input", validarNombre);
    campos.apellido.addEventListener("input", validarApellido);
    campos.telefono.addEventListener("input", validarTelefono);
    campos.correo.addEventListener("input", validarCorreo);
    campos.contrasenia.addEventListener("input", validarContrasenia);
    campos.repetirContrasenia.addEventListener("input", validarRepetirContrasenia);

    // Validar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
})