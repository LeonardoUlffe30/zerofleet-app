document.addEventListener("DOMContentLoaded", cargarReservas);

function cargarReservas() {
    fetch('/reservas/api/reservas')
        .then(response => response.json())
        .then(reservas => {
            const tbody = document.querySelector('#tablareservas tbody');
            tbody.innerHTML = '';
            reservas.forEach(r => {
                const fila =`
                <tr>
                  <td>${r.nombre}</td>
                  <td>${r.apellido}</td>
                  <td>${r.correo}</td>
                  <td>${r.telefono}</td>
                  <td>${r.fechaIni}</td>
                  <td>${r.horaIni}</td>
                  <td>${r.fechaFin}</td>
                  <td>${r.horaFin}</td>
                  <td>${r.duracion}</td>
                  <td>${r.tipo}</td>
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar las reservas:", error));
}