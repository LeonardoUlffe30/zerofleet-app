document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-usuarios");
    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const correo = document.getElementById("correo");
    const rol = document.getElementById("rol");
    const telefono = document.getElementById("telefono");
    const concesionario = document.getElementById("concesionario");
    const preferencias = document.getElementById("preferencias");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarVehiculo");

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, nombre, apellido, correo, rol, telefono,
        concesionario, preferencias));

    // Validar en tiempo real
    nombre.addEventListener("input", () => validarNombre(nombre));
    apellido.addEventListener("input", () => validarApellido(apellido));
    correo.addEventListener("input", () => validarCorreo(correo));
    rol.addEventListener("change", () => validarRol(rol));
    telefono.addEventListener("input", () => validarTelefono(telefono));
    concesionario.addEventListener("input", () => validarConcesionario(concesionario));
    preferencias.addEventListener("input", () => validarPreferencias(preferencias));

    // Validar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, nombre, apellido, correo, rol, telefono,
        concesionario, preferencias));

    // Crear vehiculo
    confirmarModal.addEventListener("click", () => {
        const modo = formulario.dataset.modo;

        if (modo == "editar") {
            actualizarUsuario(formulario);
        } else {
            crearUsuario(formulario);
        }
    });
});

async function actualizarUsuario(formulario) {
    const matriculaAntigua = formulario.dataset.id;
    const formData = new FormData(formulario);

    try {
        const data = await fetch(`/vehiculos/${matriculaAntigua}/editar`, {
            method: "POST",
            body: formData
        });

        if (data.status === 200) {
            await data.json();
            alert("Vehículo actualizado");
            window.location.href = "/usuarios/";
        } else {
            alert(data.errores.map(e => e.msg).join("\n"));
            throw new Error(`HTTP error! status: ${data.status}`);
        }
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
    }
}

async function crearVehiculo(formulario) {
    // No se utiliza formData() para enviarlo en el body porque
    // codifica con multipart/form-data y para eso necesito multer
    // y multer no lo necesito ya que no hay archivos en este formulario
    const body = {
        nombre: formulario.nombre.value,
        apellido: formulario.apellido.value,
        correo: formulario.correo.value,
        rol: formulario.rol.value,
        telefono: formulario.telefono.value,
        concesionario: formulario.concesionario.value,
        preferencias: formulario.preferencias.value
    };

    try {
        const data = await fetch("/usuarios/nuevo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (data.status === 201) {
            const usuario = await data.json();
            alert(`Usuario registrado con éxito con ID: ${usuario.id}`);
            window.location.href = "/usuarios/";
        } else {
            alert(data.errores.map(e => e.msg).join("\n"));
            throw new Error(`HTTP error! status: ${data.status}`);
        }
    } catch (error) {
        console.error("Error al crear el usuario:", error);
    }
}

function validarFormulario(event, nombre, apellido, correo, rol, telefono,
    concesionario, preferencias) {
    event.preventDefault();
    if (
        !validarNombre(nombre) ||
        !validarApellido(apellido) ||
        !validarCorreo(correo) ||
        !validarRol(rol) ||
        !validarTelefono(telefono) ||
        !validarConcesionario(concesionario) ||
        !validarPreferencias(preferencias)
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

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function validarConcesionario(concesionario) {
    const minimo = 3
    return validarCampo(
        concesionario,
        concesionario.value && concesionario.value.trim().length >= minimo,
        `El concesionario debe tener al menos ${minimo} caracteres.`
    )
}

function validarPreferencias(preferencias) {
    const minimo = 3;
    return validarCampo(
        preferencias,
        preferencias.value.trim().length >= minimo,
        `Las preferencias debe tener al menos ${minimo} caracteres.`
    );
}

function actualizarProgreso(progreso, nombre, apellido, correo, rol, telefono,
    concesionario, preferencias) {
    const total = 7;
    let validos = 0;

    if (nombre.value.trim() && validarNombre(nombre)) validos++;
    if (apellido.value.trim() && validarApellido(apellido)) validos++;
    if (correo.value.trim() && validarCorreo(correo)) validos++;
    if (rol.value.trim() && validarTipo(tipo)) validos++;
    if (telefono.value && validarTelefono(telefono)) validos++;
    if (concesionario.value && validarConcesionario(concesionario)) validos++;
    if (preferencias.value.trim() && validarPreferencias(preferencias)) validos++;

    progreso.value = (validos / total) * 100;
}
