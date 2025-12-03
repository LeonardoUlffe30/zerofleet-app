document.addEventListener("DOMContentLoaded", () => {
    const id_usuario = usuario ? usuario.id_usuario : null;
    cargarReservas(usuario.id_usuario);
});

function cargarReservas(id_usuario) {
    const url = id_usuario ? `/reservas/mis-reservas/${id_usuario}` : `/reservas/api/mis-reservas`
    console.log(`/reservas/mis-reservas/${id_usuario}`);
    fetch(url)
        .then(response => response.json())
        .then(reservas => {
            const tbody = document.querySelector('#tablareservas tbody');
            tbody.innerHTML = '';
            reservas.forEach(r => {
                console.log(r.id_reserva);
                const acciones = usuario ? `
                <td class = "fit">
                    <button class="btn btn-danger" onclick="cambiarEstado('${r.id_reserva}')">Cambiar estado</button>
                <td>`: '';
                const fila =`
                <tr>
                  <td>${r.id_reserva}</td>
                  <td>${r.id_usuario}</td>
                  <td>${r.id_vehiculo}</td>
                  <td>0</td>
                  <td>${r.fechaIni}</td>
                  <td>${r.fechaFin}</td>
                  <td>${r.estado}</td>
                  ${acciones}
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar las reservas:", error));
}

function cambiarEstado(id_reserva) {
    console.log("eliminarReserva");
    console.log(id_reserva);
    const filas = document.querySelectorAll('#tablareservas tbody tr');
    let filaSeleccionada = null;

    filas.forEach(fila => {
        if (fila.children[0].textContent.trim() === id_reserva) {
            filaSeleccionada = fila;
        }
    })
    const estadoActual = filaSeleccionada.children[5].textContent.trim();
    let estadoNuevo;
    if(estadoActual === "activo") {
        estadoNuevo = "finalizada";
    }else if(estadoActual === "finalizada"){
        estadoNuevo = "cancelada";
    }else if(estadoActual === "cancelada"){
        estadoNuevo = "activo";
    }

    fetch(`/reservas/editar/${id_reserva}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id_reserva, estado: estadoNuevo })
    })
    .then(response => {
        if(response.ok) {
            mostrarMensaje("Estado actualizado de forma correcta", "success");
            mostrarUsuarios();
        }else{
            mostrarMensaje("No se pudo actualizar el estado", "error");
        }
    })
    .catch(error => {
            console.error("Error al cambiar el estado: " + error.message);
     })
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML =`<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}

