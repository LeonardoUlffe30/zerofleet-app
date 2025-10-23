
const http = require("http"); // importamos el módulo de http
const url = require("url"); // importamos el módulo de url
const fs = require("fs"); // importamos el módulo de sistema de archivos

const PORT = 3000;

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true); // objeto url
    const pathname = parsedUrl.pathname; // ultimo elemento de la cadena de la url

    if (pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<h1>Bienvenido al sistema de gestión de reservas de vehículos eléctricos</h1>')
    }

    else if (pathname === '/vehiculos') {
        const tipo = parsedUrl.query.tipo; // obtener el parámetro tipo de la consulta


        const vehiculos = [
            { marca: 'MarcaA', modelo: 'Modelo1', autonomia: '100km', tipo: 'coche' },
            { marca: 'MarcaB', modelo: 'Modelo1', autonomia: '100km', tipo: 'coche' },
            { marca: 'MarcaC', modelo: 'Modelo1', autonomia: '100km', tipo: 'moto' },
            { marca: 'MarcaD', modelo: 'Modelo1', autonomia: '100km', tipo: 'coche' },
            { marca: 'MarcaE', modelo: 'Modelo1', autonomia: '100km', tipo: 'coche' }
        ]

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title> Lista de Vehículos </title>
            </head>    
            <body>
            <ul>
            `;
        if (tipo) {
            vehiculos.filter(v => v.tipo === tipo).forEach(function (v) {
                html += `<li>Marca: ${v.marca}, Modelo ${v.modelo}, Autonomia: ${v.autonomia}, Tipo: ${v.tipo}</li>`;
            });

        } else {
            vehiculos.forEach(function (v) {
                html += `<li>Marca: ${v.marca}, Modelo ${v.modelo}, Autonomia: ${v.autonomia}, Tipo: ${v.tipo}</li>`;
            });
        }

        html += `
            </ul>
            </body>    
            </html>`;

        res.setHeader('Content-Type', 'text/html');
        res.write(html);
        res.end()

    }

    else if (pathname === '/reservas') {
        fs.readFile('./public/reservas.html', 'utf8', (err, data) => {
            if (err) {
                res.setHeader('Content-Type', 'text/html');
                res.statusCode = 500;
                res.write('<h1>Error al leer el archivo de reservas</h1>');
                res.end();
                return;
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.write(data);
                res.end();
            }
        });
    }
});


server.listen(PORT, (error) => {
    if (error) {
        console.log('Error al iniciar el servidor');
    } else {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    }
})