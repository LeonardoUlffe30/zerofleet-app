document.addEventListener("DOMContentLoaded", () => {
    const filtroRol = document.getElementById("filtroRol");
    const filtroCampo = document.getElementById("filtroCampo");
    const buscarInput = document.getElementById("buscar");

    // Si EJS ya mandó usuarios, mostrarlos SIN fetch
    if (usuariosIniciales && usuariosIniciales.length > 0) {
        mostrarUsuarios(usuariosIniciales);
    }

    filtroRol.addEventListener("change", actualizarUsuarios);
    filtroCampo.addEventListener("change", actualizarUsuarios);
    buscarInput.addEventListener("input", () => {
        // Cancelamos el timer anterior si existe
        clearTimeout(window.delayBuscador);

        // Retardo de 300ms para no hacer fetch inmediato en cada letra que escribe el usuario
        window.delayBuscador = setTimeout(actualizarUsuarios, 300);
    });
});

// Inserta las etiquetas con los datos de los usuarios en la tbody de la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const accciones = (usuario && usuario.rol === "admin") ? `
                    <td class = "fit">
                        <a href ="/usuarios/${u.id_usuario}/editar" class="btn btn-light">Editar</a>
                        <button class="btn btn-danger" onclick="eliminarUsuario('${u.id_usuario}')">Eliminar</button>
                    </td>`: '';
        const fila = `
                <tr>
                  <td>${u.nombre}</td>
                  <td>${u.apellido}</td>
                  <td>${u.correo}</td>
                  <td>${u.rol}</td>
                  <td>${u.telefono}</td>
                  <td>${u.id_concesionario}</td>
                  <td>${u.preferencias_accesibilidad}</td>
                  <td>${u.activo}</td>
                  ${accciones}
                </tr>`;

        tbody.innerHTML += fila;
    })
}

async function actualizarUsuarios() {
    const filtroRol = document.getElementById("filtroRol").value;
    const filtroCampo = document.getElementById("filtroCampo").value;
    const buscarInput = document.getElementById("buscar").value.trim();

    let url = `/usuarios/api/usuarios?`;

    // Utilizamos encoding para convertir caracteres especiales(/=<>&" ") en SEGUROS para la URL
    // y evitar ataques de inyección como XSS. Por ejemplo, buscar="<script>alert('xss')</script>"
    // se convierte en buscar="%3Cscript%3Ealert('xss')%3C/script%3E"
    if (filtroRol)
        url += `filtroRol=${encodeURIComponent(filtroRol)}&`;

    if (filtroCampo && buscarInput)
        url += `filtroCampo=${encodeURIComponent(filtroCampo)}&buscar=${encodeURIComponent(buscarInput)}`;

    try {
        const data = await fetch(url);

        if (data.status === 200) {
            const usuarios = await data.json();
            mostrarUsuarios(usuarios);
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
        mostrarMensaje("Error al cargar los usuarios", "danger");
    }
}

async function eliminarUsuario(id) {
    try {
        const data = await fetch(`/usuarios/api/usuarios/${id}`, {
            method: 'DELETE'
        });

        if (data.status === 200) {
            const response = await data.json();
            mostrarMensaje(response.mensaje, "success");
            actualizarUsuarios();
        } else throw new Error(`HTTP error! status: ${data.status}`);

    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarMensaje("Error al eliminar el usuario", "danger");
    }
}

function editarUsuario(id_usuario) {
    const filas = document.querySelectorAll('#tablausuarios tbody tr');
    let filaSeleccionada = null;

    filas.forEach(fila => {
        if (fila.children[0].textContent.trim() === id_usuario) {
            filaSeleccionada = fila;
        }
    });

    // Leer el rol desde la quinta celda 
    const rolActual = filaSeleccionada.children[4].textContent.trim();

    const nuevoRol = rolActual === "admin" ? "empleado" : "admin";
    fetch(`/admin/editar/${id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
    })
        .then(response => {
            if (!response.ok) {
                return false;
            }
            return true;
        })
        .then(sucess => {
            if (sucess) {
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

