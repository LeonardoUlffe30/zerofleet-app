document.addEventListener("DOMContentLoaded", mostrarUsuarios);

// Inserta las etiquetas con los datos de los vehiculos en la tbody de la tabla
function mostrarUsuarios() {
    fetch('/admin/api/listarusuarios')
        .then(response => response.json())
        .then(usuarios => {
            const tbody = document.querySelector('#tablausuarios tbody');
            tbody.innerHTML = '';
            usuarios.forEach(u => {
                const fila =`
                <tr>
                  <td>${u.id_usuario}</td>
                  <td>${u.nombre}</td>
                  <td>${u.apellido}</td>
                  <td>${u.correo}</td>
                  <td>${u.rol}</td>
                  <td>${u.telefono}</td>
                  <td>${u.id_concesionario}</td>
                  <td>${u.prerefencias_accesibilidad}</td>
                  <td>${u.activo}</td>
                  <td class = "fit"><button class="btn btn-danger" onclick="editarUsuario('${u.id_usuario}')">Cambiar rol</button></td>
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar los usuarios:", error));
}

function editarUsuario(id_usuario) {
    const filas = document.querySelectorAll('#tablausuarios tbody tr');
    let filaSeleccionada = null;

    filas.forEach(fila => {
        if (fila.children[0].textContent.trim() === id_usuario) {
            filaSeleccionada = fila;
        }
    });

    // Leer el rol desde la quinta celda (index 4, empezando en 0)
    const rolActual = filaSeleccionada.children[4].textContent.trim();

    const nuevoRol = rolActual === "admin" ? "empleado" : "admin";
    console.log("hemos llegado aqui");
    fetch(`/admin/editar/${id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
    })
    .then(response => {
        if(!response.ok) {
            return false;
        }
        return true;
    })
    .then(sucess => {
        if(sucess) {
            mostrarMensaje("Rol actualizado de forma correcta", "success");
            mostrarUsuarios();
        }
    })
    .catch(error => {
            console.error("Error al cambiar el rol: " + error.message);
     })
}

function mostrarMensaje(mensaje, tipo) {
    const msg = document.getElementById("alertContainer");
    msg.innerHTML = `<div class = "alert alert-${tipo}" role = "alert">
      ${mensaje} </div>`;
}

