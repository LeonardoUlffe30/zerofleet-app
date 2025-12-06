document.addEventListener("DOMContentLoaded", function () {

    fetch("/estadisticas/api")
    .then(response => {
        if (!response.ok) throw new Error("Error cargando estadísticas");
        return response.json();
    })
    .then(data => {
        mostrarTotalReservas(data.totalReservas);
        mostrarVehiculoMasUsado(data.vehiculoMasUsado);
        mostrarReservasPorConcesionario(data.concesionarios);
    })
    .catch(error => {
        console.error(error);
    });
});

function mostrarReservasPorConcesionario(concesionarios) {
    const tbody = document.querySelector('#tablaConcesionarios tbody');
    tbody.innerHTML = '';

    concesionarios.forEach(c => {
        const fila = `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.reservas}</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

function mostrarVehiculoMasUsado(vehiculo) {
    const vehiculoDiv = document.getElementById("vehiculosMasUsado");
    if (!vehiculo) {
        vehiculoDiv.textContent = "N/A";
        return;
    }

    vehiculoDiv.innerHTML = `
        <p class="h4 mb-1">${vehiculo.nombre}</p>
        <small>Reservas: ${vehiculo.reservas}</small>
    `;
}

function mostrarTotalReservas(total) {
    const totalDiv = document.getElementById("totalReservas");
    totalDiv.textContent = total || 0;
}

