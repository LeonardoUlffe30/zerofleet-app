document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-reserva");
    const nombre = document.getElementById("nombreCliente");
    const apellido = document.getElementById("apellidoCliente");
    const correo = document.getElementById("correoCliente");
    const telefono = document.getElementById("telefonoCliente");
    const fechaHoraIni = document.getElementById("fechaHoraIni");
    const fechaHoraFin = document.getElementById("fechaHoraFin");
    const vehiculo = document.getElementById("vehiculo");
    const duracion = document.getElementById("duracion");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarReserva");

    // Inicialización Tempus Dominus con formato correcto
    const pickerIni = new tempusDominus.TempusDominus(document.getElementById('datetimepickerIni'), {
        display: {
            components: {
                calendar: true,
                clock: true,
                date: true,
                month: true,
                year: true,
                hours: true,
                minutes: true,
                seconds: false
            },
            icons: {
                previous: 'bi bi-chevron-left',
                next: 'bi bi-chevron-right',
                up: 'bi bi-chevron-up',
                down: 'bi bi-chevron-down',
                date: 'bi bi-calendar-event',
                time: 'bi bi-clock'
            }
        },
        localization: {
            locale: 'es',
            format: 'dd/MM/yyyy HH:mm'
        }
    });

    const pickerFin = new tempusDominus.TempusDominus(document.getElementById('datetimepickerFin'), {
        display: {
            components: {
                calendar: true,
                clock: true,
                date: true,
                month: true,
                year: true,
                hours: true,
                minutes: true,
                seconds: false
            },
            icons: {
                previous: 'bi bi-chevron-left',
                next: 'bi bi-chevron-right',
                up: 'bi bi-chevron-up',
                down: 'bi bi-chevron-down',
                date: 'bi bi-calendar-event',
                time: 'bi bi-clock'
            }
        },
        localization: {
            locale: 'es',
            format: 'dd/MM/yyyy HH:mm'
        }
    });

    // Sincronizar pickers con inputs
    pickerIni.subscribe(tempusDominus.Namespace.events.change, (e) => {
        fechaHoraIni.value = e.date ? e.date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    });

    pickerFin.subscribe(tempusDominus.Namespace.events.change, (e) => {
        fechaHoraFin.value = e.date ? e.date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    });

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, nombre, apellido, telefono, correo, fechaHoraIni,
        fechaHoraFin, vehiculo, duracion));

    // Validar en tiempo real
    nombre.addEventListener("input", () => validarNombre(nombre));
    apellido.addEventListener("input", () => validarApellido(apellido));
    telefono.addEventListener("input", () => validarTelefono(telefono));
    correo.addEventListener("input", () => validarCorreo(correo));
    fechaHoraIni.addEventListener("input", () => validarFechaHoraIni(fechaHoraIni));
    fechaHoraFin.addEventListener("input", () => validarFechaHoraFin(fechaHoraIni, fechaHoraFin));
    vehiculo.addEventListener("change", () => validarVehiculo(vehiculo));
    duracion.addEventListener("input", () => validarDuracion(duracion));

    // Vaidar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, nombre, apellido, telefono, correo, fechaHoraIni,
        fechaHoraFin, vehiculo, duracion));

    confirmarModal.addEventListener("click", () => crearReserva(formulario));
});

