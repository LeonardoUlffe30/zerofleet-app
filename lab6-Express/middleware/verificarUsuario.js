function verificarUsuario(request, response, next) {
    if (!req.session.usuario) {
        return response.redirect("/autenticar/iniciarSesion");
    }
    next();
}

module.exports = { verificarUsuario };