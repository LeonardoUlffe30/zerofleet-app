function verificarUsuario(request, response, next) {
    if (request.session?.usuario) return next();

    return response.status(401).redirect("/autenticar/iniciarSesion");
}

function verificarAdmin(request, response, next) {
    if (request.session?.usuario?.rol === "admin") return next();

    return response.status(403).send("Acceso denegado: se requiere rol administrador.");
}

module.exports = { verificarUsuario, verificarAdmin };