async function crearReserva(formulario) {
    const body = {
        nombreCliente: formulario.nombreCliente.value,
        apellidoCliente: formulario.apellidoCliente.value,
        correoCliente: formulario.correoCliente.value,
        telefonoCliente: formulario.telefonoCliente.value,
        vehiculo: formulario.vehiculo.value,
        fechaIni: formulario.fechaIni.value,
        horaIni: formulario.horaIni.value,
        fechaFin: formulario.fechaFin.value,
        horaFin: formulario.horaFin.value,
        duracion: formulario.duracion.value,
        condiciones: document.getElementById("condiciones").checked
    };

    console.log("valores en crear reserva", body);

    const mensajesDiv = document.getElementById("mensajes");

    try {
        const data = await fetch("/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        const response = await data.json();

        if (data.status === 201) {
            mensajesDiv.innerHTML = "";
            //formulario.reset();
            //progreso.value = 0;
            alert("Reserva realizada");
            window.location.href = "/admin/listareservas";
        } else {
            if (response.errores) {
                mensajesDiv.innerHTML = response.errores.map(e => `
                    <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                    </div>`).join("");
            } else {
                mensajesDiv.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${response.mensaje}</p>
                    </div>`;
            }

            throw new Error(`HTTP error! status: ${data.status}`);
        }

    } catch (error) {
        console.error("Error al actualizar el concesionario:", error);
    }
}

function validarFormulario(event, nombre, apellido, telefono, correo,
    fechaHoraIni, fechaHoraFin, vehiculo, duracion) {
    event.preventDefault();

    if (!validarNombre(nombre) || !validarApellido(apellido) || !validarCorreo(correo) || !validarFechaHoraIni(fechaHoraIni) || !validarFechaHoraFin(fechaHoraIni, fechaHoraFin) ||
        !validarVehiculo(vehiculo) || !validarTelefono(telefono) || !validarDuracion(duracion)) {
        alert("Por favor, corrige los errores antes de enviar el formulario.");
        return false;
    }

    // MUY IMPORTANTE: fuerza a que los inputs guarden su valor
    document.querySelectorAll("input, select, textarea").forEach(i => i.blur());

    const modal = new bootstrap.Modal(document.getElementById("confirmacionModal"));
    modal.show();
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

function validarNombre(nombre) {
    return validarCampo(
        nombre,
        nombre.value.trim().length >= 3,
        "El nombre debe tener al menos 3 caracteres."
    );
}

function validarApellido(apellido) {
    return validarCampo(
        apellido,
        apellido.value.trim().length >= 3,
        "El apellido debe tener al menos 3 caracteres."
    );
}

function validarTelefono(telefono) {
    const regex = /^\d{9}$/;
    return validarCampo(
        telefono,
        regex.test(telefono.value),
        "Introducir un teléfono válido. Por ejemplo: 987654321"

    );
}

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validarCampo(
        correo,
        regex.test(correo.value),
        "Ingrese un correo electrónico válido."
    );
}

function validarVehiculo(vehiculo) {
    return validarCampo(
        vehiculo,
        vehiculo.value.trim() !== "",
        "Debe seleccionar un vehículo"
    );
}

function validarFechaHoraIni(fechaHoraIni) {
    const ahora = new Date();
    const valor = new Date(fechaHoraIni.value);

    console.log("Ahora ", ahora, " gettime() ", ahora.getTime());
    console.log("Fecha Hora Ini", valor, " gettime() ", valor.getTime());

    return validarCampo(
        fechaHoraIni,
        valor.getTime() >= ahora.getTime(),
        "La fecha y hora de inicio debe ser igual o posterior a la fecha y hora actual"
    )
}

function validarFechaHoraFin(fechaHoraIni, fechaHoraFin) {
    const valorInicio = new Date(fechaHoraIni.value);
    const valorFin = new Date(fechaHoraFin.value);
    const ahora = new Date();

    // Validar que la fecha + hora de fin sea >= ahora
    if (!validarCampo(fechaHoraFin, valorFin.getTime() >= ahora.getTime(), "La fecha y hora de fin debe ser igual o posterior a la fecha y hora actual.")) {
        return false;
    }

    // Validar que la fecha + hora de fin sea posterior a la fecha + hora de inicio
    if (!validarCampo(fechaHoraFin, valorFin.getTime() > valorInicio.getTime(), "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.")) {
        return false;
    }

    return true;
}

function validarFechaIni(fechaIni) {
    const ahora = new Date();
    const fechaActual = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

    const usuario = new Date(fechaIni.value);
    const fechaInicial = new Date(Date.UTC(usuario.getFullYear(), usuario.getMonth(), usuario.getDate()));

    // Validar fecha de inicio > actual
    return validarCampo(
        fechaIni,
        fechaInicial.getTime() >= fechaActual.getTime(),
        "La fecha de inicio debe ser posterior a la fecha actual."
    );
}

function validarFechaFin(fechaIni, fechaFin) {
    const ahora = new Date();
    const fechaActual = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

    const usuarioInicial = new Date(fechaIni.value);
    const fechaInicial = new Date(Date.UTC(usuarioInicial.getFullYear(), usuarioInicial.getMonth(), usuarioInicial.getDate()));

    const usuarioFinal = new Date(fechaFin.value);
    const fechaFinal = new Date(Date.UTC(usuarioFinal.getFullYear(), usuarioFinal.getMonth(), usuarioFinal.getDate()));

    // Validar fecha de fin >= actual
    if (!validarCampo(fechaFin, fechaFinal.getTime() >= fechaActual.getTime(), "La fecha de fin debe ser igual o posterior a la fecha actual.")) {
        return false;
    }

    if (!validarCampo(fechaFin, fechaInicial.getTime() <= fechaFinal.getTime(), "La fecha de fin debe ser posterior a la fecha de inicio.")) {
        return false;
    }

    return true;
}

function validarHoraIni(horaIni) {
    return validarCampo(
        horaIni,
        horaIni.value,
        "Selecciona una hora de inicio."
    );
}

function validarHoraFin(horaIni, horaFin) {
    const horaInicial = horaIni.value;
    const horaFinal = horaFin.value;

    const [hIni, mIni] = horaInicial.split(":").map(Number);
    const [hFin, mFin] = horaFinal.split(":").map(Number);

    const minutosIni = hIni * 60 + mIni;
    const minutosFin = hFin * 60 + mFin;


    // Validar inicio < fin
    if (!validarCampo(
        horaFin,
        new Date(fechaIni.value).getTime() < new Date(fechaFin.value).getTime() || (new Date(fechaIni.value).getTime() == new Date(fechaFin.value).getTime() && minutosIni < minutosFin),
        "La fecha de fin debe ser posterior a la fecha de inicio.")) {
        return false;
    }

    return true;
}

function validarDuracion(duracion) {
    return validarCampo(
        duracion,
        duracion.value > 0,
        "La duración debe ser un número positivo."
    );
}

function actualizarProgreso(progreso, nombre, apellido, telefono, correo, fechaHoraIni, fechaHoraFin, vehiculo, duracion) {
    const total = 8;
    let validos = 0;
    if (nombre.value.trim() && validarNombre(nombre)) validos++;
    if (apellido.value.trim() && validarApellido(apellido)) validos++;
    if (telefono.value.trim() && validarTelefono(telefono)) validos++;
    if (correo.value.trim() && validarCorreo(correo)) validos++;
    if (vehiculo.value && validarVehiculo(vehiculo)) validos++;
    if (fechaHoraIni.value && validarFechaHoraIni(fechaHoraIni)) validos++;
    if (fechaHoraFin.value && validarFechaHoraFin(fechaHoraIni, fechaHoraFin)) validos++;
    if (duracion.value && validarDuracion(duracion)) validos++;

    progreso.value = (validos / total) * 100;

    console.log(validos);
}


