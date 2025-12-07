"use strict";
const express = require("express"); // Módulo de express
const path = require("path"); // Módulo para ruta del directorio
const session = require("express-session"); // Módulo para sesiones
const expressLayouts = require("express-ejs-layouts"); // Módulo para layouts ejs 
const cookieParser = require("cookie-parser"); // Módulo para cookies
const { inicializarBD } = require("./config/initDB");

// Estado global de la BD
const { getBDVacia, setBDVacia } = require("./config/estadoDB");

// Módulo de rutas
const vehiculosRouter = require("./routes/vehiculos");
const reservasRouter = require("./routes/reservas");
const { autenticarRouter } = require("./routes/autenticar");
const accesibilidadRouter = require("./routes/accesibilidad");
const cargarJSONRouter = require("./routes/cargarJSON");
const concesionariosRouter = require("./routes/concesionarios");
const usuariosRouter = require("./routes/usuarios");
const estadisticasRouter = require("./routes/estadisticas");

const app = express(); // creamos la aplicación de express
const PORT = 3000;

app.use(cookieParser());
app.use(express.json()); // reconocer objeto JSON de la petición y lo parse a objeto Javascript

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
app.use("/accesibilidad", accesibilidadRouter);
app.use("/cargar-json", cargarJSONRouter);
app.use("/concesionarios", concesionariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/estadisticas", estadisticasRouter);

// Ruta principal
app.get("/", function (request, response) {
    if (getBDVacia()) {
        return response.render("cargarJSON", {
            titulo: "Carga de JSON",
            estilo: "cargarJSON.css",
            script: "cargarJSON.js",
            error: ""
        });
    }

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
    response.render("error", {
        url: request.originalUrl,
        titulo: "Error 404",
        estilo: "",
        script: ""
    });
});

app.use(function (error, request, response, next) {
    response.status(error.status || 500);
    response.send(error.message || "Error interno del servidor");
});

inicializarBD((err, info) => {
    if (err) {
        console.log("Error inicializando BD:", err);
        process.exit(1);
    }

    setBDVacia(info.vacia);

    app.listen(PORT, function (err) {
        if (err) {
            console.log("No se pudo inicializar el servidor:", err);
        } else {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        }
    });
});
