document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-reserva");
    const campos = {
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        correo: document.getElementById("correo"),
        telefono: document.getElementById("telefono"),
        fechaIni: document.getElementById("fechaIni"),
        fechaFin: document.getElementById("fechaFin"),
        horaIni: document.getElementById("horaIni"),
        horaFin: document.getElementById("horaFin"),
        tipo: document.getElementById("tipo"),
        duracion: document.getElementById("duracion"),
    }

    const progreso = document.getElementById("progreso");
    const confirmarBtn = document.getElementById("confirmarReserva");

    function validarFormulario(event) {
        event.preventDefault();
        const validarFecha = validarFechaIni() && validarFechaFin() && validarHoraIni() && validarHoraFin();
        if (!validarNombre() || !validarApellido() || !validarCorreo() || !validarFecha || !validarVehiculo() || !validarTelefono() || !validarDuracion()) {
            alert("Por favor, corrige los errores antes de enviar el formulario.");
            return false;
        }
        
        const modal = new bootstrap.Modal(document.getElementById("confirmacionModal"));
        modal.show();
        
        // Si todo está bien, el formulario se envía con fetch
        confirmarBtn.onclick = function () {
            const datosReserva = {
            nombre: campos.nombre.value,
            apellido: campos.apellido.value,
            correo: campos.correo.value,
            telefono: campos.telefono.value,
            tipo: campos.tipo.value,
            fechaIni: campos.fechaIni.value,
            horaIni: campos.horaIni.value,
            fechaFin: campos.fechaFin.value,
            horaFin: campos.horaFin.value,
            duracion: campos.duracion.value,
            condiciones: document.getElementById("condiciones").checked
        };

        fetch("/reservas/api/reservas", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datosReserva)
        })
        .then(
            async response => {  //Espera el json
                const data = await response.json();
                const errores = document.getElementById("mensajes");

                if (!response.ok) {
                    errores.innerHTML = data.errores.map(e => `
                        <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                        </div>`).join("");
                    throw new Error("Errores de validación en el formulario de reservas");
                }

                errores.innerHTML = "";
                return data;
                
        })
        .then(reserva => {
            window.location.href = "/admin/listareservas";
            formulario.reset();
            progreso.value=0;
        })
        .catch(error => {
            console.error("Error: " + error.message);
        })
        }
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
            campos.tipo,
            campos.tipo.value.trim() !== "",
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
        if (campos.tipo.value && validarVehiculo()) validos++;
        if (campos.fechaIni.value && validarFechaIni()) validos++;
        if (campos.horaIni.value && validarHoraIni()) validos++;
        if (campos.fechaFin.value && validarFechaFin()) validos++;
        if (campos.horaFin.value && validarHoraFin()) validos++;
        if (campos.duracion.value && validarDuracion()) validos++;

        progreso.value = (validos / total) * 100;

        console.log(validos);
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
    campos.tipo.addEventListener("change", validarVehiculo);
    campos.duracion.addEventListener("input", validarDuracion);

    // Vaidar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
});


