
const http = require("http"); // importamos el módulo de http
const url = require("url"); // importamos el módulo de url

const PORT = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // objeto url
    const pathname = parsedUrl.pathname; // ultimo elemento de la cadena de la url

    if (pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<h1>Bienvenido al sistema de gestión de reservas de vehículos eléctricos</h1>')
    }

    else if (pathname === '/vehiculos') {

    }
});


server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})