document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-registro");
    const campos = {
        nombre: document.getElementById("nombre-registro"),
        apellido: document.getElementById("apellido-registro"),
        correo: document.getElementById("correo-registro"),
        telefono: document.getElementById("telefono-registro"),
        contrasenya: document.getElementById("contrasenia-registro"),
        repetirContrasenya: document.getElementById("repetir-contrasenia-registro"),
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

        console.log("Pasando la validacion iniical");

        // Si todo está bien, el formulario se envía con fetch
        const datosRegistro = {
            nombre: campos.nombre.value,
            apellido: campos.apellido.value,
            correo: campos.correo.value,
            telefono: campos.telefono.value || null,
            contrasenia: campos.contrasenya.value
        };
        
        fetch("/autenticar/registrar", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datosRegistro)
        })
        .then(
            async response => {  //Espera el json
                console.log("ha llegado el json");
                const data = await response.json();
                const mensajeError = document.getElementById("mensajes");
                console.log("data:", data);
                if (!response.ok) {
                    console.log("Error en el registro:", data);
                    mensajeError.innerHTML = data.errores.map(e => `
                        <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                        </div>`).join("");
                    return false;
                }
                console.log("hollaaa");
                mensajeError.innerHTML = "";
                return true;
        })
        .then((sucess) => {
            if(sucess){
                console.log("aqiiiiiii");
                formulario.reset();
                window.location.href = "/";
            }
        })
        .catch(error => {
            console.error("Error: " + error.message);
        })
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
            campos.contrasenya,
            regex.test(campos.contrasenya.value),
            "Debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial."
        );
    }

    function validarRepetirContrasenia() {
        return validarCampo(
            campos.repetirContrasenya,
            campos.repetirContrasenya.value === campos.contrasenya.value,
            "Las contraseñas no coinciden."
        );
    }

    // Validar en tiempo real (onInput)
    campos.nombre.addEventListener("input", validarNombre);
    campos.apellido.addEventListener("input", validarApellido);
    campos.telefono.addEventListener("input", validarTelefono);
    campos.correo.addEventListener("input", validarCorreo);
    campos.contrasenya.addEventListener("input", validarContrasenia);
    campos.repetirContrasenya.addEventListener("input", validarRepetirContrasenia);

    // Validar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
})