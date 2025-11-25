"use strict";
const express = require("express"); // Módulo de express
const path = require("path"); // Módulo para ruta del directorio
const session = require("express-session"); // Módulo para sesiones
const expressLayouts = require("express-ejs-layouts"); // Módulo para layouts ejs 
const cookieParser = require("cookie-parser"); // Módulo para cookies
const { inicializarBD } = require("./config/initDB");

// Módulo de rutas
const vehiculosRouter = require("./routes/vehiculos");
const reservasRouter = require("./routes/reservas");
const { autenticarRouter } = require("./routes/autenticar");
const {router: adminRouter} = require("./routes/admin")

const app = express(); // creamos la aplicación de express
const PORT = 3000;

app.use(cookieParser());
app.use(express.json()); 

// Configuración de la sesión
const middlewareSesion = session({
    saveUninitialized: false,
    secret: "claveSecreta",
    resave: false,
    cookie: {
        secure: false,
        maxAge: null
    }
});

app.use(middlewareSesion);

app.use(function (request, response, next) {
    response.locals.session = request.session || {};
    response.locals.usuario = request.session.usuario || {};
    next();
})

// Para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Para parsear el body de las peticiones POST

// Motor de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use("/vehiculos", vehiculosRouter);
app.use("/reservas", reservasRouter);
app.use("/autenticar", autenticarRouter);
app.use("/admin", adminRouter);

// Ruta principal
app.get("/", function (request, response) {
    response.render("index", {
        titulo: "Gestión de Flota de Vehículos Eléctricos",
        estilo: "index.css",
        script: "",
        error: ""
    });
});

app.get("/cerrarSesion", function (request, response) {
    request.session.destroy();
    response.redirect("/");
})

// Gestión de errores
app.use(function (request, response, next) {
    response.status(404);
    response.render("error", { url: request.originalUrl });
});

app.use(function (error, request, response, next) {
    response.status(error.status || 500);
    response.send(error.message || "Error interno del servidor");
});

inicializarBD().then(() => {
    console.log("Base de datos lista.");

    app.listen(PORT, function (err) {
        if (err) {
            console.log("No se pudo inicializar el servidor:", err);
        } else {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        }
    });

}).catch(err => {
    console.error("ERROR inicializando la BD: ", err);
})
