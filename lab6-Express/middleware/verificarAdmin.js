function verificarAdmin(request, response, next) {
    if (!request.session.usuario || request.session.usuario.rol !== "admin") {
        return response.status(403).send("Acceso denegado: se requiere rol administrador.");
    }
    next();
}

module.exports = { verificarAdmin };