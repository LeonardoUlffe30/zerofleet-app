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
        fechaHoraIni.dispatchEvent(new Event("input"));
    });

    pickerFin.subscribe(tempusDominus.Namespace.events.change, (e) => {
        fechaHoraFin.value = e.date ? e.date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        fechaHoraFin.dispatchEvent(new Event("input"));
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
        fechaHoraIni: parsearFechaHora(formulario.fechaHoraIni.value),
        fechaHoraFin: parsearFechaHora(formulario.fechaHoraFin.value),
        duracion: formulario.duracion.value,
        condiciones: document.getElementById("condiciones").checked
    };

    console.log("valores en crear reserva", body);

    const mensajesDiv = document.getElementById("mensajes");

    try {
        const data = await fetch("/reservas/nuevo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        const response = await data.json();

        if (data.status === 201) {
            mensajesDiv.innerHTML = "";
            alert("Reserva realizada");
            window.location.href = "/reservas/mis-reservas";
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
    let contenedor;
    let error;

    if (campo.closest('[data-td-target-input]')) {
        contenedor = campo.closest('[data-td-target-input]');
        error = contenedor.querySelector('.error');
    } else {
        // Para el resto de inputs
        error = campo.nextElementSibling;
    }


    if (!error || !error.classList.contains("error")) {
        error = document.createElement("span");
        error.classList.add("error");
        error.setAttribute("aria-live", "polite");
        contenedor ?
            contenedor.appendChild(error) :
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

function parsearFechaHora(ddmmyyyy_hhmm) {
    if (!ddmmyyyy_hhmm) return null;

    const [fecha, hora] = ddmmyyyy_hhmm.split(",").map(s => s.trim());;
    const [dia, mes, anio] = fecha.split("/").map(Number);
    const [horas, minutos] = hora.split(":").map(Number);

    // IMPORTANTE: el mes en JS va 0-11
    return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
}

function validarFechaHoraIni(fechaHoraIni) {
    const ahora = new Date();
    const valor = new Date(parsearFechaHora(fechaHoraIni.value));

    console.log("Fecha Hora Ini sin parsear ", fechaHoraIni.value);
    console.log("Fecha Hora Ini con parseo ", valor);
    console.log("Fecha Hora Ini con getTime() ", valor.getTime());

    return validarCampo(
        fechaHoraIni,
        valor.getTime() >= ahora.getTime(),
        "La fecha y hora de inicio debe ser igual o posterior a la fecha y hora actual"
    )
}

function validarFechaHoraFin(fechaHoraIni, fechaHoraFin) {
    const inicio = new Date(parsearFechaHora(fechaHoraIni.value));
    const fin = new Date(parsearFechaHora(fechaHoraFin.value));
    const ahora = new Date();

    // Validar que la fecha + hora de fin sea >= ahora
    if (!validarCampo(fechaHoraFin, fin.getTime() >= ahora.getTime(), "La fecha y hora de fin debe ser igual o posterior a la fecha y hora actual.")) {
        return false;
    }

    // Validar que la fecha + hora de fin sea posterior a la fecha + hora de inicio
    if (!validarCampo(fechaHoraFin, fin.getTime() > inicio.getTime(), "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.")) {
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


