document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-concesionarios");
    const nombre = document.getElementById("nombre");
    const ciudad = document.getElementById("ciudad");
    const direccion = document.getElementById("direccion");
    const telefono = document.getElementById("telefono");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarConcesionario");

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, nombre, ciudad, direccion, telefono));

    // Validar en tiempo real
    nombre.addEventListener("input", () => validarNombre(nombre));
    ciudad.addEventListener("input", () => validarCiudad(ciudad));
    direccion.addEventListener("input", () => validarDireccion(direccion));
    telefono.addEventListener("input", () => validarTelefono(telefono));

    // Validar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, nombre, ciudad, direccion, telefono));

    // Crear vehiculo
    confirmarModal.addEventListener("click", () => {
        const modo = formulario.dataset.modo;

        if (modo == "editar") {
            actualizarConcesionario(formulario);
        } else {
            crearConcesionario(formulario);
        }
    });
});

function actualizarConcesionario(formulario) {
    const idConcesionario = formulario.dataset.id;
    // No se utiliza formData() para enviarlo en el body porque
    // codifica con multipart/form-data y para eso necesito multer
    // y multer no lo necesito ya que no hay archivos en este formulario
    const body = {
        nombre: formulario.nombre.value,
        ciudad: formulario.ciudad.value,
        direccion: formulario.direccion.value,
        telefono: formulario.telefono.value
    };

    fetch(`/concesionarios/${idConcesionario}/editar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(response => 
        response.json().then(responseJSON => ({ ok: response.ok, status: response.status, body: responseJSON }))
    )
    .then(resultado => {
        if (resultado.ok) {
            console.log("111111111111111111111");
            alert("Concesionario actualizado");
            window.location.href = "/concesionarios";
        } else {
            if (resultado.body.errores) {
                mensajesDiv.innerHTML = resultado.body.errores.map(e => `
                    <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                    </div>`).join("");
            } else if (resultado.body.mensaje) {
                mensajesDiv.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${resultado.body.mensaje}</p>
                    </div>`;
            }
        }
    })
    .catch(error => {
        console.error("Error al actualizar el concesionario:", error);
    });
}


function crearConcesionario(formulario) {
    const body = {
        nombre: formulario.nombre.value,
        ciudad: formulario.ciudad.value,
        direccion: formulario.direccion.value,
        telefono: formulario.telefono.value
    };

    const mensajesDiv = document.getElementById("mensajes");

    fetch("/concesionarios/nuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(response => 
        response.json().then(json => ({ ok: response.ok, status: response.status, body: json }))
    )
    .then(resultado => {
        if (resultado.ok) {
            alert(`Concesionario registrado con éxito`);
            window.location.href = "/concesionarios";
        } else {
            if (resultado.body.errores) {
                mensajesDiv.innerHTML = resultado.body.errores.map(e => `
                    <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                    </div>`).join("");
            } else if (resultado.body.mensaje) {
                mensajesDiv.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${resultado.body.mensaje}</p>
                    </div>`;
            }
        }
    })
    .catch(error => {
        console.error("Error al crear el concesionario:", error);
    });
}

function validarFormulario(event, nombre, ciudad, direccion, telefono) {
    event.preventDefault();

    if (!validarNombre(nombre) || !validarCiudad(ciudad) || !validarDireccion(direccion) || !validarTelefono(telefono)) {
        alert("Corrige los errores antes de enviar.");
        return;
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
    const minimo = 3;
    return validarCampo(
        nombre,
        nombre.value.trim().length >= minimo,
        `El nombre debe tener al menos ${minimo} caracteres.`
    );
}

function validarCiudad(ciudad) {
    const minimo = 3;
    return validarCampo(
        ciudad,
        ciudad.value.trim().length >= minimo,
        `La ciudad debe tener al menos ${minimo} caracteres.`
    );
}

function validarDireccion(direccion) {
    const minimo = 3;
    return validarCampo(
        direccion,
        direccion.value.trim().length >= minimo,
        `La dirección debe tener al menos ${minimo} caracteres.`
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

function actualizarProgreso(progreso, nombre, ciudad, direccion, telefono) {
    const total = 4;
    let validos = 0;

    if (nombre.value.trim() && validarNombre(nombre)) validos++;
    if (ciudad.value.trim() && validarCiudad(ciudad)) validos++;
    if (direccion.value.trim() && validarDireccion(direccion)) validos++;
    if (telefono.value && validarTelefono(telefono)) validos++;

    progreso.value = (validos / total) * 100;
}
