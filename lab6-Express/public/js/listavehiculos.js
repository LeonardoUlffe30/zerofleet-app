document.addEventListener("DOMContentLoaded", () => {
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroCampo = document.getElementById("filtroCampo");
    const buscarInput = document.getElementById("buscar");

    // Si EJS ya mandó vehículos, mostrarlos SIN fetch
    if (vehiculosIniciales && vehiculosIniciales.length > 0) {
        mostrarVehiculos(vehiculosIniciales);
    }

    filtroTipo.addEventListener("change", actualizarVehiculos);
    filtroCampo.addEventListener("change", actualizarVehiculos);
    buscarInput.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarVehiculos, 300);
    });
});

// Inserta las etiquetas con los datos de los vehiculos en la tbody de la tabla
function mostrarVehiculos(vehiculos) {
    const tbody = document.querySelector('#tablavehiculos tbody');
    tbody.innerHTML = '';
    vehiculos.forEach(v => {
        const accciones = (usuario && usuario.rol === "admin") ? `
                    <td class = "fit">
                        <a href ="/vehiculos/${v.matricula}/editar" class="btn btn-light">Editar</a>
                        <button class="btn btn-danger" onclick="eliminarVehiculo('${v.matricula}')">Eliminar</button>
                    </td>`: '';
        const fila = `
                <tr>
                  <td><img src="/img/imgVehiculos/${v.imagen}" alt="Imagen del vehiculo" width="100"></td>
                  <td>${v.matricula}</td>
                  <td>${v.marca}</td>
                  <td>${v.modelo}</td>
                  <td>${v.año_matriculacion}</td>
                  <td>${v.numero_plazas}</td>
                  <td>${v.autonomia_km}</td>
                  <td>${v.color}</td>
                  <td>${v.id_concesionario}</td>
                  <td>${v.estado}</td>
                  <td>${v.tipo}</td>
                  <td>${v.precio_hora}</td>
                  ${accciones}
                </tr>`;

        tbody.innerHTML += fila;
    });
}

async function actualizarVehiculos() {
    const filtroTipo = document.getElementById("filtroTipo").value;
    const filtroCampo = document.getElementById("filtroCampo").value;
    const buscarInput = document.getElementById("buscar").value.trim();

    let url = `/vehiculos/api/vehiculos?`;

    // Utilizamos encoding para convertir caracteres especiales(/=<>&" ") en SEGUROS para la URL
    // y evitar ataques de inyección como XSS. Por ejemplo, buscar="<script>alert('xss')</script>"
    // se convierte en buscar="%3Cscript%3Ealert('xss')%3C/script%3E"
    if (filtroTipo)
        url += `filtroTipo=${encodeURIComponent(filtroTipo)}&`;

    if (filtroCampo && buscarInput)
        url += `filtroCampo=${encodeURIComponent(filtroCampo)}&buscar=${encodeURIComponent(buscarInput)}`;

    try {
        const data = await fetch(url);

        if (data.status === 200) {
            const vehiculos = await data.json();
            mostrarVehiculos(vehiculos);
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al cargar los vehiculos:", error);
        mostrarMensaje("Error al cargar los vehículos", "danger");
    }
}

async function eliminarVehiculo(id) {
    try {
        const data = await fetch(`/vehiculos/api/vehiculos/${id}`, {
            method: 'DELETE'
        });

        if (data.status === 200) {
            const response = await data.json();
            mostrarMensaje(response.mensaje, "success");
            actualizarVehiculos();
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarMensaje("Error al eliminar el vehiculo", "danger");
    }
}

async function cargarFiltros() {
    try {
        const res = await fetch("/vehiculos/api/filtros");
        const data = await res.json();

        llenarSelect("filtroColor", data.colores);
        llenarSelect("filtroModelo", data.modelos);
        llenarSelect("filtroPlazas", data.plazas);
        llenarSelect("filtroConcesionario", data.concesionarios);

    } catch (err) {
        console.error("Error cargando filtros", err);
    }
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML = `<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}
