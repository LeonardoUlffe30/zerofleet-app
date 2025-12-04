document.addEventListener("DOMContentLoaded", () => {
    const filtroMarca = document.getElementById("filtroMarca");
    const filtroColor = document.getElementById("filtroColor");
    const filtroConcesionario = document.getElementById("filtroConcesionario");
    const filtroPlazas = document.getElementById("filtroPlazas");
    const filtroAutonomia = document.getElementById("filtroAutonomia");
    const filtroTipo = document.getElementById("filtroTipo");

    // Si EJS ya mandó vehículos, mostrarlos SIN fetch
    if (vehiculosIniciales && vehiculosIniciales.length > 0) {
        mostrarVehiculos(vehiculosIniciales);
    }

    // Cargamos las opciones de los filtros en base a lo que esta en la base de datos
    cargarFiltros();

    filtroMarca.addEventListener("change", actualizarVehiculos);
    filtroColor.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarVehiculos, 300);
    });

    filtroConcesionario.addEventListener("change", actualizarVehiculos);
    filtroPlazas.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarVehiculos, 300);
    });
    filtroAutonomia.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarVehiculos, 2);
    });
    filtroTipo.addEventListener("change", actualizarVehiculos);
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
    let url = `/vehiculos/api/vehiculos?`;

    const filtros = {
        filtroMarca: document.getElementById("filtroMarca").value,
        filtroColor: document.getElementById("filtroColor").value.trim(),
        filtroConcesionario: document.getElementById("filtroConcesionario").value,
        filtroPlazas: document.getElementById("filtroPlazas").value,
        filtroAutonomia: document.getElementById("filtroAutonomia").value,
        filtroTipo: document.getElementById("filtroTipo").value
    }

    // Utilizamos encoding para convertir caracteres especiales(/=<>&" ") en SEGUROS para la URL
    // y evitar ataques de inyección como XSS. Por ejemplo, buscar="<script>alert('xss')</script>"
    // se convierte en buscar="%3Cscript%3Ealert('xss')%3C/script%3E"
    for (let key in filtros) {
        if (filtros[key]) {
            url += `${key}=${encodeURIComponent(filtros[key])}&`;
        }
    }

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

function aplicarFiltrosModal() {
    document.getElementById("filtroMarca").value =
        document.getElementById("filtroMarcaModal").value;

    document.getElementById("filtroColor").value =
        document.getElementById("filtroColorModal").value;

    document.getElementById("filtroConcesionario").value =
        document.getElementById("filtroConcesionarioModal").value;

    document.getElementById("filtroPlazas").value =
        document.getElementById("filtroPlazasModal").value;

    document.getElementById("filtroAutonomia").value =
        document.getElementById("filtroAutonomiaModal").value;

    document.getElementById("filtroTipo").value =
        document.getElementById("filtroTipoModal").value;

    setTimeout(actualizarVehiculos, 150);
}

async function cargarFiltros() {
    try {
        const res = await fetch("/vehiculos/api/filtros");
        const data = await res.json();

        // FILTROS DEL PANEL LATERAL
        llenarSelect("filtroMarca", data.marcas, "marca");
        llenarSelect("filtroTipo", data.tipos, "tipo");
        llenarSelect("filtroConcesionario", data.concesionarios, "nombre");

        // FILTROS DEL MODAL
        llenarSelect("filtroMarcaModal", data.marcas, "marca");
        llenarSelect("filtroTipoModal", data.tipos, "tipo");
        llenarSelect("filtroConcesionarioModal", data.concesionarios, "nombre");

    } catch (err) {
        console.error("Error cargando filtros", err);
    }
}

function llenarSelect(id, valores, key) {
    const select = document.getElementById(id);
    valores.forEach(v => {
        const option = document.createElement("option");
        option.value = v[key];
        option.textContent = v[key];
        select.appendChild(option);
    })
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML = `<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}
