document.addEventListener("DOMContentLoaded", () => {
    const filtro = document.getElementById("filtroTipo");
    cargarVehiculos();

    filtro.addEventListener("change", () => {
        cargarVehiculos(filtro.value);
    })
});

function cargarVehiculos(tipo) {
    let url = `/vehiculos/api/vehiculos`;
    if (tipo) {
        url += `?tipo=${tipo}`;
    }
    fetch(url)
        .then(response => response.json())
        .then(vehiculos => {
            const tbody = document.querySelector('#tablavehiculos tbody');
            tbody.innerHTML = '';
            vehiculos.forEach(v => {
                console.log(v.matricula);
                const accciones = (usuario && usuario.tipo === "admin") ? `
                    <td class = "fit">
                        <a href ="/vehiculos/${v.id}/editar" class="btn btn-light">Editar</a>
                        <button class="btn btn-danger" onclick="eliminarVehiculo('${v.id}')">Eliminar</button>
                    </td>`: '';
                const fila = `
                <tr>
                  <td><img src="/img/imgVehiculos/${v.imagen}" alt="Imagen del vehiculo" width="100"></td>
                  <td>${v.id}</td>
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
        }).catch(error => {
            console.error("Error al cargar los vehiculos:", error);
            mostrarMensaje("Error al cargar los vehiculos", "danger");
        });
}

function eliminarVehiculo(id) {
    fetch(`/vehiculos/api/vehiculos/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if(response.status === 200) {
                response.json().then(data =>{
                     mostrarMensaje(data.mensaje, "success");
                })
                cargarVehiculos();
            }else {
                response.json().then(data =>{
                     mostrarMensaje(data.error, "warning");
                })
            }
        })
        .catch(error => console.error("Error al eliminar:", error));
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML =`<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}
