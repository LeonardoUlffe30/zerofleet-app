document.addEventListener("DOMContentLoaded", () => {
    const filtroCampo = document.getElementById("filtroCampo");
    const buscarInput = document.getElementById("buscar");

    // Si EJS ya mandó concesionarios, mostrarlos SIN fetch
    if (concesionariosIniciales && concesionariosIniciales.length > 0) {
        mostrarConcesionarios(concesionariosIniciales);
    }

    filtroCampo.addEventListener("change", actualizarConcesionarios);
    buscarInput.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarConcesionarios, 300);
    });
});

// Inserta las etiquetas con los datos de los concesionarios en la tbody de la tabla
function mostrarConcesionarios(concesionarios) {
    const tbody = document.querySelector('#tablaConcesionarios tbody');
    tbody.innerHTML = '';
    concesionarios.forEach(c => {
        const accciones = (usuario && usuario.rol === "admin") ? `
                    <td class = "fit">
                        <a href ="/concesionarios/${c.id_concesionario}/editar" class="btn btn-light">Editar</a>
                        <button class="btn btn-danger" onclick="eliminarConcesionario('${c.id_concesionario}')">Eliminar</button>
                    </td>`: '';
        const fila = `
                <tr>
                  <td>${c.nombre}</td>
                  <td>${c.ciudad}</td>
                  <td>${c.direccion}</td>
                  <td>${c.telefono_contacto}</td>
                  ${accciones}
                </tr>`;

        tbody.innerHTML += fila;
    });
}

async function actualizarConcesionarios() {
    const filtroCampo = document.getElementById("filtroCampo").value;
    const buscarInput = document.getElementById("buscar").value.trim();

    let url = `/concesionarios/api/concesionarios?`;

    // Utilizamos encoding para convertir caracteres especiales(/=<>&" ") en SEGUROS para la URL
    // y evitar ataques de inyección como XSS. Por ejemplo, buscar="<script>alert('xss')</script>"
    // se convierte en buscar="%3Cscript%3Ealert('xss')%3C/script%3E"
    if (filtroCampo && buscarInput)
        url += `filtroCampo=${encodeURIComponent(filtroCampo)}&buscar=${encodeURIComponent(buscarInput)}`;

    try {
        const data = await fetch(url);

        if (data.status === 200) {
            const concesionarios = await data.json();
            mostrarConcesionarios(concesionarios);
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al cargar los concesionarios:", error);
        mostrarMensaje("Error al cargar los concesionarios", "danger");
    }
}

async function eliminarConcesionario(id) {
    try {
        const data = await fetch(`/concesionarios/api/concesionarios/${id}`, {
            method: 'DELETE'
        });

        if (data.status === 200) {
            const response = await data.json();
            mostrarMensaje(response.mensaje, "success");
            actualizarConcesionarios();
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarMensaje("Error al eliminar el concesionario", "danger");
    }
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML = `<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}
