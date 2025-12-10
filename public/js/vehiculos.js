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
    const concesionario = document.getElementById("concesionarioVehiculo");
    const imagen = document.querySelector("input[name='imagen']");
    const nombreImagen = document.getElementById("nombre-imagen");
    const progreso = document.getElementById("progreso");
    const confirmarModal = document.getElementById("confirmarVehiculo");
    const btnSeleccionar = document.getElementById("btn-seleccionar");

    btnSeleccionar.addEventListener("click", () => {
        imagen.click();
    });

    imagen.addEventListener("change", () => {
        if (imagen.files.length > 0) {
            nombreImagen.textContent = "Archivo seleccionado: " + imagen.files[0].name;
        } else if (nombreImagen.dataset.original) {
            nombreImagen.textContent = "Archivo actual: " + nombreImagen.dataset.original;
        } else {
            nombreImagen.textContent = "";
        }
    });


    // Cargamos los nombres de los concesionarios en base a lo que esta en la base de datos
    cargarNombres();

    // Actualizar progreso
    formulario.addEventListener("input", () => actualizarProgreso(progreso, matricula, marca, modelo, anyoMatriculacion,
        numeroPlazas, autonomia, color, tipo, estado, precioHora, concesionario, imagen, formulario.dataset.modo));

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
    imagen.addEventListener("change", () => validarImagen(imagen, formulario.dataset.modo));

    // Validar al enviar el formulario
    formulario.addEventListener("submit", (event) => validarFormulario(event, matricula, marca, modelo, anyoMatriculacion,
        numeroPlazas, autonomia, color, tipo, estado, precioHora, concesionario, imagen));

    // Crear vehiculo
    confirmarModal.addEventListener("click", () => {
        const modo = formulario.dataset.modo;

        if (modo == "editar") {
            actualizarVehiculo(formulario);
        } else {
            crearVehiculo(formulario);
        }
    });
});

function actualizarVehiculo(formulario) {
    const matriculaAntigua = formulario.dataset.id;
    const formData = new FormData(formulario);
    const mensajesDiv = document.getElementById("mensaje");

    fetch(`/vehiculos/${matriculaAntigua}/editar`, {
        method: "POST",
        body: formData
    })
        .then(response => {
            const ok = response.ok;
            return response.json().then(data => ({ ok, data }));
        })
        .then(resultado => {
            if (resultado.ok) {
                mensajesDiv.innerHTML = `
            <div class="alert alert-success" role="alert">
                <p>Vehículo actualizado con éxito</p>
            </div>`;
                window.location.href = "/vehiculos/";
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


function crearVehiculo(formulario) {
    const formData = new FormData(formulario);
    const mensajesDiv = document.getElementById("mensaje");

    fetch("/vehiculos/nuevo", {
        method: "POST",
        body: formData
    })
        .then(response => {
            const ok = response.ok;
            return response.json().then(data => ({ ok, data }));
        })
        .then(resultado => {
            if (resultado.ok) {
                alert(`Vehículo registrado con éxito`);
                window.location.href = "/vehiculos/";
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
            console.error("Error al crear el vehiculo:", error);
        });
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

function validarImagen(imagen, modo) {
    if (modo === "crear") {
        if (!imagen.files.length) {
            return validarCampo(
                imagen,
                false,
                "Debe subir una imagen del vehículo."
            );
        }
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
    tipo, estado, precioHora, concesionario, imagen, modo
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
    if (modo === "editar") {
        validos++;
    } else {
        if (imagen.value.trim() && validarImagen(imagen)) validos++;
    }

    progreso.value = (validos / total) * 100;
}

function cargarNombres() {
    fetch("/vehiculos/api/concesionarios")
        .then(response => response.json())
        .then(concesionarios => {
            const select = document.getElementById("concesionarioVehiculo");
            const concesionarioActual = select.dataset.actual;

            console.log("concesionarios en cargaNombres()", concesionarios);
            select.innerHTML = `<option value="" disabled selected>Seleccione</option>`;

            console.log("concesionario actual ", concesionarioActual);

            concesionarios.forEach(c => {
                const nombre = c.nombre;

                const seleccionado = (nombre === concesionarioActual) ? "selected" : "";

                select.innerHTML += `
                    <option value="${nombre}" ${seleccionado}>${nombre}</option>`;
            });
        })
        .catch(error => {
            console.error("Error cargando concesionarios", error);
        });
}

