document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-usuarios");
    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const correo = document.getElementById("correoUsuario");
    const rol = document.getElementById("rol");
    const telefono = document.getElementById("telefono");
    const concesionario = document.getElementById("concesionario");
    const preferencias = document.getElementById("preferencias");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarUsuario");

    console.log("Correo a enviar:", correo.value); 

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, nombre, apellido, correo, rol, telefono,
        concesionario, preferencias));

    // Validar en tiempo real
    nombre.addEventListener("input", () => validarNombre(nombre));
    apellido.addEventListener("input", () => validarApellido(apellido));
    correo.addEventListener("input", () => validarCorreo(correo));
    rol.addEventListener("change", () => validarRol(rol));
    telefono.addEventListener("input", () => validarTelefono(telefono));

    // Validar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, nombre, apellido, correo, rol, telefono,
        concesionario, preferencias));

    // Crear vehiculo
    confirmarModal.addEventListener("click", () => {
        const modo = formulario.dataset.modo;

        if (modo == "editar") {
            actualizarUsuario(formulario);
        } 
    });
});

function actualizarUsuario(formulario) {
    const idUsuario = formulario.dataset.id;
    const mensajesDiv = document.getElementById("mensaje");

    const body = {
        nombre: formulario.nombre.value,
        apellido: formulario.apellido.value,
        correo: formulario.correoUsuario.value,
        rol: formulario.rol.value,
        telefono: formulario.telefono.value,
        concesionario: formulario.concesionario.value,
        preferencias: formulario.preferencias.value
    };

    fetch(`/usuarios/${idUsuario}/editar`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
    })
    .then(response => {
            const ok = response.ok;
            return response.json().then(data => ({ ok, data }));
    })
    .then(resultado => {
        if (resultado.ok) {
            alert("Usuario actualizado correctamente");
            window.location.href = "/usuarios/";
        } else {
            if (resultado.data.errores) {
                mensajesDiv.innerHTML = resultado.data.errores.map(e => `
                <div class="alert alert-danger" role="alert">
                    <p>${e.msg}</p>
                </div>`).join("");
            } else if (resultado.data.mensaje) {
                mensajesDiv.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <p>${resultado.data.mensaje}</p>
                </div>`;
            }
        }
    })
    .catch(error => {
            console.error("Error al actualizar el vehiculo:", error);
    });
}

function validarFormulario(event, nombre, apellido, correo, rol, telefono) {
    event.preventDefault();
    if (
        !validarNombre(nombre) ||
        !validarApellido(apellido) ||
        !validarCorreo(correo) ||
        !validarRol(rol) ||
        !validarTelefono(telefono)
    ) {
        alert("Corrige los errores antes de enviar.");
        return;
    }

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

function validarApellido(apellido) {
    const minimo = 3;
    return validarCampo(
        apellido,
        apellido.value.trim().length >= minimo,
        `El apellido debe tener al menos ${minimo} caracteres.`
    );
}

function validarCorreo() {
    const regex = /^[a-zA-Z0-9._%+-]+@zfleet\.com$/;
    return validarCampo(
        correo,
        regex.test(correo.value),
        "Ingrese un correo electrónico válido."
    );
    }

function validarRol(rol) {
    return validarCampo(
        rol,
        rol.value !== "",
        "Seleccione un rol"
    )
}

function validarTelefono(telefono) {
    const regex = /^\d{9}$/;
    return validarCampo(
        telefono,
        regex.test(telefono.value),
        "Introducir un teléfono válido. Por ejemplo: 987654321"

    );
}

function actualizarProgreso(progreso, nombre, apellido, correo, rol, telefono,
    concesionario, preferencias) {
    const total = 7;
    let validos = 0;

    if (nombre.value.trim() && validarNombre(nombre)) validos++;
    if (apellido.value.trim() && validarApellido(apellido)) validos++;
    if (correo.value.trim() && validarCorreo(correo)) validos++;
    if (rol.value.trim() && validarRol(rol)) validos++;
    if (telefono.value && validarTelefono(telefono)) validos++;
    if (concesionario.value) validos++;
    if (preferencias.value.trim()) validos++;

    progreso.value = (validos / total) * 100;
}
