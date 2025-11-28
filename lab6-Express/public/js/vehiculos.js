document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-vehiculos");
    const matricula = document.getElementById("matricula");
    const marca = document.getElementById("marca");
    const modelo = document.getElementById("modelo");
    const anyoMatriculacion = document.getElementById("anyoMatriculacion");
    const numeroPlazas = document.getElementById("numeroPlazas");
    const autonomia = document.getElementById("autonomia");
    const color = document.getElementById("color");
    const tipo = document.getElementById("tipo");
    const estado = document.getElementById("estado");
    const precioHora = document.getElementById("precioHora");
    const concesionario = document.getElementById("concesionario");
    const imagen = document.querySelector("input[name='imagen']");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarVehiculo");

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, matricula, marca, modelo, anyoMatriculacion,
        numeroPlazas, autonomia, color, tipo, estado, precioHora, concesionario, imagen));

    // Validar en tiempo real
    matricula.addEventListener("input", () => validarMatricula(matricula));
    marca.addEventListener("input", () => validarMarca(marca));
    modelo.addEventListener("input", () => validarModelo(modelo));
    anyoMatriculacion.addEventListener("input", () => validarAnyo(anyoMatriculacion));
    numeroPlazas.addEventListener("input", () => validarPlazas(numeroPlazas));
    autonomia.addEventListener("input", () => validarAutonomia(autonomia));
    color.addEventListener("input", () => validarColor(color));
    tipo.addEventListener("change", () => validarTipo(tipo));
    estado.addEventListener("change", () => validarEstado(estado));
    precioHora.addEventListener("input", () => validarPrecio(precioHora));
    concesionario.addEventListener("input", () => validarConcesionario(concesionario));
    imagen.addEventListener("change", () => validarImagen(imagen));

    // Validar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, matricula, marca, modelo, anyoMatriculacion,
        numeroPlazas, autonomia, color, tipo, estado, precioHora, concesionario, imagen));

    // Crear vehiculo
    confirmarModal.addEventListener("click", () => crearVehiculo(formulario));
});

async function crearVehiculo(formulario) {
    const formData = new FormData(formulario);
    try {
        const data = await fetch("/vehiculos/nuevo", {
            method: "POST",
            body: formData
        });

        if (data.status === 201) {
            const vehiculo = await data.json();
            alert(`Vehículo registrado con éxito con ID: ${vehiculo.id}`);
            window.location.href = "/vehiculos/";
        } else {
            alert(data.errores.map(e => e.msg).join("\n"));
            throw new Error(`HTTP error! status: ${data.status}`);
        }
    } catch (error) {
        console.error("Error al crear el vehiculo:", error);
    }
}

function validarFormulario(event, matricula, marca, modelo, anyoMatriculacion,
    numeroPlazas, autonomia, color, tipo, estado, precioHora, concesionario, imagen) {
    event.preventDefault();
    if (
        !validarMatricula(matricula) ||
        !validarMarca(marca) ||
        !validarModelo(modelo) ||
        !validarAnyo(anyoMatriculacion) ||
        !validarPlazas(numeroPlazas) ||
        !validarAutonomia(autonomia) ||
        !validarColor(color) ||
        !validarTipo(tipo) ||
        !validarEstado(estado) ||
        !validarPrecio(precioHora) ||
        !validarConcesionario(concesionario) ||
        !validarImagen(imagen)
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

function validarMatricula(matricula) {
    console.log("Matricula", matricula.value.trim());
    const regex = /^[0-9]{4}[A-Z]{3}$/i;
    return validarCampo(
        matricula,
        regex.test(matricula.value.trim()),
        "La matrícula debe tener formato válido. Ej: 1234ABC"
    );
}

function validarMarca(marca) {
    const minimo = 3;
    return validarCampo(
        marca,
        marca.value.trim().length >= minimo,
        `La marca debe tener al menos ${minimo} caracteres.`
    );
}

function validarModelo(modelo) {
    const minimo = 3;
    return validarCampo(
        modelo,
        modelo.value.trim().length >= minimo,
        `El modelo debe tener al menos ${minimo} caracteres.`
    );
}

function validarAnyo(anyoMatriculacion) {
    const regex = /^\d{4}$/;
    const anyo = new Date().getFullYear();

    // Validar si es un numero
    if (!validarCampo(anyoMatriculacion, !isNaN(anyoMatriculacion.value), "Ingresar un numero valido.")) {
        return false;
    }

    if (!validarCampo(anyoMatriculacion,
        regex.test(anyoMatriculacion.value) && anyoMatriculacion.value <= anyo, `Ingresar 4 dígitos y menor o igual que ${anyo}.`)) {
        return false;
    }

    return true;
}

function validarPlazas(numeroPlazas) {
    return validarCampo(
        numeroPlazas,
        !isNaN(numeroPlazas.value) && numeroPlazas.value > 0,
        "Ingresar un numero de plazas válido mayor que 0."
    );
}

function validarAutonomia(autonomia) {
    return validarCampo(
        autonomia,
        !isNaN(autonomia.value) && numeroPlazas.value > 0,
        "Ingresar una autonomía (km) válida mayor que 0."
    );
}

function validarColor(color) {
    const minimo = 3
    return validarCampo(
        color,
        color.value && color.value.trim().length >= minimo,
        `El color debe tener al menos ${minimo} caracteres.`
    )
}

function validarTipo(tipo) {
    return validarCampo(
        tipo,
        tipo.value !== "",
        "Seleccione un tipo"
    )
}

function validarEstado(estado) {
    return validarCampo(
        estado,
        estado.value !== "",
        "Seleccione un estado"
    )
}

function validarPrecio(precioHora) {
    const regex = /^\d+(\.\d{1,2})?$/;
    return validarCampo(
        precioHora,
        regex.test(precioHora.value),
        "Precio invalido"
    )
}

function validarImagen(imagen) {
    if (!imagen.files.length) {
        return validarCampo(
            imagen,
            false,
            "Debe subir una imagen del vehículo."
        );
    }

    return true;
}

function validarConcesionario(concesionario) {
    const minimo = 3
    return validarCampo(
        concesionario,
        concesionario.value && concesionario.value.trim().length >= minimo,
        `El concesionario debe tener al menos ${minimo} caracteres.`
    )
}

function actualizarProgreso(progreso, matricula, marca, modelo, anyoMatriculacion, numeroPlazas, autonomia, color,
    tipo, estado, precioHora, concesionario, imagen
) {
    const total = 12;
    let validos = 0;

    if (matricula.value.trim() && validarMatricula(matricula)) validos++;
    if (marca.value.trim() && validarMarca(marca)) validos++;
    if (modelo.value.trim() && validarModelo(modelo)) validos++;
    if (anyoMatriculacion.value && validarAnyo(anyoMatriculacion)) validos++;
    if (numeroPlazas.value && validarPlazas(numeroPlazas)) validos++;
    if (autonomia.value && validarAutonomia(autonomia)) validos++;
    if (color.value && validarColor(color)) validos++;
    if (tipo.value.trim() && validarTipo(tipo)) validos++;
    if (estado.value.trim() && validarEstado(estado)) validos++;
    if (precioHora.value && validarPrecio(precioHora)) validos++;
    if (concesionario.value && validarConcesionario(concesionario)) validos++;
    if (imagen.value.trim() && validarImagen(imagen)) validos++;

    progreso.value = (validos / total) * 100;

    console.log(validos);
}
