document.addEventListener("DOMContentLoaded", () => {
    const filtro = document.getElementById("filtroVehiculo");
    cargarVehiculos();

    filtro.addEventListener("change", () => {
        cargarVehiculos(filtro.value);
    })
});

function cargarVehiculos(tipo = "") {
    const url = tipo ? '/vehiculos/api/vehiculos?tipo=${tipo}' : '/vehiculos/api/vehiculos';
    fetch(url)
        .then(response => response.json())
        .then(vehiculos => {
            const tbody = document.querySelector('#tablavehiculos tbody');
            tbody.innerHTML = '';
            vehiculos.forEach(v => {
                const accciones = (usuario && usuario.tipo === "admin") ? `
                    <td class = "fit">
                        <a href ="/vehiculos/${v.id}/editar" class="btn btn-light">Editar</a>
                        <a href ="/vehiculos/${v.id}/eliminar" class="btn btn-danger"> Eliminar</a>
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