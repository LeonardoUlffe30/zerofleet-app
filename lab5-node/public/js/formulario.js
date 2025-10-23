document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-reserva");
    const campos = {
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        correo: document.getElementById("correo"),
        telefono: document.getElementById("telefono"),
        fechaIni: document.getElementById("fecha-ini"),
        fechaFin: document.getElementById("fecha-fin"),
        horaIni: document.getElementById("hora-ini"),
        horaFin: document.getElementById("hora-fin"),
        listaVehiculos: document.getElementById("lista-vehiculos"),
        duracion: document.getElementById("duracion"),
    }

    const progreso = document.getElementById("progreso");

    function validarFormulario(event) {
        const validarFecha = validarFechaIni() && validarFechaFin() && validarHoraIni() && validarHoraFin();

        if (!validarNombre() || !validarApellido() || !validarCorreo() || !validarFecha || !validarVehiculo() || !validarTelefono() || !validarDuracion() || !validarHora()) {
            event.preventDefault(); // detiene el envío del formulario
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
            campos.nombre.value.trim().length >= 3,
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

    function validarVehiculo() {
        return validarCampo(
            campos.listaVehiculos,
            campos.listaVehiculos.value.trim() !== "",
            "Debe seleccionar un vehículo"
        );
    }

    function validarFechaIni() {
        const ahora = new Date();
        const fechaActual = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

        const usuario = new Date(campos.fechaIni.value);
        const fechaIni = new Date(Date.UTC(usuario.getFullYear(), usuario.getMonth(), usuario.getDate()));

        // Validar fecha de inicio > actual
        return validarCampo(
            campos.fechaIni,
            fechaIni.getTime() >= fechaActual.getTime(),
            "La fecha de inicio debe ser posterior a la fecha actual."
        );
    }

    function validarFechaFin() {
        const ahora = new Date();
        const fechaActual = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

        const usuarioIni = new Date(campos.fechaIni.value);
        const fechaIni = new Date(Date.UTC(usuarioIni.getFullYear(), usuarioIni.getMonth(), usuarioIni.getDate()));

        const usuarioFin = new Date(campos.fechaFin.value);
        const fechaFin = new Date(Date.UTC(usuarioFin.getFullYear(), usuarioFin.getMonth(), usuarioFin.getDate()));

        // Validar fecha de fin >= actual
        if (!validarCampo(campos.fechaFin, fechaFin.getTime() >= fechaActual.getTime(), "La fecha de fin debe ser igual o posterior a la fecha actual.")) {
            return false;
        }

        if (!validarCampo(campos.fechaFin, fechaIni.getTime() <= fechaFin.getTime(), "La fecha de fin debe ser posterior a la fecha de inicio.")) {
            return false;
        }

        return true;
    }

    function validarHoraIni() {
        return validarCampo(
            campos.horaIni,
            campos.horaIni.value,
            "Selecciona una hora de inicio."
        );
    }

    function validarHoraFin() {
        const horaIni = campos.horaIni.value;
        const horaFin = campos.horaFin.value;

        const [hIni, mIni] = horaIni.split(":").map(Number);
        const [hFin, mFin] = horaFin.split(":").map(Number);

        const minutosIni = hIni * 60 + mIni;
        const minutosFin = hFin * 60 + mFin;


        // Validar inicio < fin
        if (!validarCampo(
            campos.horaFin,
            new Date(campos.fechaIni.value).getTime() < new Date(campos.fechaFin.value).getTime() || (new Date(campos.fechaIni.value).getTime() == new Date(campos.fechaFin.value).getTime() && minutosIni < minutosFin),
            "La fecha de fin debe ser posterior a la fecha de inicio.")) {
            return false;
        }

        return true;
    }

    function validarDuracion() {
        return validarCampo(
            campos.duracion,
            campos.duracion.value > 0,
            "La duración debe ser un número positivo."
        );
    }

    function actualizarProgreso() {
        const total = 10;
        let validos = 0;
        if (campos.nombre.value.trim() && validarNombre()) validos++;
        if (campos.apellido.value.trim() && validarApellido()) validos++;
        if (campos.telefono.value.trim() && validarTelefono()) validos++;
        if (campos.correo.value.trim() && validarCorreo()) validos++;
        if (campos.listaVehiculos.value && validarVehiculo()) validos++;
        if (campos.fechaIni.value && validarFechaIni()) validos++;
        if (campos.horaIni.value && validarHoraIni()) validos++;
        if (campos.fechaFin.value && validarFechaFin()) validos++;
        if (campos.horaFin.value && validarHoraFin()) validos++;
        if (campos.duracion.value && validarDuracion()) validos++;

        progreso.value = (validos / total) * 100;
    }

    // Actualizar progreso
    formulario.addEventListener("input", actualizarProgreso);

    // Validar en tiempo real (onInput)
    campos.nombre.addEventListener("input", validarNombre);
    campos.apellido.addEventListener("input", validarApellido);
    campos.telefono.addEventListener("input", validarTelefono);
    campos.correo.addEventListener("input", validarCorreo);
    campos.fechaIni.addEventListener("input", validarFechaIni);
    campos.horaIni.addEventListener("input", validarHoraIni);
    campos.fechaFin.addEventListener("input", validarFechaFin);
    campos.horaFin.addEventListener("input", validarHoraFin);
    campos.listaVehiculos.addEventListener("change", validarVehiculo);
    campos.duracion.addEventListener("input", validarDuracion);

    // Vaidar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
});


