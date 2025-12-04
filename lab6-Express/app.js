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
const { router: adminRouter } = require("./routes/admin");
const cargarJSONRouter = require("./routes/cargarJSON");
const concesionariosRouter = require("./routes/concesionarios");
const usuariosRouter = require("./routes/usuarios");

let bdVacia = false;

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
app.use("/admin", adminRouter);
app.use("/cargar-json", cargarJSONRouter);
app.use("/concesionarios", concesionariosRouter);
app.use("/usuarios", usuariosRouter);

// Ruta principal
app.get("/", function (request, response) {
    if (bdVacia) {
        return response.redirect("/cargar-json");
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

    bdVacia = info.vacia;

    app.listen(PORT, function (err) {
        if (err) {
            console.log("No se pudo inicializar el servidor:", err);
        } else {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        }
    });
});

// Obtener preferencias de sesión
app.get("/obtener-preferencias", function (request, response) {
    response.json(request.session.preferencias || {})
});

// Guardar preferencias
app.post("/guardar-preferencias", function (request, response) {
    const {clave, valor} = request.body;
    if(!request.session.preferencias) {
        request.session.preferencias = {};
    }
    request.session.preferencias[clave] = valor;
    response.json({ok: true});
})

