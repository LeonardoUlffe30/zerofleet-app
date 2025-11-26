document.addEventListener("DOMContentLoaded", () => {
    const filtro = document.getElementById("filtroVehiculo");
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
                const accciones = (usuario && usuario.tipo === "admin") ? `
                    <td class = "fit">
                        <a href ="/vehiculos/${v.id}/editar" class="btn btn-light">Editar</a>
                        <button class="btn btn-danger" onclick="eliminarVehiculo(${v.id})">Eliminar</button>
                    </td>`: '';
                const fila =`
                <tr>
                  <td><img src="/img/imgVehiculos/${v.imagen}" alt="Imagen del vehiculo" width="100"></td>
                  <td>${v.id}</td>
                  <td>${v.marca}</td>
                  <td>${v.autonomia}</td>
                  <td>${v.tipo}</td>
                  <td>${v.modelo}</td>
                  ${accciones}
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar los vehiculos:", error));
}

function eliminarVehiculo(id) {
    fetch("/vehiculos/api/vehiculos/${id}", {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            cargarVehiculos();
        } 
    })
    .catch(error => console.error("Error al eliminar:", error));
}