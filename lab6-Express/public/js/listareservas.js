document.addEventListener("DOMContentLoaded", cargarReservas);

function cargarReservas() {
    console.log("22222222111111111111");
    fetch('/reservas/api/listareservas')
        .then(response => response.json())
        .then(reservas => {
            const tbody = document.querySelector('#tablaReservas tbody');
            tbody.innerHTML = '';
            reservas.forEach(r => {
                console.log(r.id_reserva);
                const acciones = usuario ? `
                <td class = "fit">
                    <button class="btn btn-danger" onclick="cambiarEstado('${r.id_reserva}')">Cambiar estado</button>
                <td>`: '';
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
                  ${acciones}
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar las reservas:", error));
}

function cambiarEstado(id) {
    console.log("eliminarReserva");
    console.log(id);
    fetch(`/reserva/api/reservas/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
         if(response.status === 200) {
            console.log("200Ç");
                response.json().then(data =>{
                     mostrarMensaje(data.mensaje, "success");
                })
                cargarReservas();
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