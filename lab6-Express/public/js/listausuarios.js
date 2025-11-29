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
                </tr>`;

                tbody.innerHTML += fila;
            });
        }).catch(error => console.error("Error al cargar los usuarios:", error));
}
