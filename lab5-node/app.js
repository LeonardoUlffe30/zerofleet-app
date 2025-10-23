
const http = require("http"); // importamos el módulo de http
const url = require("url"); // importamos el módulo de url
const fs = require("fs"); // importamos el módulo de sistema de archivos
const path = require("path"); // importamos el modulo de path

const PORT = 3000;

const publicPath = path.join(__dirname, "../lab5-node/public");

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true); // objeto url
    const pathname = parsedUrl.pathname; // ultimo elemento de la cadena de la url
    const method = req.method; // metodo (POST, GET, DELETE) de la petición

    if (pathname === '/') {
        const filePath = path.join(publicPath, "index.html");

        fs.readFile(filePath, { encoding: "utf8" }, (error, data) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Error al leer el archivo index</h1>');
                return;
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            }
        })
    }

    else if (pathname === '/vehiculos') {
        const filePath = path.join(publicPath, "vehiculos.html");
        const tipo = parsedUrl.query.tipo; // obtener el parámetro tipo de la consulta
        const vehiculos = [
            { matricula: '1234ABC', marca: 'Tesla', autonomia: '100km', tipo: 'coche' },
            { matricula: '5678DEF', marca: 'BMW', autonomia: '450km', tipo: 'coche' },
            { matricula: '9012GHI', marca: 'Yamaha', autonomia: '600km', tipo: 'moto' },
            { matricula: '3456JKL', marca: 'Audi', autonomia: '120km', tipo: 'coche' },
            { matricula: '7890MNO', marca: 'Ducati', autonomia: '100km', tipo: 'moto' }
        ]

        fs.readFile(filePath, { encoding: "utf8" }, (error, data) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Error al leer el archivo de vehículos</h1>');
                return;
            } else {
                const listaFiltrada = tipo
                    ? vehiculos.filter(v => v.tipo === tipo)
                    : vehiculos;

                const filas = listaFiltrada.map(v =>
                    `<tr>
                        <td>${v.matricula}</td>
                        <td>${v.marca}</td>
                        <td>${v.autonomia}</td>
                        <td>${v.tipo}</td>
                    </tr>`
                ).join("");

                const htmlFinal = data.replace(
                    "<!-- Aquí el servidor insertará filas dinámicamente -->",
                    filas
                );

                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(htmlFinal);;
            }
        });
    }

    else if (pathname === '/reserva' && method === "GET") {
        const filePath = path.join(publicPath, "reserva.html");

        fs.readFile(filePath, { encoding: "utf8" }, (error, data) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Error al leer el archivo de reservas</h1>');
                return;
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            }
        });
    }

    else if (pathname === '/reserva' && method === "POST") {
        let body = '';

        // El evento 'data' se dispara cuando se recibe un fragmento de datos. Datos llegan en framgentos
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir Buffer a string
        })

        // El evento 'end' indica que se han recibido todos los datos
        req.on('end', () => {
            // URLSearchParams para parsear body
            const params = new URLSearchParams(body);

            // Procesar los datos recibidos por el navegador con los campos del atributo name del formulario
            const nombre = params.get("nombre");
            const apellido = params.get("apellido");
            const correo = params.get("correo");
            const telefono = params.get("telefono");
            const vehiculo = params.get("lista-vehiculos");
            const fechaIni = params.get("fecha-ini");
            const horaIni = params.get("hora-ini");
            const fechaFin = params.get("fecha-fin");
            const horaFin = params.get("hora-fin");
            const duracion = params.get("duracion");

            console.log("Datos recibidos:");
            console.log(`Nombre: ${nombre}`);
            console.log(`Apellido: ${apellido}`);
            console.log(`Correo: ${correo}`);
            console.log(`Teléfono: ${telefono}`);
            console.log(`Vehículo: ${vehiculo}`);
            console.log(`Fecha Inicio: ${fechaIni}`);
            console.log(`Hora Inicio: ${horaIni}`);
            console.log(`Fecha Fin: ${fechaFin}`);
            console.log(`Hora Fin: ${horaFin}`);
            console.log(`Duración: ${duracion}`);

            res.writeHead(200, { "Content-type": "text/plain" });
            res.end("Datos recibidos de POST correctamente");
        })
    }

    // Bloque genérico para recursos estáticos
    else {
        const filePath = path.join(publicPath, pathname);

        fs.readFile(filePath, (error, data) => {
            if (error) {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>404 - Recurso no encontrado</h1>");
            } else {
                // Detectar tipo de contenido automaticamente (simplificado)
                let ext = path.extname(filePath);
                let contentType = "text/plain";

                switch (ext) {
                    case ".css": contentType = "text/css"; break;
                    case ".html": contentType = "text/html"; break;
                    case ".js": contentType = "application/javascript"; break;
                    case ".png": contentType = "image/png"; break;
                    case ".jpg": contentType = "image/jpeg"; break;
                    case ".jpeg": contentType = "image/jpeg"; break;
                    case ".ico": contentType = "image/x-icon"; break;
                }

                res.writeHead(200, { "Content-type": contentType });
                res.end(data);
            }
        })
    }

});


server.listen(PORT, (error) => {
    if (error) {
        console.log('Error al iniciar el servidor');
    } else {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    }
})