document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formulario-iniciar-sesion");
    const correo = document.getElementById("correo");
    const contrasenia = document.getElementById("contrasenia");

    // Validar al enviar el formulario
    formulario.addEventListener("submit", procesarFormulario);

    function procesarFormulario(event) {
    event.preventDefault();

    const datosIniciarSesion = {
        correo: correo.value,
        contrasenia: contrasenia.value,
    }

    fetch(`/autenticar/iniciarSesion`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datosIniciarSesion)
    })
    .then(
            async response => {  //Espera el json
                const data = await response.json();
                const mensajeError = document.getElementById("mensajes");
                if(response.status === 400) {
                    mensajeError.innerHTML = data.errores.map(e => `
                        <div class="alert alert-danger" role="alert">
                        <p>${e.msg}</p>
                        </div>`).join("");
                    return false;
                }else if(response.status === 500) {
                    return false;
                }
                mensajeError.innerHTML = "";
                return true;
        })
        .then((sucess) => {
            if(sucess){
                formulario.reset();
                window.location.href = "/";
            }
        })
        .catch(error => {
            console.error("Error en iniciar sesion: " + error.message);
        })
    }

});
