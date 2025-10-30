document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-registro");
    const campos = {
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        correo: document.getElementById("correo"),
        telefono: document.getElementById("telefono"),
        contraseña: document.getElementById("contrasenia"),
        repetirContraseña: document.getElementById("repetir-contrasenia"),
    }

    function validarFormulario(event) {
        if (!validarNombre() || !validarApellido() || !validarCorreo() || !validarTelefono() || !validarContrasenia() || !validarRepetirContrasenia()) {
            event.preventDefault();
            alert("Por favor, corrige los errores antes de enviar el formulario.");
            return false;
        }

        // Si todo está bien, el formulario se envía
        return true;
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
            campos.contraseña,
            regex.test(campos.contraseña.value),
            "Debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial."
        );
    }

    function validarRepetirContrasenia() {
        return validarCampo(
            campos.repetirContraseña,
            campos.repetirContraseña.value === campos.contraseña.value,
            "Las contraseñas no coinciden."
        );
    }

    // Validar en tiempo real (onInput)
    campos.nombre.addEventListener("input", validarNombre);
    campos.apellido.addEventListener("input", validarApellido);
    campos.telefono.addEventListener("input", validarTelefono);
    campos.correo.addEventListener("input", validarCorreo);
    campos.contraseña.addEventListener("input", validarContrasenia);
    campos.repetirContraseña.addEventListener("input", validarRepetirContrasenia);

    // Validar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
})