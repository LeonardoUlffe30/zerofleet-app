document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-vehiculos");
    const campos = {
        matricula: document.getElementById("matricula"),
        marca: document.getElementById("marca"),
        modelo: document.getElementById("modelo"),
        anyoMatriculacion: document.getElementById("anyoMatriculacion"),
        numeroPlazas: document.getElementById("numeroPlazas"),
        autonomia: document.getElementById("autonomia"),
        color: document.getElementById("color"),
        tipo: document.getElementById("tipo"),
        estado: document.getElementById("estado"),
        precioHora: document.getElementById("precioHora"),
        imagen: document.querySelector("input[name='imagen']")
    };

    const progreso = document.getElementById("progreso");

    function validarFormulario(event) {
        event.preventDefault();
        if (
            !validarMatricula() ||
            !validarMarca() ||
            !validarModelo() ||
            !validarAnyo() ||
            !validarPlazas() ||
            !validarAutonomia() ||
            !validarColor() ||
            !validarTipo() ||
            !validarEstado() ||
            !validarPrecio() ||
            !validarImagen()
        ) {
            alert("Corrige los errores antes de enviar.");
            return;
        }

        const modal = new bootstrap.Modal(document.getElementById("confirmacionModal"));
        modal.show();

        const formData = new FormData(formulario);

        fetch("/vehiculos/nuevo", {
            method: "POST",
            body: formData
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    alert(data.errores.map(e => e.msg).join("\n"));
                    throw new Error("Error en validación");
                }

                alert("Vehículo registrado con éxito");
                window.location.href = "/vehiculos/";
            })
            .catch(error => console.error(error));
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

    function validarMatricula() {
        const regex = /^[0-9]{4}[A-Z]{3}$/i;
        return validarCampo(
            campos.matricula,
            regex.test(campos.matricula.value.trim()),
            "La matrícula debe tener formato válido. Ej: 1234ABC"
        );
    }

    function validarMarca() {
        const minimo = 3;
        return validarCampo(
            campos.marca,
            campos.marca.value.trim().length >= minimo,
            `La marca debe tener al menos ${minimo} caracteres.`
        );
    }

    function validarModelo() {
        const minimo = 3;
        return validarCampo(
            campos.modelo,
            campos.modelo.value.trim().length >= minimo,
            `El modelo debe tener al menos ${minimo} caracteres.`
        );
    }

    function validarAnyo() {
        const regex = /^\d{4}$/;
        const anyo = new Date().getFullYear();

        // Validar si es un numero
        if (!validarCampo(campos.anyoMatriculacion, !isNaN(campos.anyoMatriculacion.value), "Ingresar un numero valido.")) {
            return false;
        }

        if (!validarCampo(campos.anyoMatriculacion,
            regex.test(campos.anyoMatriculacion.value) && campos.anyoMatriculacion.value <= anyo, `Ingresar 4 dígitos y menor o igual que ${anyo}.`)) {
            return false;
        }

        return true;
    }

    function validarPlazas() {
        return validarCampo(
            campos.numeroPlazas,
            !isNaN(campos.numeroPlazas.value) && campos.numeroPlazas.value > 0,
            "Ingresar un numero de plazas válido mayor que 0."
        );
    }

    function validarAutonomia() {
        return validarCampo(
            campos.autonomia,
            !isNaN(campos.autonomia.value) && campos.numeroPlazas.value > 0,
            "Ingresar una autonomía (km) válida mayor que 0."
        );
    }

    function validarColor() {
        const minimo = 3
        return validarCampo(
            campos.color,
            campos.color.value && campos.color.value.trim().length >= minimo,
            `El color debe tener al menos ${minimo} caracteres.`
        )
    }

    function validarTipo() {
        return validarCampo(
            campos.tipo,
            campos.tipo.value !== "",
            "Seleccione un tipo"
        )
    }

    function validarEstado() {
        return validarCampo(
            campos.estado,
            campos.estado.value !== "",
            "Seleccione un estado"
        )
    }

    function validarPrecio() {
        const regex = /^\d+(\.\d{1,2})?$/;
        return validarCampo(
            campos.precioHora,
            regex.test(campos.precioHora.value),
            "Precio invalido"
        )
    }

    function validarImagen() {
        if (!campos.imagen.files.length) {
            return validarCampo(
                campos.imagen,
                false,
                "Debe subir una imagen del vehículo."
            );
        }

        return true;
    }

    function actualizarProgreso() {
        const total = 11;
        let validos = 0;

        if (campos.matricula.value.trim() && validarMatricula()) validos++;
        if (campos.marca.value.trim() && validarMarca()) validos++;
        if (campos.modelo.value.trim() && validarModelo()) validos++;
        if (campos.anyoMatriculacion.value && validarAnyo()) validos++;
        if (campos.numeroPlazas.value && validarPlazas()) validos++;
        if (campos.autonomia.value && validarAutonomia()) validos++;
        if (campos.color.value && validarColor()) validos++;
        if (campos.tipo.value.trim() && validarTipo()) validos++;
        if (campos.estado.value.trim() && validarEstado()) validos++;
        if (campos.precioHora.value && validarPrecio()) validos++;
        if (campos.imagen.value.trim() && validarImagen()) validos++;

        progreso.value = (validos / total) * 100;

        console.log(validos);
    }

    // Actualizar progreso
    formulario.addEventListener("input", actualizarProgreso);

    // Validar en tiempo real
    campos.matricula.addEventListener("input", validarMatricula);
    campos.marca.addEventListener("input", validarMarca);
    campos.modelo.addEventListener("input", validarModelo);
    campos.anyoMatriculacion.addEventListener("input", validarAnyo);
    campos.numeroPlazas.addEventListener("input", validarPlazas);
    campos.autonomia.addEventListener("input", validarAutonomia);
    campos.color.addEventListener("input", validarColor);
    campos.tipo.addEventListener("change", validarTipo);
    campos.estado.addEventListener("change", validarEstado);
    campos.precioHora.addEventListener("input", validarPrecio);
    campos.imagen.addEventListener("change", validarImagen);

    // Validar al enviar el formulario
    formulario.addEventListener("submit", validarFormulario);
});

